import { neon } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

type AppDb = ReturnType<typeof createDb>;

const globalForDb = globalThis as typeof globalThis & {
  __nofatsDb?: AppDb;
};

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return drizzle(neon(databaseUrl), { schema });
  }

  const pgliteDataDir = process.env.PGLITE_DATA_DIR;

  if (pgliteDataDir) {
    return drizzlePglite(new PGlite(pgliteDataDir), { schema });
  }

  throw new Error("DATABASE_URL or PGLITE_DATA_DIR is required for database access.");
}

export function getDb() {
  if (!globalForDb.__nofatsDb) {
    globalForDb.__nofatsDb = createDb();
  }

  return globalForDb.__nofatsDb;
}

export function getOptionalDb() {
  if (!process.env.DATABASE_URL && !process.env.PGLITE_DATA_DIR) {
    return null;
  }

  return getDb();
}
