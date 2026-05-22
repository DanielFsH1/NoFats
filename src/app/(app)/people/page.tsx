import { getPeopleSummaries } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  await requireUser();
  const people = await getPeopleSummaries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Personas</h1>
        <p className="mt-2 text-[var(--muted)]">
          Todos los perfiles se muestran igual; lo real y lo ficticio vive solo en permisos internos.
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {people.map((person) => (
          <Link
            href={`/people/${person.id}`}
            key={person.id}
            className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="h-28" style={{ backgroundColor: person.themeColor }} />
            <div className="-mt-10 p-5">
              <div className="grid size-20 place-items-center rounded-3xl border-4 border-white bg-[var(--surface-strong)] text-2xl font-black">
                {person.displayName.slice(0, 2).toUpperCase()}
              </div>
              <h2 className="mt-4 text-xl font-black group-hover:text-[var(--accent)]">
                {person.displayName}
              </h2>
              <p className="mt-1 line-clamp-2 min-h-10 text-sm text-[var(--muted)]">
                {person.bio || person.phrase || "Perfil listo para personalizar."}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 font-semibold">
                  {person.nicknameCount} apodos
                </span>
                {person.dailyNickname ? (
                  <span className="font-bold text-[var(--coral)]">Hoy</span>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
