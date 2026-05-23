import { PersonAvatar } from "@/components/person-avatar";
import { getPeopleSummaries } from "@/lib/data/queries";
import { getProfileTheme } from "@/lib/product/profile-themes";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const { person: currentPerson } = await requireUser();
  const people = await getPeopleSummaries();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-black">Personas</h1>
        <p className="mt-2 text-[var(--muted)]">
          Perfiles del grupo, apodos del dia y fotos que cambian con el
          calendario.
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => {
          const isOwnProfile = person.id === currentPerson.id;
          const theme = getProfileTheme(person.themeStyle, person.themeColor);

          return (
            <Link
              href={`/people/${person.id}`}
              key={person.id}
              className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div
                className="h-28 opacity-95"
                style={{
                  background: theme.banner,
                }}
              />
              <div className="-mt-10 p-5">
                <PersonAvatar
                  dailyPhoto={person.dailyPhoto}
                  name={person.displayName}
                  size="lg"
                />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black group-hover:text-[var(--accent)]">
                    {person.displayName}
                  </h2>
                  {isOwnProfile ? (
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-1 text-xs font-black text-[var(--accent)]">
                      Tu perfil
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-[var(--muted)]">
                  {person.bio ||
                    person.phrase ||
                    "Perfil listo para personalizar."}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 font-semibold">
                    {person.nicknameCount} apodos
                  </span>
                  {person.dailyNickname || person.dailyPhoto ? (
                    <span className="font-bold text-[var(--coral)]">Hoy</span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
