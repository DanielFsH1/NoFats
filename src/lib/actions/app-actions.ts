"use server";

import { getDb } from "@/lib/db";
import {
  activityEvents,
  auditLogs,
  comments,
  dailyNicknameNominations,
  mediaAssets,
  nicknames,
  people,
  posts,
  proposalComments,
  proposals,
  proposalVotes,
  registrationSlots,
  users,
} from "@/lib/db/schema";
import { getVotingThreshold } from "@/lib/data/queries";
import { deleteImageProposalBlobs } from "@/lib/data/media-cleanup";
import { rejectExpiredProposals } from "@/lib/data/proposal-expiration";
import {
  getAppSettings,
  saveSiteCopy,
  saveVoteSettings,
} from "@/lib/data/settings";
import { id } from "@/lib/ids";
import { getTomorrowDateKey } from "@/lib/product/dates";
import { getProposalVoteReadiness } from "@/lib/product/proposal-voting";
import {
  canAddNicknameDirectly,
  canManagePerson,
  getProposalThresholds,
  hasDuplicateNicknameValue,
  mergeSiteCopy,
  normalizeNicknameValue,
  normalizeVoteSettings,
  shouldReplacePrimaryNickname,
} from "@/lib/product/rules";
import { createInviteToken, hashInviteToken } from "@/lib/security/token";
import { requireAdmin, requireUser } from "@/lib/session";
import { getBaseUrl } from "@/lib/urls";
import {
  bodySchema,
  getString,
  profileSchema,
  shortTextSchema,
  siteCopySchema,
  voteSettingsSchema,
} from "@/lib/validation";
import { and, count, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function appUrl() {
  return getBaseUrl();
}

async function logActivity(input: {
  actorUserId?: string;
  personId?: string;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  await getDb()
    .insert(activityEvents)
    .values({
      id: id("act"),
      actorUserId: input.actorUserId,
      personId: input.personId,
      type: input.type,
      message: input.message,
      metadata: input.metadata ?? {},
    });
}

async function audit(input: {
  actorUserId?: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
}) {
  await getDb()
    .insert(auditLogs)
    .values({
      id: id("audit"),
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      before: input.before,
      after: input.after,
    });
}

async function promoteApprovedNicknameIfNeeded(
  target: typeof people.$inferSelect,
  nicknameId: string,
) {
  const db = getDb();
  const [primaryNickname] = target.primaryNicknameId
    ? await db
        .select({
          status: nicknames.status,
          isTemporary: nicknames.isTemporary,
        })
        .from(nicknames)
        .where(eq(nicknames.id, target.primaryNicknameId))
        .limit(1)
    : [];

  if (!shouldReplacePrimaryNickname(primaryNickname)) {
    return;
  }

  await db
    .update(people)
    .set({ primaryNicknameId: nicknameId, updatedAt: new Date() })
    .where(eq(people.id, target.id));
}

async function assertNicknameIsUnique(
  personId: string,
  value: string,
  options: { excludeProposalId?: string } = {},
) {
  const db = getDb();
  const [existingNicknames, pendingNicknameProposals] = await Promise.all([
    db
      .select({ value: nicknames.value })
      .from(nicknames)
      .where(
        and(eq(nicknames.personId, personId), isNull(nicknames.deletedAt)),
      ),
    db
      .select({ id: proposals.id, payload: proposals.payload })
      .from(proposals)
      .where(
        and(
          eq(proposals.targetPersonId, personId),
          eq(proposals.type, "ADD_NICKNAME"),
          eq(proposals.status, "PENDING"),
        ),
      ),
  ]);
  const pendingValues = pendingNicknameProposals
    .filter((proposal) => proposal.id !== options.excludeProposalId)
    .map((proposal) => {
      const payload = proposal.payload as { value?: unknown };
      return typeof payload.value === "string" ? payload.value : "";
    })
    .filter(Boolean);

  if (
    hasDuplicateNicknameValue(
      [
        ...existingNicknames.map((nickname) => nickname.value),
        ...pendingValues,
      ],
      normalizeNicknameValue(value),
    )
  ) {
    throw new Error(
      "Ese apodo ya existe o ya esta propuesto para este perfil.",
    );
  }
}

async function findExistingNicknameId(personId: string, value: string) {
  const existingNicknames = await getDb()
    .select({ id: nicknames.id, value: nicknames.value })
    .from(nicknames)
    .where(and(eq(nicknames.personId, personId), isNull(nicknames.deletedAt)));
  const normalizedValue = normalizeNicknameValue(value);

  return (
    existingNicknames.find(
      (nickname) => normalizeNicknameValue(nickname.value) === normalizedValue,
    )?.id ?? null
  );
}

async function findNicknameIdByExactValue(personId: string, value: string) {
  const [nickname] = await getDb()
    .select({ id: nicknames.id })
    .from(nicknames)
    .where(and(eq(nicknames.personId, personId), eq(nicknames.value, value)))
    .limit(1);

  return nickname?.id ?? null;
}

async function createPendingProposalWithCreatorApproval(input: {
  type: typeof proposals.$inferInsert.type;
  targetPersonId?: string;
  createdByUserId: string;
  title: string;
  summary?: string;
  payload: Record<string, unknown>;
}) {
  const db = getDb();
  const proposalId = id("proposal");

  await db.insert(proposals).values({
    id: proposalId,
    type: input.type,
    status: "PENDING",
    targetPersonId: input.targetPersonId,
    createdByUserId: input.createdByUserId,
    title: input.title,
    summary: input.summary ?? "",
    payload: input.payload,
  });

  await db
    .insert(proposalVotes)
    .values({
      id: id("vote"),
      proposalId,
      userId: input.createdByUserId,
      decision: "APPROVE",
      comment: "Apoyo inicial al crear la propuesta.",
    })
    .onConflictDoNothing();

  await evaluateProposal(proposalId);

  return proposalId;
}

async function createPendingProposal(input: {
  type: typeof proposals.$inferInsert.type;
  targetPersonId?: string;
  createdByUserId: string;
  title: string;
  summary?: string;
  payload: Record<string, unknown>;
}) {
  const proposalId = id("proposal");

  await getDb()
    .insert(proposals)
    .values({
      id: proposalId,
      type: input.type,
      status: "PENDING",
      targetPersonId: input.targetPersonId,
      createdByUserId: input.createdByUserId,
      title: input.title,
      summary: input.summary ?? "",
      payload: input.payload,
    });

  return proposalId;
}

export async function createRegistrationSlotAction(formData: FormData) {
  const { user } = await requireAdmin();
  const shortName = shortTextSchema.parse(getString(formData, "shortName"));
  const token = createInviteToken();
  const slotId = id("slot");

  await getDb()
    .insert(registrationSlots)
    .values({
      id: slotId,
      shortName,
      tokenHash: hashInviteToken(token),
      createdByUserId: user.id,
    });

  await logActivity({
    actorUserId: user.id,
    type: "admin.slot_created",
    message: `Se creo un cupo para ${shortName}.`,
  });

  redirect(
    `/admin?invite=${encodeURIComponent(`${appUrl()}/invite/${token}`)}`,
  );
}

export async function disableRegistrationSlotAction(formData: FormData) {
  const { user } = await requireAdmin();
  const slotId = getString(formData, "slotId");

  await getDb()
    .update(registrationSlots)
    .set({ status: "DISABLED", updatedAt: new Date() })
    .where(eq(registrationSlots.id, slotId));

  await audit({
    actorUserId: user.id,
    entityType: "registration_slot",
    entityId: slotId,
    action: "disabled",
  });

  revalidatePath("/admin");
}

export async function createFictionalPersonAction(formData: FormData) {
  const { user } = await requireAdmin();
  const displayName = shortTextSchema.parse(getString(formData, "displayName"));
  const fullName = getString(formData, "fullName").trim();
  const personId = id("person");

  await getDb().insert(people).values({
    id: personId,
    kind: "FICTIONAL",
    initialDisplayName: displayName,
    fullName,
    createdByUserId: user.id,
  });

  await logActivity({
    actorUserId: user.id,
    personId,
    type: "person.fictional_created",
    message: `Se creo el perfil ${displayName}.`,
  });

  revalidatePath("/admin");
  revalidatePath("/people");
}

export async function proposeFictionalPersonAction(formData: FormData) {
  const { user } = await requireUser();
  const displayName = shortTextSchema.parse(getString(formData, "displayName"));
  const fullName = getString(formData, "fullName").trim();

  await createPendingProposalWithCreatorApproval({
    type: "CREATE_FICTIONAL_PERSON",
    createdByUserId: user.id,
    title: `Crear "${displayName}"`,
    summary: fullName,
    payload: { displayName, fullName },
  });

  await logActivity({
    actorUserId: user.id,
    type: "proposal.created",
    message: `${user.name} propuso crear ${displayName}.`,
  });

  revalidatePath("/proposals");
}

export async function proposeSiteCopyAction(formData: FormData) {
  const { user } = await requireUser();
  const copy = siteCopySchema.parse({
    appName: getString(formData, "appName"),
    loginEyebrow: getString(formData, "loginEyebrow"),
    loginHeroTitle: getString(formData, "loginHeroTitle"),
    loginHeroSubtitle: getString(formData, "loginHeroSubtitle"),
    dashboardTitle: getString(formData, "dashboardTitle"),
    dashboardSubtitle: getString(formData, "dashboardSubtitle"),
  });

  await createPendingProposalWithCreatorApproval({
    type: "UPDATE_SITE_COPY",
    createdByUserId: user.id,
    title: "Cambiar textos principales",
    summary: copy.loginHeroTitle,
    payload: { siteCopy: copy },
  });

  await logActivity({
    actorUserId: user.id,
    type: "proposal.created",
    message: `${user.name} propuso nuevos textos para la web.`,
  });

  revalidatePath("/proposals");
}

export async function updateSiteCopyFieldAction(formData: FormData) {
  const { user } = await requireUser();
  const before = await getAppSettings();
  const field = getString(formData, "field");
  const value = getString(formData, "value");
  const allowedFields = [
    "appName",
    "loginEyebrow",
    "loginHeroTitle",
    "loginHeroSubtitle",
    "dashboardTitle",
    "dashboardSubtitle",
  ] as const;

  if (!allowedFields.includes(field as (typeof allowedFields)[number])) {
    throw new Error("Texto no editable.");
  }

  const copy = siteCopySchema.parse({
    ...before.siteCopy,
    [field]: value,
  });

  await saveSiteCopy(copy, user.id);
  await audit({
    actorUserId: user.id,
    entityType: "app_setting",
    entityId: "site_copy",
    action: "settings.site_copy_field_updated",
    before: before.siteCopy,
    after: copy,
  });
  await logActivity({
    actorUserId: user.id,
    type: "settings.site_copy_field_updated",
    message: `${user.name} edito un texto de la web.`,
    metadata: { field },
  });

  revalidatePath("/");
  revalidatePath("/login");
  revalidatePath("/admin");
  revalidatePath("/proposals");
}

export async function updateSiteCopyAction(formData: FormData) {
  const { user } = await requireAdmin();
  const before = await getAppSettings();
  const copy = siteCopySchema.parse({
    appName: getString(formData, "appName"),
    loginEyebrow: getString(formData, "loginEyebrow"),
    loginHeroTitle: getString(formData, "loginHeroTitle"),
    loginHeroSubtitle: getString(formData, "loginHeroSubtitle"),
    dashboardTitle: getString(formData, "dashboardTitle"),
    dashboardSubtitle: getString(formData, "dashboardSubtitle"),
  });

  await saveSiteCopy(copy, user.id);
  await audit({
    actorUserId: user.id,
    entityType: "app_setting",
    entityId: "site_copy",
    action: "settings.site_copy_updated",
    before: before.siteCopy,
    after: copy,
  });
  await logActivity({
    actorUserId: user.id,
    type: "settings.site_copy_updated",
    message: `${user.name} actualizo los textos principales de la web.`,
  });

  revalidatePath("/");
  revalidatePath("/login");
  revalidatePath("/admin");
}

export async function updateVoteSettingsAction(formData: FormData) {
  const { user } = await requireAdmin();
  const before = await getAppSettings();
  const settings = normalizeVoteSettings(
    voteSettingsSchema.parse({
      approvalPercentage: getString(formData, "approvalPercentage"),
      rejectionPercentage: getString(formData, "rejectionPercentage"),
    }),
  );

  await saveVoteSettings(settings, user.id);
  await audit({
    actorUserId: user.id,
    entityType: "app_setting",
    entityId: "voting",
    action: "settings.voting_updated",
    before: before.voteSettings,
    after: settings,
  });
  await logActivity({
    actorUserId: user.id,
    type: "settings.voting_updated",
    message: `${user.name} cambio los umbrales a ${settings.approvalPercentage}% / ${settings.rejectionPercentage}%.`,
  });

  revalidatePath("/admin");
  revalidatePath("/proposals");
}

export async function updateProfileAction(formData: FormData) {
  const { user } = await requireUser();
  const personId = getString(formData, "personId");
  const db = getDb();
  const [target] = await db
    .select()
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);

  if (!target) {
    throw new Error("Perfil no encontrado.");
  }

  if (
    !canManagePerson({
      actor: { id: user.id, role: user.role },
      target: { kind: target.kind, userId: target.userId },
    })
  ) {
    throw new Error("No tienes permiso para editar este perfil.");
  }

  const parsed = profileSchema.parse({
    fullName: getString(formData, "fullName"),
    bio: getString(formData, "bio"),
    description: getString(formData, "description"),
    phrase: getString(formData, "phrase"),
    themeColor: getString(formData, "themeColor") || undefined,
    themeStyle: getString(formData, "themeStyle") || undefined,
  });

  await db
    .update(people)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(people.id, personId));

  await audit({
    actorUserId: user.id,
    entityType: "person",
    entityId: personId,
    action: "profile.updated",
    before: target,
    after: parsed,
  });

  await logActivity({
    actorUserId: user.id,
    personId,
    type: "person.updated",
    message: `${user.name} actualizo el perfil.`,
  });

  revalidatePath(`/people/${personId}`);
}

