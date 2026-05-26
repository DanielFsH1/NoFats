import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { people } from "@/lib/db/schema";
import { assertTrustedOrigin } from "@/lib/security/request";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const requestHeaders = await headers();
  assertTrustedOrigin(requestHeaders);

  return auth.api.getSession({
    headers: requestHeaders,
  });
}

export async function requireUser() {
  const session = await getSession();

  if (!session?.user || session.user.disabled) {
    redirect("/login");
  }

  const user = {
    ...session.user,
    role: session.user.role ?? "USER",
    disabled: Boolean(session.user.disabled),
  };

  const [person] = await getDb()
    .select()
    .from(people)
    .where(eq(people.userId, user.id))
    .limit(1);

  if (!person) {
    throw new Error("Tu usuario no tiene perfil asociado.");
  }

  return { session, user, person };
}

export async function requireAdmin() {
  const context = await requireUser();

  if (context.user.role !== "ADMIN") {
    redirect("/");
  }

  return context;
}
