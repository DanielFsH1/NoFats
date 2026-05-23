import { describe, expect, it } from "vitest";
import {
  getProposalExpiresAt,
  isProposalExpired,
  PROPOSAL_EXPIRATION_HOURS,
} from "./proposal-expiration";

describe("proposal expiration", () => {
  it("expires pending proposals after 48 hours", () => {
    const createdAt = new Date("2026-05-20T10:00:00.000Z");

    expect(PROPOSAL_EXPIRATION_HOURS).toBe(48);
    expect(getProposalExpiresAt(createdAt)).toEqual(
      new Date("2026-05-22T10:00:00.000Z"),
    );
    expect(
      isProposalExpired(createdAt, new Date("2026-05-22T09:59:59.000Z")),
    ).toBe(false);
    expect(
      isProposalExpired(createdAt, new Date("2026-05-22T10:00:00.000Z")),
    ).toBe(true);
  });
});