export async function addNicknameAction(formData: FormData) {
  const { user } = await requireUser();
  const personId = getString(formData, "personId");
  const value = shortTextSchema.parse(getString(formData, "nickname"));
  const db = getDb();
  const [target] = await db
    .select()
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);

  if (!target) {
    throw new Error("Perfil no encontrado.");
  }

  await assertNicknameIsUnique(personId, value);

  const canDirectlyEdit = canAddNicknameDirectly({
    actor: { id: user.id, role: user.role },
    target: { kind: target.kind, userId: target.userId },
  });

  if (canDirectlyEdit) {
    const nicknameId = id("nick");
    await db.insert(nicknames).values({
      id: nicknameId,
      personId,
      value,
      status: "APPROVED",
      proposedByUserId: user.id,
      approvedAt: new Date(),
    });

    await promoteApprovedNicknameIfNeeded(target, nicknameId);

    await audit({
      actorUserId: user.id,
      entityType: "nickname",
      entityId: nicknameId,
      action: "nickname.added_directly",
      after: { personId, value, targetKind: target.kind },
    });

    await logActivity({
      actorUserId: user.id,
      personId,
      type: "nickname.added",
      message: `${user.name} agrego el apodo "${value}".`,
    });
  } else {
    await createPendingProposal({
      type: "ADD_NICKNAME",
      targetPersonId: personId,
      createdByUserId: user.id,
      title: `Agregar "${value}"`,
      summary: `Nuevo apodo para ${target.initialDisplayName}.`,
      payload: { value },
    });
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/proposals");
}

