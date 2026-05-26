import { describe, expect, it } from "vitest";
import {
  canAddOwnProfileContentDirectly,
  canAddNicknameDirectly,
  canManagePerson,
  canVoteOnProposal,
  chooseDailyMedia,
  chooseDailyNickname,
  countEligibleRealUsers,
  getProposalThresholds,
  getVoteThreshold,
  hasDuplicateNicknameValue,
  isSocialProfileVisible,
  mergeSiteCopy,
  normalizeNicknameValue,
  normalizeVoteSettings,
  resolveDisplayName,
  shouldReplacePrimaryNickname,
} from "./rules";

describe("getVoteThreshold", () => {
  it("rounds 30 percent to the nearest integer with .5 upward and a minimum of one", () => {
    expect(getVoteThreshold(0)).toBe(0);
    expect(getVoteThreshold(1)).toBe(1);
    expect(getVoteThreshold(3)).toBe(1);
    expect(getVoteThreshold(4)).toBe(1);
    expect(getVoteThreshold(5)).toBe(2);
    expect(getVoteThreshold(6)).toBe(2);
    expect(getVoteThreshold(10)).toBe(3);
  });

  it("uses configurable percentages for approval and rejection thresholds", () => {
    expect(getVoteThreshold(10, 40)).toBe(4);
    expect(getVoteThreshold(5, 50)).toBe(3);
    expect(getVoteThreshold(4, 10)).toBe(1);
    expect(getVoteThreshold(4, 0)).toBe(1);
  });
});

describe("proposal voting settings", () => {
  it("normalizes invalid percentage values to the default 30 percent", () => {
    expect(
      normalizeVoteSettings({
        approvalPercentage: 125,
        rejectionPercentage: Number.NaN,
      }),
    ).toEqual({ approvalPercentage: 30, rejectionPercentage: 30 });
  });

  it("returns separate approval and rejection thresholds", () => {
    expect(
      getProposalThresholds(10, {
        approvalPercentage: 40,
        rejectionPercentage: 20,
      }),
    ).toEqual({ approvalThreshold: 4, rejectionThreshold: 2 });
  });
});

describe("mergeSiteCopy", () => {
  it("keeps safe defaults and trims custom public copy", () => {
    expect(
      mergeSiteCopy({
        appName: "  La Banda  ",
        loginHeroTitle: "  Un titulo nuevo  ",
        loginHeroSubtitle: "",
        loginEyebrow: "  privado  ",
      }),
    ).toMatchObject({
      appName: "La Banda",
      loginHeroTitle: "Un titulo nuevo",
      loginHeroSubtitle:
        "Apodos, votaciones, fotos y publicaciones con acceso privado.",
      loginEyebrow: "privado",
    });
  });
});

describe("countEligibleRealUsers", () => {
  it("counts only active real people for voting math", () => {
    expect(
      countEligibleRealUsers([
        { kind: "REAL", status: "ACTIVE" },
        { kind: "FICTIONAL", status: "ACTIVE" },
        { kind: "REAL", status: "DISABLED" },
        { kind: "REAL", status: "ACTIVE" },
        { kind: "REAL", status: "ACTIVE", userRole: "ADMIN" },
      ]),
    ).toBe(2);
  });
});

describe("isSocialProfileVisible", () => {
  it("hides admin people from social surfaces", () => {
    expect(isSocialProfileVisible({ userRole: "ADMIN" })).toBe(false);
    expect(isSocialProfileVisible({ userRole: "USER" })).toBe(true);
    expect(isSocialProfileVisible({ userRole: null })).toBe(true);
  });
});

describe("resolveDisplayName", () => {
  it("uses daily nickname, then primary nickname, then initial display name", () => {
    expect(
      resolveDisplayName({
        initialDisplayName: "Diego",
        primaryNickname: "D-Man",
        dailyNickname: "Capitan",
      }),
    ).toBe("Capitan");

    expect(
      resolveDisplayName({
        initialDisplayName: "Diego",
        primaryNickname: "D-Man",
      }),
    ).toBe("D-Man");

    expect(resolveDisplayName({ initialDisplayName: "Diego" })).toBe("Diego");
  });
});

describe("shouldReplacePrimaryNickname", () => {
  it("promotes the first real approved nickname over empty or temporary primaries", () => {
    expect(shouldReplacePrimaryNickname(null)).toBe(true);
    expect(
      shouldReplacePrimaryNickname({ status: "TEMPORARY", isTemporary: true }),
    ).toBe(true);
    expect(
      shouldReplacePrimaryNickname({ status: "APPROVED", isTemporary: false }),
    ).toBe(false);
  });
});

describe("canManagePerson", () => {
  it("lets any real user manage fictional profiles and only owners/admins manage real profiles", () => {
    expect(
      canManagePerson({
        actor: { id: "u1", role: "USER" },
        target: { kind: "FICTIONAL" },
      }),
    ).toBe(true);

    expect(
      canManagePerson({
        actor: { id: "u1", role: "USER" },
        target: { kind: "REAL", userId: "u1" },
      }),
    ).toBe(true);

    expect(
      canManagePerson({
        actor: { id: "u1", role: "USER" },
        target: { kind: "REAL", userId: "u2" },
      }),
    ).toBe(false);

    expect(
      canManagePerson({
        actor: { id: "u1", role: "ADMIN" },
        target: { kind: "REAL", userId: "u2" },
      }),
    ).toBe(true);
  });
});

