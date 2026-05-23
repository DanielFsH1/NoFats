import { getDb } from "@/lib/db";
import {
  activityEvents,
  comments,
  dailyNicknameAssignments,
  mediaAssets,
  nicknames,
  people,
  posts,
  proposalVotes,
  proposals,
  registrationSlots,
  users,
} from "@/lib/db/schema";
import { materializeDailyNicknames } from "@/lib/data/daily";
import { getDateKey } from "@/lib/product/dates";
import {
  chooseDailyMedia,
  isSocialProfileVisible,
  resolveDisplayName,
} from "@/lib/product/rules";
import { and, count, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";

type PeopleSummaryOptions = {
  includeAdminProfiles?: boolean;
};

export async function getPeopleSummaries(
  dateKeyOrOptions: string | PeopleSummaryOptions = getDateKey(),
  options: PeopleSummaryOptions = {},
) {
  const dateKey =
    typeof dateKeyOrOptions === "string" ? dateKeyOrOptions : getDateKey();
  const resolvedOptions =
    typeof dateKeyOrOptions === "string" ? options : dateKeyOrOptions;

  await materializeDailyNicknames(dateKey);

  const db = getDb();
  const [allRows, adminRows] = await Promise.all([
    db
      .select()
      .from(people)
      .where(and(eq(people.status, "ACTIVE"), isNull(people.deletedAt)))
      .orderBy(people.initialDisplayName),
    resolvedOptions.includeAdminProfiles
      ? []
      : db.select({ id: users.id }).from(users).where(eq(users.role, "ADMIN")),
  ]);
  const adminUserIds = new Set(adminRows.map((user) => user.id));
  const rows = resolvedOptions.includeAdminProfiles
    ? allRows
    : allRows.filter((person) =>
        isSocialProfileVisible({
          userRole:
            person.userId && adminUserIds.has(person.userId) ? "ADMIN" : null,
        }),
      );

  const ids = rows.map((person) => person.id);
  const nicknameRows =
    ids.length > 0
      ? await db
          .select()
          .from(nicknames)
          .where(
            and(inArray(nicknames.personId, ids), isNull(nicknames.deletedAt)),
          )
      : [];
  const dailyRows =
    ids.length > 0
      ? await db
          .select({
            personId: dailyNicknameAssignments.personId,
            nicknameId: dailyNicknameAssignments.nicknameId,
          })
          .from(dailyNicknameAssignments)
          .where(
            and(
              inArray(dailyNicknameAssignments.personId, ids),
              eq(dailyNicknameAssignments.forDate, dateKey),
            ),
          )
      : [];
  const mediaRows =
    ids.length > 0
      ? await db
          .select({
            id: mediaAssets.id,
            personId: mediaAssets.personId,
            thumbnailUrl: mediaAssets.thumbnailUrl,
            url: mediaAssets.url,
            altText: mediaAssets.altText,
            createdAt: mediaAssets.createdAt,
          })
          .from(mediaAssets)
          .where(
            and(
              inArray(mediaAssets.personId, ids),
              eq(mediaAssets.status, "APPROVED"),
              isNull(mediaAssets.deletedAt),
            ),
          )
      : [];

  return rows.map((person) => {
    const personNicknames = nicknameRows.filter(
      (nickname) => nickname.personId === person.id,
    );
    const primary = personNicknames.find(
      (nickname) => nickname.id === person.primaryNicknameId,
    );
    const daily = dailyRows.find((row) => row.personId === person.id);
    const dailyNickname = personNicknames.find(
      (nickname) => nickname.id === daily?.nicknameId,
    );
    const personMedia = mediaRows.filter(
      (asset) => asset.personId === person.id,
    );
    const dailyPhoto =
      chooseDailyMedia({
        dateKey,
        personId: person.id,
        media: personMedia,
      }) ?? null;

    return {
      ...person,
      displayName: resolveDisplayName({
        initialDisplayName: person.initialDisplayName,
        primaryNickname: primary?.value,
        dailyNickname: dailyNickname?.value,
      }),
      dailyNickname: dailyNickname?.value ?? null,
      dailyPhoto,
      nicknameCount: personNicknames.filter(
        (nickname) => nickname.status === "APPROVED",
      ).length,
      photoCount: personMedia.length,
    };
  });
}

function getPersonIdentity(
  peopleSummaries: {
    userId?: string | null;
    displayName: string;
    dailyPhoto?: { id: string; altText?: string | null } | null;
  }[],
  userId: string,
) {
  const person = peopleSummaries.find((summary) => summary.userId === userId);

  return {
    name: person?.displayName ?? null,
    dailyPhoto: person?.dailyPhoto ?? null,
  };
}

export async function getDashboardData() {
  const db = getDb();
  const dateKey = getDateKey();
  const peopleSummaries = await getPeopleSummaries(dateKey);
  const socialPersonIds = peopleSummaries.map((person) => person.id);
  const pendingProposals = await getProposalsWithVotes("PENDING");
  const recentPosts =
    socialPersonIds.length > 0
      ? await db
          .select({
            id: posts.id,
            body: posts.body,
            createdAt: posts.createdAt,
            profilePersonId: posts.profilePersonId,
            authorUserId: posts.authorUserId,
            authorName: users.name,
          })
          .from(posts)
          .innerJoin(users, eq(posts.authorUserId, users.id))
          .where(
            and(
              isNull(posts.deletedAt),
              inArray(posts.profilePersonId, socialPersonIds),
            ),
          )
          .orderBy(desc(posts.createdAt))
          .limit(8)
      : [];
  const recentActivity = await getActivity(10);
  const recentMedia =
    socialPersonIds.length > 0
      ? await db
          .select()
          .from(mediaAssets)
          .where(
            and(
              eq(mediaAssets.status, "APPROVED"),
              isNull(mediaAssets.deletedAt),
              inArray(mediaAssets.personId, socialPersonIds),
            ),
          )
          .orderBy(desc(mediaAssets.createdAt))
          .limit(8)
      : [];

  return {
    dateKey,
    people: peopleSummaries,
    pendingProposals,
    recentPosts: recentPosts.map((post) => {
      const author = getPersonIdentity(peopleSummaries, post.authorUserId);

      return {
        ...post,
        authorName: author.name ?? post.authorName,
        authorDailyPhoto: author.dailyPhoto,
      };
    }),
    recentActivity,
    recentMedia,
  };
}

export async function getPersonProfile(
  personId: string,
  options: PeopleSummaryOptions = {},
) {
  const db = getDb();
  const peopleSummaries = await getPeopleSummaries(getDateKey(), options);
  const [personSummary] = peopleSummaries.filter(
    (person) => person.id === personId,
  );

  if (!personSummary) {
    return null;
  }

  const [
    personNicknames,
    personPosts,
    personMedia,
    profileComments,
    profileActivity,
  ] = await Promise.all([
    db
      .select()
      .from(nicknames)
      .where(and(eq(nicknames.personId, personId), isNull(nicknames.deletedAt)))
      .orderBy(desc(nicknames.createdAt)),
    db
      .select({
        id: posts.id,
        body: posts.body,
        createdAt: posts.createdAt,
        deletedAt: posts.deletedAt,
        authorUserId: posts.authorUserId,
        authorName: users.name,
        parentPostId: posts.parentPostId,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorUserId, users.id))
      .where(eq(posts.profilePersonId, personId))
      .orderBy(desc(posts.createdAt))
      .limit(40),
    db
      .select()
      .from(mediaAssets)
      .where(
        and(eq(mediaAssets.personId, personId), isNull(mediaAssets.deletedAt)),
      )
      .orderBy(desc(mediaAssets.createdAt)),
    db
      .select({
        id: comments.id,
        body: comments.body,
        createdAt: comments.createdAt,
        deletedAt: comments.deletedAt,
        authorUserId: comments.authorUserId,
        authorName: users.name,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorUserId, users.id))
      .where(
        and(
          eq(comments.subjectType, "PERSON"),
          eq(comments.subjectId, personId),
        ),
      )
      .orderBy(desc(comments.createdAt))
      .limit(30),
    db
      .select()
      .from(activityEvents)
      .where(eq(activityEvents.personId, personId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(20),
  ]);

  const pendingProposalRows = await db
    .select({
      id: proposals.id,
      type: proposals.type,
      status: proposals.status,
      title: proposals.title,
      summary: proposals.summary,
      payload: proposals.payload,
      targetPersonId: proposals.targetPersonId,
      createdAt: proposals.createdAt,
      createdByUserId: proposals.createdByUserId,
      createdByName: users.name,
    })
    .from(proposals)
    .innerJoin(users, eq(proposals.createdByUserId, users.id))
    .where(
      and(
        eq(proposals.targetPersonId, personId),
        eq(proposals.status, "PENDING"),
      ),
    )
    .orderBy(desc(proposals.createdAt));
  const pendingProposalIds = pendingProposalRows.map((proposal) => proposal.id);
  const pendingVoteRows =
    pendingProposalIds.length > 0
      ? await db
          .select({
            id: proposalVotes.id,
            proposalId: proposalVotes.proposalId,
            decision: proposalVotes.decision,
            comment: proposalVotes.comment,
            createdAt: proposalVotes.createdAt,
            userId: users.id,
            authorName: users.name,
          })
          .from(proposalVotes)
          .innerJoin(users, eq(proposalVotes.userId, users.id))
          .where(inArray(proposalVotes.proposalId, pendingProposalIds))
      : [];

  const personByUserId = new Map(
    peopleSummaries
      .filter((person) => person.userId)
      .map((person) => [person.userId, person]),
  );

  return {
    person: personSummary,
    nicknames: personNicknames,
    posts: personPosts.map((post) => ({
      ...post,
      authorName:
        personByUserId.get(post.authorUserId)?.displayName ?? post.authorName,
      authorDailyPhoto:
        personByUserId.get(post.authorUserId)?.dailyPhoto ?? null,
    })),
    media: personMedia,
    comments: profileComments.map((comment) => ({
      ...comment,
      authorName:
        personByUserId.get(comment.authorUserId)?.displayName ??
        comment.authorName,
      authorDailyPhoto:
        personByUserId.get(comment.authorUserId)?.dailyPhoto ?? null,
    })),
    activity: profileActivity,
    pendingProposals: pendingProposalRows.map((proposal) => {
      const votes = pendingVoteRows
        .filter((vote) => vote.proposalId === proposal.id)
        .map((vote) => ({
          ...vote,
          authorName:
            personByUserId.get(vote.userId)?.displayName ?? vote.authorName,
          authorDailyPhoto: personByUserId.get(vote.userId)?.dailyPhoto ?? null,
        }));

      return {
        ...proposal,
        creatorDisplayName:
          personByUserId.get(proposal.createdByUserId)?.displayName ??
          proposal.createdByName,
        creatorDailyPhoto:
          personByUserId.get(proposal.createdByUserId)?.dailyPhoto ?? null,
        approvals: votes.filter((vote) => vote.decision === "APPROVE").length,
        rejections: votes.filter((vote) => vote.decision === "REJECT").length,
        votes,
      };
    }),
  };
}

export async function getProposalsWithVotes(status?: "PENDING") {
  const db = getDb();
  const [rows, peopleSummaries] = await Promise.all([
    db
      .select({
        id: proposals.id,
        type: proposals.type,
        status: proposals.status,
        title: proposals.title,
        summary: proposals.summary,
        payload: proposals.payload,
        targetPersonId: proposals.targetPersonId,
        createdAt: proposals.createdAt,
        createdByUserId: proposals.createdByUserId,
        createdByName: users.name,
      })
      .from(proposals)
      .innerJoin(users, eq(proposals.createdByUserId, users.id))
      .where(status ? eq(proposals.status, status) : undefined)
      .orderBy(desc(proposals.createdAt))
      .limit(80),
    getPeopleSummaries(),
  ]);

  const proposalIds = rows.map((proposal) => proposal.id);
  const personById = new Map(
    peopleSummaries.map((person) => [person.id, person]),
  );
  const personByUserId = new Map(
    peopleSummaries
      .filter((person) => person.userId)
      .map((person) => [person.userId, person]),
  );
  const voteRows =
    proposalIds.length > 0
      ? await db
          .select()
          .from(proposalVotes)
          .where(inArray(proposalVotes.proposalId, proposalIds))
      : [];

  return rows.map((proposal) => {
    const votes = voteRows.filter((vote) => vote.proposalId === proposal.id);
    return {
      ...proposal,
      creatorDisplayName:
        personByUserId.get(proposal.createdByUserId)?.displayName ??
        proposal.createdByName,
      creatorDailyPhoto:
        personByUserId.get(proposal.createdByUserId)?.dailyPhoto ?? null,
      targetDisplayName: proposal.targetPersonId
        ? (personById.get(proposal.targetPersonId)?.displayName ?? null)
        : null,
      targetDailyPhoto: proposal.targetPersonId
        ? (personById.get(proposal.targetPersonId)?.dailyPhoto ?? null)
        : null,
      approvals: votes.filter((vote) => vote.decision === "APPROVE").length,
      rejections: votes.filter((vote) => vote.decision === "REJECT").length,
      votes,
    };
  });
}

export async function getActivity(limit = 40) {
  return getDb()
    .select({
      id: activityEvents.id,
      type: activityEvents.type,
      message: activityEvents.message,
      personId: activityEvents.personId,
      actorUserId: activityEvents.actorUserId,
      createdAt: activityEvents.createdAt,
    })
    .from(activityEvents)
    .orderBy(desc(activityEvents.createdAt))
    .limit(limit);
}

export async function getGallery() {
  const [assets, peopleSummaries] = await Promise.all([
    getDb()
      .select({
        id: mediaAssets.id,
        personId: mediaAssets.personId,
        thumbnailUrl: mediaAssets.thumbnailUrl,
        url: mediaAssets.url,
        altText: mediaAssets.altText,
        createdAt: mediaAssets.createdAt,
        displayName: people.initialDisplayName,
      })
      .from(mediaAssets)
      .innerJoin(people, eq(mediaAssets.personId, people.id))
      .where(
        and(eq(mediaAssets.status, "APPROVED"), isNull(mediaAssets.deletedAt)),
      )
      .orderBy(desc(mediaAssets.createdAt)),
    getPeopleSummaries(),
  ]);
  const personById = new Map(
    peopleSummaries.map((person) => [person.id, person]),
  );

  return assets.flatMap((asset) => {
    const person = personById.get(asset.personId);

    if (!person) {
      return [];
    }

    return {
      ...asset,
      displayName: person.displayName ?? asset.displayName,
      isDailyPhoto: person.dailyPhoto?.id === asset.id,
    };
  });
}

export async function getAdminOverview() {
  const db = getDb();
  const [
    realUsers,
    totalPeople,
    fictionalPeople,
    approvedNicknames,
    pendingProposals,
    approvedImages,
    totalPosts,
    totalComments,
    totalVotes,
    slots,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(people)
      .innerJoin(users, eq(people.userId, users.id))
      .where(
        and(
          eq(people.kind, "REAL"),
          eq(people.status, "ACTIVE"),
          ne(users.role, "ADMIN"),
        ),
      ),
    db
      .select({ value: count() })
      .from(people)
      .leftJoin(users, eq(people.userId, users.id))
      .where(
        and(
          eq(people.status, "ACTIVE"),
          isNull(people.deletedAt),
          sql`(${users.role} is null or ${users.role} <> 'ADMIN')`,
        ),
      ),
    db
      .select({ value: count() })
      .from(people)
      .where(eq(people.kind, "FICTIONAL")),
    db
      .select({ value: count() })
      .from(nicknames)
      .where(eq(nicknames.status, "APPROVED")),
    db
      .select({ value: count() })
      .from(proposals)
      .where(eq(proposals.status, "PENDING")),
    db
      .select({ value: count() })
      .from(mediaAssets)
      .where(eq(mediaAssets.status, "APPROVED")),
    db.select({ value: count() }).from(posts).where(isNull(posts.deletedAt)),
    db
      .select({ value: count() })
      .from(comments)
      .where(isNull(comments.deletedAt)),
    db.select({ value: count() }).from(proposalVotes),
    db
      .select()
      .from(registrationSlots)
      .orderBy(desc(registrationSlots.createdAt))
      .limit(20),
  ]);

  const userRows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      disabled: users.disabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(50);

  return {
    metrics: {
      realUsers: realUsers[0]?.value ?? 0,
      totalPeople: totalPeople[0]?.value ?? 0,
      fictionalPeople: fictionalPeople[0]?.value ?? 0,
      approvedNicknames: approvedNicknames[0]?.value ?? 0,
      pendingProposals: pendingProposals[0]?.value ?? 0,
      approvedImages: approvedImages[0]?.value ?? 0,
      totalPosts: totalPosts[0]?.value ?? 0,
      totalComments: totalComments[0]?.value ?? 0,
      totalVotes: totalVotes[0]?.value ?? 0,
    },
    slots,
    users: userRows,
  };
}

export async function getVotingThreshold() {
  const [{ value }] = await getDb()
    .select({ value: count() })
    .from(people)
    .innerJoin(users, eq(people.userId, users.id))
    .where(
      and(
        eq(people.kind, "REAL"),
        eq(people.status, "ACTIVE"),
        ne(users.role, "ADMIN"),
      ),
    );

  return Number(value ?? 0);
}

export async function getVoteCommentList(proposalId: string) {
  const [votes, peopleSummaries] = await Promise.all([
    getDb()
      .select({
        id: proposalVotes.id,
        decision: proposalVotes.decision,
        comment: proposalVotes.comment,
        createdAt: proposalVotes.createdAt,
        userId: users.id,
        authorName: users.name,
      })
      .from(proposalVotes)
      .innerJoin(users, eq(proposalVotes.userId, users.id))
      .where(eq(proposalVotes.proposalId, proposalId))
      .orderBy(desc(proposalVotes.createdAt)),
    getPeopleSummaries(),
  ]);
  const personByUserId = new Map(
    peopleSummaries
      .filter((person) => person.userId)
      .map((person) => [person.userId, person]),
  );

  return votes.map((vote) => ({
    ...vote,
    authorName: personByUserId.get(vote.userId)?.displayName ?? vote.authorName,
    authorDailyPhoto: personByUserId.get(vote.userId)?.dailyPhoto ?? null,
  }));
}

export async function searchPeople(query: string) {
  return getDb()
    .select()
    .from(people)
    .where(sql`${people.initialDisplayName} ilike ${`%${query}%`}`);
}
