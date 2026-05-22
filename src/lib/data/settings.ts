import { getDb, getOptionalDb } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import {
  defaultSiteCopy,
  defaultVoteSettings,
  mergeSiteCopy,
  normalizeVoteSettings,
  type SiteCopy,
  type VoteSettings,
} from "@/lib/product/rules";
import { eq } from "drizzle-orm";

const SITE_COPY_KEY = "site_copy";
const VOTING_KEY = "voting";

export type AppSettings = {
  siteCopy: SiteCopy;
  voteSettings: VoteSettings;
};

export async function getAppSettings(): Promise<AppSettings> {
  const db = getOptionalDb();

  if (!db) {
    return {
      siteCopy: defaultSiteCopy,
      voteSettings: defaultVoteSettings,
    };
  }

  try {
    const rows = await db.select().from(appSettings);
    const siteCopy = rows.find((row) => row.key === SITE_COPY_KEY)?.value;
    const voteSettings = rows.find((row) => row.key === VOTING_KEY)?.value;

    return {
      siteCopy: mergeSiteCopy(siteCopy as Partial<SiteCopy> | undefined),
      voteSettings: normalizeVoteSettings(
        voteSettings as Partial<VoteSettings> | undefined,
      ),
    };
  } catch {
    return {
      siteCopy: defaultSiteCopy,
      voteSettings: defaultVoteSettings,
    };
  }
}

export async function saveSiteCopy(value: SiteCopy, updatedByUserId?: string) {
  await getDb()
    .insert(appSettings)
    .values({
      key: SITE_COPY_KEY,
      value,
      updatedByUserId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value,
        updatedByUserId,
        updatedAt: new Date(),
      },
    });
}

export async function saveVoteSettings(
  value: VoteSettings,
  updatedByUserId?: string,
) {
  await getDb()
    .insert(appSettings)
    .values({
      key: VOTING_KEY,
      value,
      updatedByUserId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value,
        updatedByUserId,
        updatedAt: new Date(),
      },
    });
}

export async function getRawAppSetting(key: string) {
  const [setting] = await getDb()
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);

  return setting ?? null;
}
