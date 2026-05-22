import { describe, expect, it } from "vitest";
import {
  canManagePerson,
  chooseDailyNickname,
  countEligibleRealUsers,
  getVoteThreshold,
  resolveDisplayName,
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
});

describe("countEligibleRealUsers", () => {
  it("counts only active real people for voting math", () => {
    expect(
      countEligibleRealUsers([
        { kind: "REAL", status: "ACTIVE" },
        { kind: "FICTIONAL", status: "ACTIVE" },
        { kind: "REAL", status: "DISABLED" },
        { kind: "REAL", status: "ACTIVE" },
      ]),
    ).toBe(2);
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
