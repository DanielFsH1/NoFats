"use server";

import { put } from "@vercel/blob";
import { getDb } from "@/lib/db";
import { mediaAssets, people, proposals } from "@/lib/db/schema";
import { id } from "@/lib/ids";
import { canAddOwnProfileContentDirectly } from "@/lib/product/rules";
import { requireUser } from "@/lib/session";
import { getString, imageFileSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

export async function uploadImageAction(formData: FormData) {
  const { user } = await requireUser();
  const personId = getString(formData, "personId");
  const altText = getString(formData, "altText").trim().slice(0, 180);
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona una imagen valida.");
  }

  imageFileSchema.parse({ type: file.type, size: file.size });

  const db = getDb();
  const [target] = await db.select().from(people).where(eq(people.id, personId)).limit(1);

  if (!target) {
    throw new Error("Perfil no encontrado.");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const image = sharp(inputBuffer).rotate();
  const metadata = await image.metadata();
  const optimized = await image
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const thumbnail = await sharp(inputBuffer)
    .rotate()
    .resize({ width: 480, height: 480, fit: "cover" })
    .webp({ quality: 76 })
    .toBuffer();

  const mediaId = id("media");
  const pathname = `people/${personId}/${mediaId}.webp`;
  const thumbnailPathname = `people/${personId}/${mediaId}-thumb.webp`;
  const [blob, thumb] = await Promise.all([
    put(pathname, optimized, {
      access: "private",
      contentType: "image/webp",
    }),
    put(thumbnailPathname, thumbnail, {
      access: "private",
      contentType: "image/webp",
    }),
  ]);

  const canDirectlyEdit = canAddOwnProfileContentDirectly({
    actorId: user.id,
    targetUserId: target.userId,
  });

  if (canDirectlyEdit) {
    await db.insert(mediaAssets).values({
      id: mediaId,
      personId,
      uploadedByUserId: user.id,
      status: "APPROVED",
      url: blob.url,
      thumbnailUrl: thumb.url,
      pathname,
      thumbnailPathname,
      mimeType: "image/webp",
      sizeBytes: optimized.length,
      width: metadata.width,
      height: metadata.height,
      altText,
    });
  } else {
    await db.insert(proposals).values({
      id: id("proposal"),
      type: "ADD_IMAGE",
      targetPersonId: personId,
      createdByUserId: user.id,
      title: `${user.name} propone una foto`,
      summary: altText || "Foto propuesta para galeria.",
      payload: {
        url: blob.url,
        thumbnailUrl: thumb.url,
        pathname,
        thumbnailPathname,
        mimeType: "image/webp",
        sizeBytes: optimized.length,
        width: metadata.width,
        height: metadata.height,
        altText,
      },
    });
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/gallery");
  revalidatePath("/proposals");
}
