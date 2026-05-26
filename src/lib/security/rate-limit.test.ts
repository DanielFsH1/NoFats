import { describe, expect, it } from "vitest";
import {
  getRateLimitPolicy,
  getRateLimitWindowStart,
  hashRateLimitIdentifier,
} from "./rate-limit";

describe("rate limit policy", () => {
  it("uses generous limits for normal social actions and stricter limits for uploads", () => {
    expect(getRateLimitPolicy("post:create").max).toBeGreaterThanOrEqual(20);
    expect(getRateLimitPolicy("media:upload").max).toBeLessThan(
      getRateLimitPolicy("post:create").max,
    );
  });

  it("buckets attempts into stable windows", () => {
    const first = getRateLimitWindowStart(
      new Date("2026-05-25T10:04:59.000Z"),
      5 * 60,
    );
    const second = getRateLimitWindowStart(
      new Date("2026-05-25T10:05:01.000Z"),
      5 * 60,
    );

    expect(first.toISOString()).toBe("2026-05-25T10:00:00.000Z");
    expect(second.toISOString()).toBe("2026-05-25T10:05:00.000Z");
  });

  it("hashes identifiers instead of storing raw IPs or emails", () => {
    expect(hashRateLimitIdentifier("127.0.0.1")).toMatch(/^[a-f0-9]{64}$/);
    expect(hashRateLimitIdentifier("127.0.0.1")).not.toBe("127.0.0.1");
  });
});
