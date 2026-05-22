import { get } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const [asset] = await getDb()
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, id), isNull(mediaAssets.deletedAt)))
    .limit(1);

  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  const blob = await get(asset.url, { access: "private" });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "content-type": asset.mimeType,
      "cache-control": "private, max-age=600",
    },
  });
}