export async function removeNicknameAction(formData: FormData) {
  const { user } = await requireUser();
  const nicknameId = getString(formData, "nicknameId");
  const db = getDb();
  const [nickname] = await db
    .select()
    .from(nicknames)
    .where(eq(nicknames.id, nicknameId))
    .limit(1);

  if (!nickname) {
    throw new Error("Apodo no encontrado.");
  }

  const [target] = await db
    .select()
    .from(people)
    .where(eq(people.id, nickname.personId))
    .limit(1);

  if (!target) {
    throw new Error("Perfil no encontrado.");
  }

  const canDirectlyEdit = canManagePerson({
    actor: { id: user.id, role: user.role },
    target: { kind: target.kind, userId: target.userId },
  });

  if (canDirectlyEdit) {
    await db
      .update(nicknames)
      .set({ status: "DELETED", deletedAt: new Date() })
      .where(eq(nicknames.id, nicknameId));
  } else {
    await createPendingProposalWithCreatorApproval({
      type: "REMOVE_NICKNAME",
      targetPersonId: target.id,
      createdByUserId: user.id,
      title: `Quitar "${nickname.value}"`,
      summary: `Solicitud de eliminacion de apodo.`,
      payload: { nicknameId, value: nickname.value },
    });
  }

  revalidatePath(`/people/${target.id}`);
  revalidatePath("/proposals");
}

