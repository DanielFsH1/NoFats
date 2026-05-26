export function getSecurityHeaders() {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src 'self' https: wss:",
  ].join("; ");

  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    { key: "Content-Security-Policy-Report-Only", value: csp },
  ];
}

export function getServerActionAllowedOrigins() {
  return [
    "nofats.vercel.app",
    "*.vercel.app",
    "localhost:3000",
    "localhost:3001",
    "127.0.0.1:3000",
    "127.0.0.1:3001",
  ];
}
