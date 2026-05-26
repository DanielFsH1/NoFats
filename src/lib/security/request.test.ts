import { describe, expect, it } from "vitest";
import { isTrustedOrigin } from "./request";

describe("isTrustedOrigin", () => {
  it("accepts same-origin requests and configured Vercel previews", () => {
    expect(
      isTrustedOrigin({
        origin: "https://nofats.vercel.app",
        host: "nofats.vercel.app",
      }),
    ).toBe(true);
    expect(
      isTrustedOrigin({
        origin: "https://nofats-abc-silvaherreradanielfelipe402-1116s-projects.vercel.app",
        host: "nofats-abc-silvaherreradanielfelipe402-1116s-projects.vercel.app",
      }),
    ).toBe(true);
  });

  it("rejects cross-site origins when cookies could be present", () => {
    expect(
      isTrustedOrigin({
        origin: "https://evil.example",
        host: "nofats.vercel.app",
      }),
    ).toBe(false);
  });

  it("allows requests without origin for normal page loads and server-side calls", () => {
    expect(isTrustedOrigin({ origin: null, host: "nofats.vercel.app" })).toBe(
      true,
    );
  });
});