export async function nominateDailyNicknameAction(formData: FormData) {
  const { user } = await requireUser();
  const personId = getString(formData, "personId");
  const nicknameId = getString(formData, "nicknameId");

  await getDb()
    .insert(dailyNicknameNominations)
    .values({
      id: id("nom"),
      personId,
      nicknameId,
      nominatedByUserId: user.id,
      forDate: getTomorrowDateKey(),
    })
    .onConflictDoNothing();

  await logActivity({
    actorUserId: user.id,
    personId,
    type: "daily_nickname.nominated",
    message: `${user.name} postulo un apodo para el dia siguiente.`,
    metadata: { nicknameId },
  });

  revalidatePath(`/people/${personId}`);
  revalidatePath("/");
}

export async function createPostAction(formData: FormData) {
  const { user } = await requireUser();
  const personId = getString(formData, "personId");
  const parentPostId = getString(formData, "parentPostId") || null;
  const body = bodySchema.parse(getString(formData, "body"));

  await getDb()
    .insert(posts)
    .values({
      id: id("post"),
      profilePersonId: personId,
      authorUserId: user.id,
      parentPostId,
      body,
    });

  await logActivity({
    actorUserId: user.id,
    personId,
    type: parentPostId ? "post.reply_created" : "post.created",
    message: parentPostId
      ? `${user.name} respondio una publicacion.`
      : `${user.name} publico una publicacion.`,
  });

  revalidatePath(`/people/${personId}`);
  revalidatePath("/");
}

