import { InviteForm } from "@/components/invite-form";
import { getDb } from "@/lib/db";
import { registrationSlots } from "@/lib/db/schema";
import { hashInviteToken } from "@/lib/security/token";
import { and, eq } from "drizzle-orm";
import Link from "next/link";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [slot] = await getDb()
    .select()
    .from(registrationSlots)
    .where(
      and(
        eq(registrationSlots.tokenHash, hashInviteToken(token)),
        eq(registrationSlots.status, "PENDING"),
      ),
    )
    .limit(1);

  if (!slot || (slot.expiresAt && slot.expiresAt < new Date())) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <section className="surface max-w-lg rounded-[28px] p-8">
          <h1 className="text-3xl font-black">Invitacion no disponible</h1>
          <p className="mt-3 text-[var(--muted)]">
            Este cupo ya fue usado, desactivado o expiro.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-[var(--accent)] px-4 font-semibold text-white"
          >
            Ir a login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="surface w-full max-w-2xl rounded-[28px] p-8 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
          Cupo para {slot.shortName}
        </p>
        <h1 className="mt-3 text-4xl font-black">Crea tu cuenta</h1>
        <p className="mt-3 text-[var(--muted)]">
          El nombre visible inicial sera &quot;{slot.shortName}&quot;. Tu nombre completo
          se guardara dentro de tu perfil.
        </p>
        <div className="mt-8">
          <InviteForm token={token} />
        </div>
      </section>
    </main>
  );
}
