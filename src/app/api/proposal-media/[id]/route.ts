import { get } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { rejectExpiredProposals } from "@/lib/data/proposal-expiration";
import {
  assertCanViewPrivateMedia,
  PrivateMediaAccessError,
} from "@/lib/security/permissions";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  try {
    assertCanViewPrivateMedia(session);
  } catch (error) {
    if (error instanceof PrivateMediaAccessError) {
      return new Response(error.message, { status: error.status });
    }
    throw error;
  }

  await rejectExpiredProposals();

  const { id } = await context.params;
  const [proposal] = await getDb()
    .select()
    .from(proposals)
    .where(
      and(
        eq(proposals.id, id),
        eq(proposals.type, "ADD_IMAGE"),
        eq(proposals.status, "PENDING"),
      ),
    )
    .limit(1);

  if (!proposal) {
    return new Response("Not found", { status: 404 });
  }

  const payload = proposal.payload as {
    thumbnailUrl?: unknown;
    url?: unknown;
    mimeType?: unknown;
  };
  const { searchParams } = new URL(request.url);
  const selectedUrl =
    searchParams.get("size") === "full" ? payload.url : payload.thumbnailUrl;
  const blobUrl =
    typeof selectedUrl === "string"
      ? selectedUrl
      : typeof payload.url === "string"
        ? payload.url
        : null;

  if (!blobUrl) {
    return new Response("Not found", { status: 404 });
  }

  const blob = await get(blobUrl, { access: "private" });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "content-type":
        typeof payload.mimeType === "string" ? payload.mimeType : "image/webp",
      "cache-control": "private, max-age=120",
    },
  });
}