export async function deletePostAction(formData: FormData) {
  const { user } = await requireUser();
  const postId = getString(formData, "postId");
  const db = getDb();
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    throw new Error("Publicacion no encontrada.");
  }

  const [target] = await db
    .select()
    .from(people)
    .where(eq(people.id, post.profilePersonId))
    .limit(1);

  if (!target) {
    throw new Error("Perfil no encontrado.");
  }

  const canDeleteDirectly =
    user.role === "ADMIN" ||
    post.authorUserId === user.id ||
    target.userId === user.id ||
    target.kind === "FICTIONAL";

  if (canDeleteDirectly) {
    await db
      .update(posts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(posts.id, postId));
  } else {
    await createPendingProposalWithCreatorApproval({
      type: "REMOVE_POST",
      targetPersonId: target.id,
      createdByUserId: user.id,
      title: "Eliminar una publicacion",
      summary: post.body.slice(0, 180),
      payload: { postId },
    });
  }

  revalidatePath(`/people/${target.id}`);
  revalidatePath("/proposals");
}

export async function addCommentAction(formData: FormData) {
  const { user } = await requireUser();
  const subjectType = getString(formData, "subjectType") as
    | "PERSON"
    | "PROPOSAL"
    | "POST"
    | "MEDIA";
  const subjectId = getString(formData, "subjectId");
  const personId = getString(formData, "personId");
  const body = bodySchema.parse(getString(formData, "body"));

  await getDb()
    .insert(comments)
    .values({
      id: id("comment"),
      subjectType,
      subjectId,
      authorUserId: user.id,
      body,
    });

  await logActivity({
    actorUserId: user.id,
    personId: personId || undefined,
    type: "comment.created",
    message: `${user.name} comento.`,
  });

  if (personId) {
    revalidatePath(`/people/${personId}`);
  }
  revalidatePath("/proposals");
}

export async function addProposalCommentAction(formData: FormData) {
  const { user } = await requireUser();
  const proposalId = getString(formData, "proposalId");
  const body = bodySchema.parse(getString(formData, "body"));

  await getDb()
    .insert(proposalComments)
    .values({
      id: id("pcomment"),
      proposalId,
      authorUserId: user.id,
      body,
    });

  revalidatePath("/proposals");
}

