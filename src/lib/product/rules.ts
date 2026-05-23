export type PersonKind = "REAL" | "FICTIONAL";
export type PersonStatus = "ACTIVE" | "DISABLED";
export type UserRole = "ADMIN" | "USER";

export type VotingPerson = {
  kind: PersonKind;
  status: PersonStatus;
  userRole?: UserRole | null;
};

export type DisplayNameInput = {
  initialDisplayName: string;
  primaryNickname?: string | null;
  dailyNickname?: string | null;
};

export type ManagePersonInput = {
  actor: {
    id: string;
    role: UserRole;
  };
  target: {
    kind: PersonKind;
    userId?: string | null;
  };
};

export type AddNicknameDirectlyInput = {
  actorId: string;
  targetUserId?: string | null;
};

export type ProposalVotePermissionInput = {
  actorId: string;
  proposalCreatorId: string;
  proposalType: string;
};

export type DailyNicknameOption = {
  id: string;
  value: string;
};

export type DailyNicknameNomination = {
  nicknameId: string;
  createdAt: Date;
};

export type DailyNicknameInput = {
  dateKey: string;
  personId: string;
  nicknames: DailyNicknameOption[];
  nominations: DailyNicknameNomination[];
};

export type DailyMediaOption = {
  id: string;
  altText?: string | null;
  createdAt?: Date | null;
};

export type VoteSettings = {
  approvalPercentage: number;
  rejectionPercentage: number;
};

export type ProposalThresholds = {
  approvalThreshold: number;
  rejectionThreshold: number;
};

export type SiteCopy = {
  appName: string;
  loginEyebrow: string;
  loginHeroTitle: string;
  loginHeroSubtitle: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
};

export const defaultVoteSettings: VoteSettings = {
  approvalPercentage: 30,
  rejectionPercentage: 30,
};

export const defaultSiteCopy: SiteCopy = {
  appName: "NoFats",
  loginEyebrow: "Red social privada",
  loginHeroTitle: "Las publicaciones del grupo, cerradas para el grupo.",
  loginHeroSubtitle:
    "Apodos, votaciones, fotos y publicaciones con acceso privado.",
  dashboardTitle: "NoFats",
  dashboardSubtitle:
    "Hoy hay {count} perfiles con apodo activo. Las asignaciones son estables durante el dia y se recalculan al cambiar de dia.",
};

export function getVoteThreshold(realUserCount: number, percentage = 30) {
  if (realUserCount <= 0) {
    return 0;
  }

  const normalizedPercentage = normalizePercentage(percentage);
  return Math.max(
    1,
    Math.floor(realUserCount * (normalizedPercentage / 100) + 0.5),
  );
}

export function normalizeVoteSettings(
  settings?: Partial<VoteSettings> | null,
): VoteSettings {
  return {
    approvalPercentage: normalizePercentage(settings?.approvalPercentage),
    rejectionPercentage: normalizePercentage(settings?.rejectionPercentage),
  };
}

export function getProposalThresholds(
  realUserCount: number,
  settings?: Partial<VoteSettings> | null,
): ProposalThresholds {
  const normalized = normalizeVoteSettings(settings);

  return {
    approvalThreshold: getVoteThreshold(
      realUserCount,
      normalized.approvalPercentage,
    ),
    rejectionThreshold: getVoteThreshold(
      realUserCount,
      normalized.rejectionPercentage,
    ),
  };
}

export function mergeSiteCopy(input?: Partial<SiteCopy> | null): SiteCopy {
  return {
    appName: cleanWithFallback(input?.appName, defaultSiteCopy.appName, 40),
    loginEyebrow: cleanWithFallback(
      input?.loginEyebrow,
      defaultSiteCopy.loginEyebrow,
      80,
    ),
    loginHeroTitle: cleanWithFallback(
      input?.loginHeroTitle,
      defaultSiteCopy.loginHeroTitle,
      120,
    ),
    loginHeroSubtitle: cleanWithFallback(
      input?.loginHeroSubtitle,
      defaultSiteCopy.loginHeroSubtitle,
      180,
    ),
    dashboardTitle: cleanWithFallback(
      input?.dashboardTitle,
      defaultSiteCopy.dashboardTitle,
      80,
    ),
    dashboardSubtitle: cleanWithFallback(
      input?.dashboardSubtitle,
      defaultSiteCopy.dashboardSubtitle,
      220,
    ),
  };
}

