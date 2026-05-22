import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["ADMIN", "USER"]);
export const personKindEnum = pgEnum("person_kind", ["REAL", "FICTIONAL"]);
export const recordStatusEnum = pgEnum("record_status", [
  "ACTIVE",
  "DISABLED",
  "DELETED",
]);
export const slotStatusEnum = pgEnum("slot_status", [
  "PENDING",
  "USED",
  "DISABLED",
  "EXPIRED",
]);
export const nicknameStatusEnum = pgEnum("nickname_status", [
  "TEMPORARY",
  "APPROVED",
  "DELETED",
]);
export const proposalTypeEnum = pgEnum("proposal_type", [
  "ADD_NICKNAME",
  "REMOVE_NICKNAME",
  "ADD_IMAGE",
  "REMOVE_POST",
  "CREATE_FICTIONAL_PERSON",
  "UPDATE_SITE_COPY",
  "GENERIC_CHANGE",
]);
export const proposalStatusEnum = pgEnum("proposal_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "APPLIED",
]);
export const voteDecisionEnum = pgEnum("vote_decision", ["APPROVE", "REJECT"]);
export const commentSubjectEnum = pgEnum("comment_subject", [
  "PERSON",
  "PROPOSAL",
  "POST",
  "MEDIA",
]);
export const mediaStatusEnum = pgEnum("media_status", [
  "APPROVED",
  "PENDING",
  "DELETED",
]);
export const moderationStatusEnum = pgEnum("moderation_status", [
  "OPEN",
  "RESOLVED",
  "DISMISSED",
]);

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: roleEnum("role").notNull().default("USER"),
  disabled: boolean("disabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const people = pgTable(
  "people",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    kind: personKindEnum("kind").notNull(),
    status: recordStatusEnum("status").notNull().default("ACTIVE"),
    initialDisplayName: text("initial_display_name").notNull(),
    fullName: text("full_name"),
    bio: text("bio").notNull().default(""),
    description: text("description").notNull().default(""),
    phrase: text("phrase").notNull().default(""),
    themeColor: text("theme_color").notNull().default("#1f8a70"),
    avatarMediaId: text("avatar_media_id"),
    bannerMediaId: text("banner_media_id"),
    primaryNicknameId: text("primary_nickname_id"),
    createdByUserId: text("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("people_user_id_unique").on(table.userId),
    index("people_kind_idx").on(table.kind),
  ],
);

export const registrationSlots = pgTable(
  "registration_slots",
  {
    id: text("id").primaryKey(),
    shortName: text("short_name").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    status: slotStatusEnum("status").notNull().default("PENDING"),
    createdByUserId: text("created_by_user_id").references(() => users.id),
    usedByUserId: text("used_by_user_id").references(() => users.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("registration_slots_status_idx").on(table.status)],
);

export const nicknames = pgTable(
  "nicknames",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    status: nicknameStatusEnum("status").notNull().default("APPROVED"),
    isTemporary: boolean("is_temporary").notNull().default(false),
    proposedByUserId: text("proposed_by_user_id").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("nicknames_person_id_idx").on(table.personId),
    uniqueIndex("nicknames_person_value_unique").on(table.personId, table.value),
  ],
);

export const proposals = pgTable(
  "proposals",
  {
    id: text("id").primaryKey(),
    type: proposalTypeEnum("type").notNull(),
    status: proposalStatusEnum("status").notNull().default("PENDING"),
    targetPersonId: text("target_person_id").references(() => people.id, {
      onDelete: "set null",
    }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    payload: jsonb("payload").notNull().default({}),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("proposals_status_idx").on(table.status),
    index("proposals_target_person_idx").on(table.targetPersonId),
  ],
);

export const proposalVotes = pgTable(
  "proposal_votes",
  {
    id: text("id").primaryKey(),
    proposalId: text("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    decision: voteDecisionEnum("decision").notNull(),
    comment: text("comment").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("proposal_votes_once_unique").on(table.proposalId, table.userId),
    index("proposal_votes_proposal_idx").on(table.proposalId),
  ],
);

export const proposalComments = pgTable("proposal_comments", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  authorUserId: text("author_user_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    profilePersonId: text("profile_person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => users.id),
    parentPostId: text("parent_post_id"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("posts_profile_idx").on(table.profilePersonId),
    index("posts_parent_idx").on(table.parentPostId),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    subjectType: commentSubjectEnum("subject_type").notNull(),
    subjectId: text("subject_id").notNull(),
    parentCommentId: text("parent_comment_id"),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("comments_subject_idx").on(table.subjectType, table.subjectId)],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    uploadedByUserId: text("uploaded_by_user_id")
      .notNull()
      .references(() => users.id),
    status: mediaStatusEnum("status").notNull().default("APPROVED"),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    pathname: text("pathname").notNull(),
    thumbnailPathname: text("thumbnail_pathname").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text").notNull().default(""),
    proposedViaProposalId: text("proposed_via_proposal_id").references(
      () => proposals.id,
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("media_assets_person_idx").on(table.personId)],
);

export const dailyNicknameNominations = pgTable(
  "daily_nickname_nominations",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    nicknameId: text("nickname_id")
      .notNull()
      .references(() => nicknames.id, { onDelete: "cascade" }),
    nominatedByUserId: text("nominated_by_user_id")
      .notNull()
      .references(() => users.id),
    forDate: date("for_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_nomination_once_unique").on(
      table.nicknameId,
      table.nominatedByUserId,
      table.forDate,
    ),
  ],
);

export const dailyNicknameAssignments = pgTable(
  "daily_nickname_assignments",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    nicknameId: text("nickname_id")
      .notNull()
      .references(() => nicknames.id, { onDelete: "cascade" }),
    forDate: date("for_date").notNull(),
    source: text("source").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_assignment_unique").on(table.personId, table.forDate),
  ],
);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id),
    personId: text("person_id").references(() => people.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("activity_events_created_idx").on(table.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId)],
);

export const moderationActions = pgTable("moderation_actions", {
  id: text("id").primaryKey(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  status: moderationStatusEnum("status").notNull().default("OPEN"),
  reason: text("reason").notNull().default(""),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id),
  resolvedByUserId: text("resolved_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const postMedia = pgTable(
  "post_media",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaId: text("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.mediaId] })],
);

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull().default({}),
  updatedByUserId: text("updated_by_user_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
