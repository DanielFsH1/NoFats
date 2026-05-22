import "dotenv/config";
import { auth } from "../src/lib/auth";
import { getDb } from "../src/lib/db";
import { nicknames, people, users } from "../src/lib/db/schema";
import { id } from "../src/lib/ids";
import { eq } from "drizzle-orm";

function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function main() {
  const email = required("ADMIN_EMAIL");
  const password = required("ADMIN_PASSWORD");
  const fullName = required("ADMIN_FULL_NAME");
  const shortName = required("ADMIN_SHORT_NAME");
  const db = getDb();

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName,
      },
    });
    [user] = await db.select().from(users).where(eq(users.id, response.user.id)).limit(1);
  }

  if (!user) {
    throw new Error("Admin user could not be created.");
  }

  await db
    .update(users)
    .set({ role: "ADMIN", disabled: false, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  const [existingPerson] = await db
    .select()
    .from(people)
    .where(eq(people.userId, user.id))
    .limit(1);

  if (!existingPerson) {
    const personId = id("person");
    const nicknameId = id("nick");
    await db.insert(people).values({
      id: personId,
      userId: user.id,
      kind: "REAL",
      initialDisplayName: shortName,
      fullName,
      primaryNicknameId: nicknameId,
      createdByUserId: user.id,
    });
    await db.insert(nicknames).values({
      id: nicknameId,
      personId,
      value: shortName,
      status: "TEMPORARY",
      isTemporary: true,
      proposedByUserId: user.id,
    });
  }

  console.log(`Admin ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
