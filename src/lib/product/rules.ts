export type PersonKind = "REAL" | "FICTIONAL";
export type PersonStatus = "ACTIVE" | "DISABLED";
export type UserRole = "ADMIN" | "USER";

export type VotingPerson = {
  kind: PersonKind;
  status: PersonStatus;
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

export function getVoteThreshold(realUserCount: number) {
  if (realUserCount <= 0) {
    return 0;
  }

  return Math.max(1, Math.floor(realUserCount * 0.3 + 0.5));
}

export function countEligibleRealUsers(people: VotingPerson[]) {
  return people.filter(
    (person) => person.kind === "REAL" && person.status === "ACTIVE",
  ).length;
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

        return stableHash(`${input.dateKey}:${input.personId}:${a.nickname.id}`) -
          stableHash(`${input.dateKey}:${input.personId}:${b.nickname.id}`);
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