export async function voteProposalAction(formData: FormData) {
  const { user } = await requireUser();
  await rejectExpiredProposals();
  const proposalId = getString(formData, "proposalId");
  const decision =
    getString(formData, "decision") === "REJECT" ? "REJECT" : "APPROVE";
  const comment = getString(formData, "comment").trim().slice(0, 500);
  const db = getDb();

  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal) {
    revalidatePath("/proposals");
    return;
  }

  const readiness = getProposalVoteReadiness({
    actorId: user.id,
    proposal,
  });

  if (!readiness.ok && readiness.reason === "settled") {
    revalidatePath("/proposals");
    if (proposal.targetPersonId) {
      revalidatePath(`/people/${proposal.targetPersonId}`);
    }
    return;
  }

  if (!readiness.ok && readiness.reason === "expired") {
    const rejectedProposals = await db
      .update(proposals)
      .set({
        status: "REJECTED",
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(proposals.id, proposalId), eq(proposals.status, "PENDING")))
      .returning();
    if (rejectedProposals.length > 0 && proposal.type === "ADD_IMAGE") {
      await deleteImageProposalBlobs(proposal.payload);
    }
    revalidatePath("/proposals");
    if (proposal.targetPersonId) {
      revalidatePath(`/people/${proposal.targetPersonId}`);
    }
    return;
  }

  if (!readiness.ok && readiness.reason === "self_vote_blocked") {
    revalidatePath("/proposals");
    return;
  }

  await db
    .insert(proposalVotes)
    .values({
      id: id("vote"),
      proposalId,
      userId: user.id,
      decision,
      comment,
    })
    .onConflictDoUpdate({
      target: [proposalVotes.proposalId, proposalVotes.userId],
      set: {
        decision,
        comment,
        createdAt: new Date(),
      },
    });

  await evaluateProposal(proposalId);
  revalidatePath("/proposals");
  if (proposal.targetPersonId) {
    revalidatePath(`/people/${proposal.targetPersonId}`);
  }
}

async function evaluateProposal(proposalId: string) {
  await rejectExpiredProposals();
  const db = getDb();
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal || proposal.status !== "PENDING") {
    return;
  }

  const eligibleRealUsers = await getVotingThreshold();
  const { voteSettings } = await getAppSettings();
  const { approvalThreshold, rejectionThreshold } = getProposalThresholds(
    eligibleRealUsers,
    voteSettings,
  );
  const [approvalCount] = await db
    .select({ value: count() })
    .from(proposalVotes)
    .where(
      and(
        eq(proposalVotes.proposalId, proposalId),
        eq(proposalVotes.decision, "APPROVE"),
      ),
    );
  const [rejectionCount] = await db
    .select({ value: count() })
    .from(proposalVotes)
    .where(
      and(
        eq(proposalVotes.proposalId, proposalId),
        eq(proposalVotes.decision, "REJECT"),
      ),
    );

  if (
    approvalThreshold > 0 &&
    Number(approvalCount.value) >= approvalThreshold
  ) {
    await applyProposal(proposal);
    return;
  }

  if (
    rejectionThreshold > 0 &&
    Number(rejectionCount.value) >= rejectionThreshold
  ) {
    const rejectedProposals = await db
      .update(proposals)
      .set({
        status: "REJECTED",
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(proposals.id, proposalId), eq(proposals.status, "PENDING")))
      .returning();
    if (rejectedProposals.length > 0 && proposal.type === "ADD_IMAGE") {
      await deleteImageProposalBlobs(proposal.payload);
    }
  }
}

