"use server";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  activityEvents,
  auditLogs,
  nicknames,
  people,
  registrationSlots,
  users,
} from "@/lib/db/schema";
import { id } from "@/lib/ids";
import { hashInviteToken } from "@/lib/security/token";
import {
  emailSchema,
  getString,
  inviteRegistrationSchema,
  passwordSchema,
} from "@/lib/validation";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type FormState = {
  ok?: boolean;
  message?: string;
};

function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function signInWithPasswordAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsedEmail = emailSchema.safeParse(getString(formData, "email"));
  const parsedPassword = passwordSchema.safeParse(getString(formData, "password"));
  const next = safeNextPath(getString(formData, "next") || "/");

  if (!parsedEmail.success || !parsedPassword.success) {
    return { message: "Correo o contrasena invalidos." };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: parsedEmail.data,
        password: parsedPassword.data,
        callbackURL: next,
        rememberMe: true,
      },
      headers: await headers(),
    });
  } catch {
    return { message: "No pudimos iniciar sesion con esos datos." };
  }

  redirect(next);
}

export async function registerWithInvite(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = inviteRegistrationSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    confirmPassword: getString(formData, "confirmPassword"),
    fullName: getString(formData, "fullName"),
    token: getString(formData, "token"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const db = getDb();
  const tokenHash = hashInviteToken(parsed.data.token);
  const [slot] = await db
    .select()
    .from(registrationSlots)
    .where(
      and(
        eq(registrationSlots.tokenHash, tokenHash),
        eq(registrationSlots.status, "PENDING"),
      ),
    )
    .limit(1);

  if (!slot || (slot.expiresAt && slot.expiresAt < new Date())) {
    return { message: "La invitacion ya no esta disponible." };
  }

  const response = await auth.api.signUpEmail({
    body: {
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.fullName,
    },
    headers: await headers(),
  });
  const user = response.user;
  const personId = id("person");
  const nicknameId = id("nick");

  await db.insert(people).values({
    id: personId,
    userId: user.id,
    kind: "REAL",
    initialDisplayName: slot.shortName,
    fullName: parsed.data.fullName,
    createdByUserId: slot.createdByUserId,
    primaryNicknameId: nicknameId,
  });

  await db.insert(nicknames).values({
    id: nicknameId,
    personId,
    value: slot.shortName,
    status: "TEMPORARY",
    isTemporary: true,
    proposedByUserId: user.id,
  });

  await db
    .update(registrationSlots)
    .set({
      status: "USED",
      usedByUserId: user.id,
      usedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(registrationSlots.id, slot.id));

  await db.insert(activityEvents).values({
    id: id("act"),
    actorUserId: user.id,
    personId,
    type: "registration.completed",
    message: `${slot.shortName} entro al grupo.`,
  });

  await db.insert(auditLogs).values({
    id: id("audit"),
    actorUserId: user.id,
    entityType: "registration_slot",
    entityId: slot.id,
    action: "used",
    after: { userId: user.id, personId },
  });

  redirect("/");
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/login");
}

export async function ensureUserIsActive(userId: string) {
  const [user] = await getDb()
    .select({ disabled: users.disabled })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return Boolean(user && !user.disabled);
}
