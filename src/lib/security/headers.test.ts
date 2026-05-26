import { describe, expect, it } from "vitest";
import {
  getSecurityHeaders,
  getServerActionAllowedOrigins,
} from "./headers";

describe("security headers", () => {
  it("sets browser hardening headers without forcing strict CSP yet", () => {
    const headers = getSecurityHeaders();

    expect(headers).toContainEqual({
      key: "X-Content-Type-Options",
      value: "nosniff",
    });
    expect(headers).toContainEqual({
      key: "X-Frame-Options",
      value: "DENY",
    });
    expect(headers).toContainEqual({
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    });
    expect(headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "Content-Security-Policy-Report-Only" }),
      ]),
    );
    expect(
      headers.find((header) => header.key === "Content-Security-Policy"),
    ).toBeUndefined();
  });

  it("allows production, preview and local origins for server actions", () => {
    expect(getServerActionAllowedOrigins()).toEqual(
      expect.arrayContaining([
        "nofats.vercel.app",
        "*.vercel.app",
        "localhost:3000",
        "127.0.0.1:3000",
      ]),
    );
  });
});
