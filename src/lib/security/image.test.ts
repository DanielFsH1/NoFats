import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { assertSafeImageBuffer } from "./image";

describe("assertSafeImageBuffer", () => {
  it("accepts real raster images", async () => {
    const buffer = await sharp({
      create: {
        width: 4,
        height: 4,
        channels: 3,
        background: "#f00",
      },
    })
      .png()
      .toBuffer();

    await expect(assertSafeImageBuffer(buffer)).resolves.toMatchObject({
      width: 4,
      height: 4,
    });
  });

  it("rejects files whose bytes are not an image even if the extension lies", async () => {
    await expect(
      assertSafeImageBuffer(Buffer.from("<svg><script /></svg>")),
    ).rejects.toThrow("imagen valida");
  });
});
