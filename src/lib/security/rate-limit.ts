import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { auditLogs, rateLimits } from "@/lib/db/schema";
import { id } from "@/lib/ids";
import { getClientIp } from "@/lib/security/request";

export class RateLimitError extends Error {
  constructor() {
    super("Espera un momento antes de volver a intentar.");
    this.name = "RateLimitError";
  }
}

export type RateLimitAction =
  | "auth:login"
  | "auth:invite"
  | "admin:write"
  | "comment:create"
  | "daily:nickname"
  | "media:upload"
  | "nickname:add"
  | "nickname:remove"
  | "post:create"
  | "post:delete"
  | "profile:update"
  | "proposal:create"
  | "proposal:vote"
  | "settings:update";

const policies = {
  "auth:login": { max: 10, windowSeconds: 600 },
  "auth:invite": { max: 5, windowSeconds: 600 },
  "admin:write": { max: 30, windowSeconds: 600 },
  "comment:create": { max: 40, windowSeconds: 300 },
  "daily:nickname": { max: 80, windowSeconds: 3600 },
  "media:upload": { max: 12, windowSeconds: 3600 },
  "nickname:add": { max: 30, windowSeconds: 300 },
  "nickname:remove": { max: 20, windowSeconds: 300 },
  "post:create": { max: 30, windowSeconds: 300 },
  "post:delete": { max: 20, windowSeconds: 300 },
  "profile:update": { max: 30, windowSeconds: 600 },
  "proposal:create": { max: 20, windowSeconds: 600 },
  "proposal:vote": { max: 60, windowSeconds: 300 },
  "settings:update": { max: 30, windowSeconds: 600 },
} satisfies Record<RateLimitAction, { max: number; windowSeconds: number }>;

export function getRateLimitPolicy(action: RateLimitAction) {
  return policies[action];
}

export function hashRateLimitIdentifier(identifier: string) {
  return createHash("sha256")
    .update(`nofats:${identifier}`)
    .digest("hex");
}

export function getRateLimitWindowStart(now: Date, windowSeconds: number) {
  const windowMs = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

async function auditBlockedAttempt(input: {
  actorUserId?: string;
  action: RateLimitAction;
  scope: "ip" | "user";
  identifierHash: string;
}) {
  await getDb()
    .insert(auditLogs)
    .values({
      id: id("audit"),
      actorUserId: input.actorUserId,
      entityType: "security",
      entityId: input.identifierHash,
      action: `rate_limit.${input.action}`,
      after: { scope: input.scope },
    })
    .catch(() => undefined);
}

export async function assertRateLimit(input: {
  action: RateLimitAction;
  identifier: string;
  scope: "ip" | "user";
  actorUserId?: string;
}) {
  const policy = getRateLimitPolicy(input.action);
  const now = new Date();
  const identifierHash = hashRateLimitIdentifier(input.identifier);
  const windowStart = getRateLimitWindowStart(now, policy.windowSeconds);
  const rowId = hashRateLimitIdentifier(
    `${input.scope}:${identifierHash}:${input.action}:${windowStart.toISOString()}`,
  );
  const db = getDb();

  const [current] = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.scope, input.scope),
        eq(rateLimits.identifierHash, identifierHash),
        eq(rateLimits.action, input.action),
        eq(rateLimits.windowStart, windowStart),
      ),
    )
    .limit(1);

  if (!current) {
    await db.insert(rateLimits).values({
      id: rowId,
      scope: input.scope,
      identifierHash,
      action: input.action,
      windowStart,
      windowSeconds: policy.windowSeconds,
      count: 1,
    });
    return;
  }

  if (current.count >= policy.max) {
    await db
      .update(rateLimits)
      .set({
        blockedCount: current.blockedCount + 1,
        updatedAt: now,
      })
      .where(eq(rateLimits.id, current.id));
    await auditBlockedAttempt({
      actorUserId: input.actorUserId,
      action: input.action,
      scope: input.scope,
      identifierHash,
    });
    throw new RateLimitError();
  }

  await db
    .update(rateLimits)
    .set({ count: current.count + 1, updatedAt: now })
    .where(eq(rateLimits.id, current.id));
}

export async function rateLimitByUser(
  userId: string,
  action: RateLimitAction,
) {
  await assertRateLimit({
    action,
    identifier: userId,
    scope: "user",
    actorUserId: userId,
  });
}

export async function rateLimitByIp(
  action: RateLimitAction,
  providedHeaders?: Awaited<ReturnType<typeof headers>>,
) {
  const requestHeaders = providedHeaders ?? (await headers());
  await assertRateLimit({
    action,
    identifier: getClientIp(requestHeaders),
    scope: "ip",
  });
}
