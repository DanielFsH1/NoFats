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

  it("blocks expired proposals before attempting to record a vote", () => {
    expect(
      getProposalVoteReadiness({
        proposal: {
          status: "PENDING",
          createdAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
          createdByUserId: "u1",
          type: "ADD_NICKNAME",
        },
        actorId: "u2",
      }),
    ).toEqual({ ok: false, reason: "expired" });
  });

  it("blocks creators from approving their own nickname or image proposals", () => {
    expect(
      getProposalVoteReadiness({
        proposal: {
          status: "PENDING",
          createdAt: new Date(),
          createdByUserId: "u1",
          type: "ADD_IMAGE",
        },
        actorId: "u1",
      }),
    ).toEqual({ ok: false, reason: "self_vote_blocked" });
  });
});