describe("canAddNicknameDirectly", () => {
  it("lets users add nicknames directly to their own profile and fictional profiles only", () => {
    expect(
      canAddNicknameDirectly({
        actor: { id: "u1", role: "USER" },
        target: { kind: "REAL", userId: "u1" },
      }),
    ).toBe(true);
    expect(
      canAddNicknameDirectly({
        actor: { id: "u1", role: "USER" },
        target: { kind: "REAL", userId: "u2" },
      }),
    ).toBe(false);
    expect(
      canAddNicknameDirectly({
        actor: { id: "u1", role: "USER" },
        target: { kind: "FICTIONAL", userId: null },
      }),
    ).toBe(true);
  });
});

describe("canAddOwnProfileContentDirectly", () => {
  it("lets users add photos directly to their own profile and fictional profiles only", () => {
    expect(
      canAddOwnProfileContentDirectly({
        actor: { id: "u1", role: "USER" },
        target: { kind: "REAL", userId: "u1" },
      }),
    ).toBe(true);
    expect(
      canAddOwnProfileContentDirectly({
        actor: { id: "u1", role: "USER" },
        target: { kind: "REAL", userId: "u2" },
      }),
    ).toBe(false);
    expect(
      canAddOwnProfileContentDirectly({
        actor: { id: "u1", role: "USER" },
        target: { kind: "FICTIONAL", userId: null },
      }),
    ).toBe(true);
  });
});

describe("canVoteOnProposal", () => {
  it("prevents creators from approving their own nickname or photo proposals", () => {
    expect(
      canVoteOnProposal({
        actorId: "u1",
        proposalCreatorId: "u1",
        proposalType: "ADD_NICKNAME",
      }),
    ).toBe(false);
    expect(
      canVoteOnProposal({
        actorId: "u1",
        proposalCreatorId: "u1",
        proposalType: "ADD_IMAGE",
      }),
    ).toBe(false);
    expect(
      canVoteOnProposal({
        actorId: "u2",
        proposalCreatorId: "u1",
        proposalType: "ADD_NICKNAME",
      }),
    ).toBe(true);
    expect(
      canVoteOnProposal({
        actorId: "u1",
        proposalCreatorId: "u1",
        proposalType: "UPDATE_SITE_COPY",
      }),
    ).toBe(true);
  });
});

describe("nickname duplicate normalization", () => {
  it("treats case, accents and extra spaces as the same nickname", () => {
    expect(normalizeNicknameValue("  PEPETRÓN   Máximo ")).toBe(
      "pepetron maximo",
    );
    expect(hasDuplicateNicknameValue(["Pepetrón"], "pepetron")).toBe(true);
    expect(hasDuplicateNicknameValue(["El   Profe"], "el profe")).toBe(true);
    expect(hasDuplicateNicknameValue(["Paco"], "Paquito")).toBe(false);
  });
});

describe("chooseDailyNickname", () => {
  it("selects the most nominated nickname and breaks ties by oldest nomination", () => {
    const result = chooseDailyNickname({
      dateKey: "2026-05-22",
      personId: "p1",
      nicknames: [
        { id: "n1", value: "Rayo" },
        { id: "n2", value: "Turbo" },
      ],
      nominations: [
        { nicknameId: "n2", createdAt: new Date("2026-05-21T20:00:00Z") },
        { nicknameId: "n1", createdAt: new Date("2026-05-21T21:00:00Z") },
        { nicknameId: "n1", createdAt: new Date("2026-05-21T22:00:00Z") },
        { nicknameId: "n2", createdAt: new Date("2026-05-21T19:00:00Z") },
      ],
    });

    expect(result?.id).toBe("n2");
  });

  it("falls back to a stable approved nickname when there are no nominations", () => {
    const input = {
      dateKey: "2026-05-22",
      personId: "p42",
      nicknames: [
        { id: "n1", value: "Rayo" },
        { id: "n2", value: "Turbo" },
        { id: "n3", value: "Nube" },
      ],
      nominations: [],
    };

    expect(chooseDailyNickname(input)).toEqual(chooseDailyNickname(input));
  });
});

describe("chooseDailyMedia", () => {
  it("selects a stable profile photo for the same person and day", () => {
    const input = {
      dateKey: "2026-05-22",
      personId: "p42",
      media: [
        { id: "m1", createdAt: new Date("2026-05-20T10:00:00Z") },
        { id: "m2", createdAt: new Date("2026-05-21T10:00:00Z") },
        { id: "m3", createdAt: new Date("2026-05-22T10:00:00Z") },
      ],
    };

    expect(chooseDailyMedia(input)).toEqual(chooseDailyMedia(input));
  });

  it("returns null when a profile has no approved photos", () => {
    expect(
      chooseDailyMedia({
        dateKey: "2026-05-22",
        personId: "p42",
        media: [],
      }),
    ).toBeNull();
  });
});
