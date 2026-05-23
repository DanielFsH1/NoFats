import { getDb } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { deleteImageProposalBlobs } from "@/lib/data/media-cleanup";
import { PROPOSAL_EXPIRATION_MS } from "@/lib/product/proposal-expiration";
import { and, eq, lt } from "drizzle-orm";

export async function rejectExpiredProposals(now = new Date()) {
  const db = getDb();
  const cutoff = new Date(now.getTime() - PROPOSAL_EXPIRATION_MS);
  const expiredImageProposals = await db
    .select({ payload: proposals.payload })
    .from(proposals)
    .where(
      and(
        eq(proposals.status, "PENDING"),
        eq(proposals.type, "ADD_IMAGE"),
        lt(proposals.createdAt, cutoff),
      ),
    );

  await db
    .update(proposals)
    .set({
      status: "REJECTED",
      resolvedAt: now,
      updatedAt: now,
    })
    .where(
      and(eq(proposals.status, "PENDING"), lt(proposals.createdAt, cutoff)),
    );

  await Promise.all(
    expiredImageProposals.map((proposal) =>
      deleteImageProposalBlobs(proposal.payload),
    ),
  );
}
