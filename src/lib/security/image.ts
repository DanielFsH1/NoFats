import type { Metadata } from "sharp";
import sharp from "sharp";

const allowedFormats = new Set(["jpeg", "png", "webp", "gif"]);

export async function assertSafeImageBuffer(buffer: Buffer): Promise<Metadata> {
  try {
    const metadata = await sharp(buffer, {
      failOn: "error",
      limitInputPixels: 36_000_000,
    }).metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      !metadata.format ||
      !allowedFormats.has(metadata.format)
    ) {
      throw new Error("invalid image");
    }

    return metadata;
  } catch {
    throw new Error("Selecciona una imagen valida.");
  }
}
