export const PROPOSAL_EXPIRATION_HOURS = 48;
export const PROPOSAL_EXPIRATION_MS =
  PROPOSAL_EXPIRATION_HOURS * 60 * 60 * 1000;

export function getProposalExpiresAt(createdAt: Date) {
  return new Date(createdAt.getTime() + PROPOSAL_EXPIRATION_MS);
}

export function isProposalExpired(createdAt: Date, now = new Date()) {
  return getProposalExpiresAt(createdAt).getTime() <= now.getTime();
}
