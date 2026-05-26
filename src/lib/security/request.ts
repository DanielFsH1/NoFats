type HeaderReader = {
  get(name: string): string | null;
};

const trustedHostPatterns = [/^nofats\.vercel\.app$/i, /\.vercel\.app$/i];
const trustedLocalHosts = new Set([
  "localhost",
  "localhost:3000",
  "localhost:3001",
  "127.0.0.1",
  "127.0.0.1:3000",
  "127.0.0.1:3001",
]);

function normalizeHost(value: string) {
  return value.trim().toLowerCase();
}

function isTrustedHost(host: string) {
  const normalized = normalizeHost(host);

  return (
    trustedLocalHosts.has(normalized) ||
    trustedHostPatterns.some((pattern) => pattern.test(normalized))
  );
}

export function isTrustedOrigin(input: { origin: string | null; host: string }) {
  if (!input.origin) {
    return true;
  }

  let parsed: URL;
  try {
    parsed = new URL(input.origin);
  } catch {
    return false;
  }

  const originHost = normalizeHost(parsed.host);
  const host = normalizeHost(input.host);

  if (originHost === host) {
    return true;
  }

  return isTrustedHost(originHost) && isTrustedHost(host);
}

export function assertTrustedOrigin(headersList: HeaderReader) {
  const origin = headersList.get("origin");
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    process.env.VERCEL_URL ??
    "localhost:3000";

  if (!isTrustedOrigin({ origin, host })) {
    throw new Error("No pudimos validar el origen de la solicitud.");
  }
}

export function getClientIp(headersList: HeaderReader) {
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headersList.get("x-real-ip") ??
    headersList.get("cf-connecting-ip") ??
    "unknown"
  );
}