async function applyProposal(proposal: typeof proposals.$inferSelect) {
  const db = getDb();
  const [claimedProposal] = await db
    .update(proposals)
    .set({ status: "APPROVED", updatedAt: new Date() })
    .where(and(eq(proposals.id, proposal.id), eq(proposals.status, "PENDING")))
    .returning();

  if (!claimedProposal) {
    return;
  }

  proposal = claimedProposal;
  const payload = proposal.payload as Record<string, unknown>;

  if (proposal.type === "ADD_NICKNAME" && proposal.targetPersonId) {
    const value = String(payload.value ?? "");
    let nicknameId = await findExistingNicknameId(
      proposal.targetPersonId,
      value,
    );

    if (!nicknameId) {
      const createdNicknameId = id("nick");
      const [createdNickname] = await db
        .insert(nicknames)
        .values({
          id: createdNicknameId,
          personId: proposal.targetPersonId,
          value,
          status: "APPROVED",
          proposedByUserId: proposal.createdByUserId,
          approvedAt: new Date(),
        })
        .onConflictDoNothing({
          target: [nicknames.personId, nicknames.value],
        })
        .returning();
      nicknameId =
        createdNickname?.id ??
        (await findExistingNicknameId(proposal.targetPersonId, value)) ??
        (await findNicknameIdByExactValue(proposal.targetPersonId, value));

      if (!nicknameId) {
        return;
      }
    }

    await db
      .update(nicknames)
      .set({ status: "APPROVED", deletedAt: null, approvedAt: new Date() })
      .where(eq(nicknames.id, nicknameId));

    const [target] = await db
      .select()
      .from(people)
      .where(eq(people.id, proposal.targetPersonId))
      .limit(1);

    if (target) {
      await promoteApprovedNicknameIfNeeded(target, nicknameId);
    }
  }

  if (proposal.type === "REMOVE_NICKNAME") {
    await db
      .update(nicknames)
      .set({ status: "DELETED", deletedAt: new Date() })
      .where(eq(nicknames.id, String(payload.nicknameId)));
  }

  if (proposal.type === "CREATE_FICTIONAL_PERSON") {
    await db.insert(people).values({
      id: id("person"),
      kind: "FICTIONAL",
      initialDisplayName: String(payload.displayName),
      fullName: String(payload.fullName ?? ""),
      createdByUserId: proposal.createdByUserId,
    });
  }

  if (proposal.type === "UPDATE_SITE_COPY") {
    const before = await getAppSettings();
    const siteCopy = mergeSiteCopy(payload.siteCopy as Record<string, string>);
    await saveSiteCopy(siteCopy, proposal.createdByUserId);
    await audit({
      actorUserId: proposal.createdByUserId,
      entityType: "app_setting",
      entityId: "site_copy",
      action: "proposal.site_copy_applied",
      before: before.siteCopy,
      after: siteCopy,
    });
    revalidatePath("/");
    revalidatePath("/login");
    revalidatePath("/admin");
  }

  if (proposal.type === "ADD_IMAGE" && proposal.targetPersonId) {
    await db.insert(mediaAssets).values({
      id: id("media"),
      personId: proposal.targetPersonId,
      uploadedByUserId: proposal.createdByUserId,
      status: "APPROVED",
      url: String(payload.url),
      thumbnailUrl: String(payload.thumbnailUrl),
      pathname: String(payload.pathname),
      thumbnailPathname: String(payload.thumbnailPathname),
      mimeType: String(payload.mimeType),
      sizeBytes: Number(payload.sizeBytes ?? 0),
      width: Number(payload.width ?? 0),
      height: Number(payload.height ?? 0),
      altText: String(payload.altText ?? ""),
      proposedViaProposalId: proposal.id,
    });
  }

  if (proposal.type === "REMOVE_POST") {
    await db
      .update(posts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(posts.id, String(payload.postId)));
  }

  await db
    .update(proposals)
    .set({
      status: "APPLIED",
      resolvedAt: new Date(),
      appliedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, proposal.id));

  await logActivity({
    actorUserId: proposal.createdByUserId,
    personId: proposal.targetPersonId ?? undefined,
    type: "proposal.applied",
    message: "Se aprobo y aplico una propuesta.",
  });
}

export async function toggleUserDisabledAction(formData: FormData) {
  const { user } = await requireAdmin();
  const userId = getString(formData, "userId");
  const disabled = getString(formData, "disabled") === "true";

  if (userId === user.id) {
    throw new Error("No puedes desactivar tu propia cuenta.");
  }

  await getDb().update(users).set({ disabled }).where(eq(users.id, userId));
  revalidatePath("/admin");
}
