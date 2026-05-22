import { getDb } from "@/lib/db";
import {
  dailyNicknameAssignments,
  dailyNicknameNominations,
  nicknames,
  people,
  users,
} from "@/lib/db/schema";
import { id } from "@/lib/ids";
import { getDateKey } from "@/lib/product/dates";
import { chooseDailyNickname } from "@/lib/product/rules";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";

export async function materializeDailyNicknames(dateKey = getDateKey()) {
  const db = getDb();
  const activePeople = await db
    .select({ id: people.id })
    .from(people)
    .leftJoin(users, eq(people.userId, users.id))
    .where(
      and(
        eq(people.status, "ACTIVE"),
        isNull(people.deletedAt),
        sql`(${users.role} is null or ${users.role} <> 'ADMIN')`,
      ),
    );

  for (const person of activePeople) {
    const [existing] = await db
      .select({ id: dailyNicknameAssignments.id })
      .from(dailyNicknameAssignments)
      .where(
        and(
          eq(dailyNicknameAssignments.personId, person.id),
          eq(dailyNicknameAssignments.forDate, dateKey),
        ),
      )
      .limit(1);

    if (existing) {
      continue;
    }

    const approvedNicknames = await db
      .select({ id: nicknames.id, value: nicknames.value })
      .from(nicknames)
      .where(
        and(
          eq(nicknames.personId, person.id),
          eq(nicknames.status, "APPROVED"),
          isNull(nicknames.deletedAt),
        ),
      );

    if (approvedNicknames.length === 0) {
      continue;
    }

    const nominations = await db
      .select({
        nicknameId: dailyNicknameNominations.nicknameId,
        createdAt: dailyNicknameNominations.createdAt,
      })
      .from(dailyNicknameNominations)
      .where(
        and(
          eq(dailyNicknameNominations.personId, person.id),
          eq(dailyNicknameNominations.forDate, dateKey),
          inArray(
            dailyNicknameNominations.nicknameId,
            approvedNicknames.map((nickname) => nickname.id),
          ),
        ),
      );

    const selected = chooseDailyNickname({
      dateKey,
      personId: person.id,
      nicknames: approvedNicknames,
      nominations,
    });

    if (!selected) {
      continue;
    }

    await db.insert(dailyNicknameAssignments).values({
      id: id("daily"),
      personId: person.id,
      nicknameId: selected.id,
      forDate: dateKey,
      source: nominations.length > 0 ? "nominated" : "automatic",
    });
  }
}
