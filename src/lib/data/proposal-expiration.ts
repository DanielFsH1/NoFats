import { getDb } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { PROPOSAL_EXPIRATION_MS } from "@/lib/product/proposal-expiration";
import { and, eq, lt } from "drizzle-orm";

export async function rejectExpiredProposals(now = new Date()) {
  const cutoff = new Date(now.getTime() - PROPOSAL_EXPIRATION_MS);

  await getDb()
    .update(proposals)
    .set({
      status: "REJECTED",
      resolvedAt: now,
      updatedAt: now,
    })
    .where(
      and(eq(proposals.status, "PENDING"), lt(proposals.createdAt, cutoff)),
    );
}
