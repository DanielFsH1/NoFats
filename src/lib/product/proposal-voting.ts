import { isProposalExpired } from "./proposal-expiration";
import { canVoteOnProposal } from "./rules";

export type ProposalVoteReadinessInput = {
  actorId: string;
  proposal: {
    status: string;
    createdAt: Date;
    createdByUserId: string;
    type: string;
  };
};

export type ProposalVoteReadiness =
  | { ok: true }
  | { ok: false; reason: "settled" | "expired" | "self_vote_blocked" };

export function getProposalVoteReadiness({
  actorId,
  proposal,
}: ProposalVoteReadinessInput): ProposalVoteReadiness {
  if (proposal.status !== "PENDING") {
    return { ok: false, reason: "settled" };
  }

  if (isProposalExpired(proposal.createdAt)) {
    return { ok: false, reason: "expired" };
  }

  if (
    !canVoteOnProposal({
      actorId,
      proposalCreatorId: proposal.createdByUserId,
      proposalType: proposal.type,
    })
  ) {
    return { ok: false, reason: "self_vote_blocked" };
  }

  return { ok: true };
}