export function countEligibleRealUsers(people: VotingPerson[]) {
  return people.filter(
    (person) =>
      person.kind === "REAL" &&
      person.status === "ACTIVE" &&
      person.userRole !== "ADMIN",
  ).length;
}

export function isSocialProfileVisible(input: { userRole?: UserRole | null }) {
  return input.userRole !== "ADMIN";
}

export function shouldReplacePrimaryNickname(
  current?: { status?: string | null; isTemporary?: boolean | null } | null,
) {
  return (
    !current || current.status === "TEMPORARY" || current.isTemporary === true
  );
}

export function resolveDisplayName(input: DisplayNameInput) {
  return (
    cleanOptional(input.dailyNickname) ??
    cleanOptional(input.primaryNickname) ??
    input.initialDisplayName.trim()
  );
}

export function canManagePerson(input: ManagePersonInput) {
  if (input.actor.role === "ADMIN") {
    return true;
  }

  if (input.target.kind === "FICTIONAL") {
    return true;
  }

  return input.target.userId === input.actor.id;
}

export function canAddNicknameDirectly(input: AddNicknameDirectlyInput) {
  return Boolean(input.targetUserId && input.targetUserId === input.actorId);
}

export function canVoteOnProposal(input: ProposalVotePermissionInput) {
  if (
    input.proposalType === "ADD_NICKNAME" &&
    input.actorId === input.proposalCreatorId
  ) {
    return false;
  }

  return true;
}

export function chooseDailyNickname(input: DailyNicknameInput) {
  if (input.nicknames.length === 0) {
    return null;
  }

  if (input.nominations.length > 0) {
    const ranked = input.nicknames
      .map((nickname) => {
        const nominations = input.nominations.filter(
          (nomination) => nomination.nicknameId === nickname.id,
        );
        const oldestNomination = nominations
          .map((nomination) => nomination.createdAt.getTime())
          .sort((a, b) => a - b)[0];

        return {
          nickname,
          count: nominations.length,
          oldestNomination: oldestNomination ?? Number.MAX_SAFE_INTEGER,
        };
      })
      .filter((entry) => entry.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        if (a.oldestNomination !== b.oldestNomination) {
          return a.oldestNomination - b.oldestNomination;
        }

        return (
          stableHash(`${input.dateKey}:${input.personId}:${a.nickname.id}`) -
          stableHash(`${input.dateKey}:${input.personId}:${b.nickname.id}`)
        );
      });

    return ranked[0]?.nickname ?? null;
  }

  const sorted = [...input.nicknames].sort(
    (a, b) =>
      stableHash(`${input.dateKey}:${input.personId}:${a.id}`) -
      stableHash(`${input.dateKey}:${input.personId}:${b.id}`),
  );

  return sorted[0] ?? null;
}

export function chooseDailyMedia({
  dateKey,
  personId,
  media,
}: {
  dateKey: string;
  personId: string;
  media: DailyMediaOption[];
}) {
  if (media.length === 0) {
    return null;
  }

  const sorted = [...media].sort((a, b) => {
    const hashDiff =
      stableHash(`${dateKey}:${personId}:${a.id}`) -
      stableHash(`${dateKey}:${personId}:${b.id}`);

    if (hashDiff !== 0) {
      return hashDiff;
    }

    return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
  });

  return sorted[0] ?? null;
}

export function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function cleanOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function cleanWithFallback(
  value: unknown,
  fallback: string,
  maxLength: number,
) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : fallback;
}

function normalizePercentage(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 30;
  }

  if (value < 1 || value > 100) {
    return 30;
  }

  return Math.round(value);
}
