import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getOptionalDb } from "./db";
import * as schema from "./db/schema";

const db = getOptionalDb();

export const auth = betterAuth({
  appName: "NoFats",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "local-build-placeholder-change-me-before-production",
  database: db
    ? drizzleAdapter(db, {
        provider: "pg",
        schema: {
          ...schema,
          user: schema.users,
          session: schema.sessions,
          account: schema.accounts,
          verification: schema.verifications,
        },
      })
    : undefined,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["ADMIN", "USER"],
        required: false,
        defaultValue: "USER",
        input: false,
      },
      disabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});

export type AppSession = typeof auth.$Infer.Session;
