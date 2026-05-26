import { describe, expect, it } from "vitest";
import { getImageProposalPathnames } from "./media-proposals";

describe("getImageProposalPathnames", () => {
  it("extracts safe blob pathnames from image proposal payloads", () => {
    expect(
      getImageProposalPathnames({
        pathname: "people/p1/media.webp",
        thumbnailPathname: "people/p1/media-thumb.webp",
      }),
    ).toEqual(["people/p1/media.webp", "people/p1/media-thumb.webp"]);
  });

  it("ignores missing, empty, external or duplicated values", () => {
    expect(
      getImageProposalPathnames({
        pathname: "https://blob.vercel-storage.com/file.webp",
        thumbnailPathname: " people/p1/media-thumb.webp ",
        another: "people/p1/media-thumb.webp",
      }),
    ).toEqual(["people/p1/media-thumb.webp"]);
  });
});
