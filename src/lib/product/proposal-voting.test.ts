import { describe, expect, it } from "vitest";
import { getProposalVoteReadiness } from "./proposal-voting";

describe("getProposalVoteReadiness", () => {
  it("ignores proposals that were already resolved instead of surfacing a global error", () => {
    expect(
      getProposalVoteReadiness({
        proposal: {
          status: "APPLIED",
          createdAt: new Date(),
          createdByUserId: "u1",
          type: "ADD_NICKNAME",
        },
        actorId: "u2",
      }),
    ).toEqual({ ok: false, reason: "settled" });
  });

  it("allows a valid vote on a pending nickname proposal", () => {
    expect(
      getProposalVoteReadiness({
        proposal: {
          status: "PENDING",
          createdAt: new Date(),
          createdByUserId: "u1",
          type: "ADD_NICKNAME",
        },
        actorId: "u2",
      }),
    ).toEqual({ ok: true });
  });
});
