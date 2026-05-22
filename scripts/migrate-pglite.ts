import "dotenv/config";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const dataDir = process.env.PGLITE_DATA_DIR ?? "";

if (!dataDir) {
  throw new Error("PGLITE_DATA_DIR is required for local PGlite migrations.");
}

async function main() {
  await mkdir(dirname(dataDir), { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "drizzle" });
  await client.close();
  console.log(`PGlite migrations applied in ${dataDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
