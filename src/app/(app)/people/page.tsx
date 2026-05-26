import { PaginationControls } from "@/components/pagination-controls";
import { PersonAvatar } from "@/components/person-avatar";
import { getPeopleSummaries } from "@/lib/data/queries";
import { paginateItems, parsePageParam } from "@/lib/product/pagination";
import { getProfileTheme } from "@/lib/product/profile-themes";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { person: currentPerson } = await requireUser();
  const [people, query] = await Promise.all([
    getPeopleSummaries(),
    searchParams,
  ]);
  const peoplePage = paginateItems(people, {
    page: parsePageParam(query.page),
    pageSize: 16,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-black sm:text-4xl">Personas</h1>
        <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
          Perfiles del grupo, apodos del dia y fotos que cambian con el
          calendario.
        </p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {peoplePage.items.map((person) => {
          const isOwnProfile = person.id === currentPerson.id;
          const theme = getProfileTheme(person.themeStyle, person.themeColor);

          return (
            <Link
              href={`/people/${person.id}`}
              key={person.id}
              className="group relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] card-interactive"
            >
              {person.pendingProposalCount > 0 ? (
                <span
                  className="animate-pulse-badge absolute right-3 top-3 z-10 grid min-h-6 min-w-6 place-items-center rounded-full bg-[var(--danger)] px-2 text-xs font-black text-[var(--danger-contrast)] shadow-[var(--shadow-soft)]"
                  aria-label={`${person.pendingProposalCount} pendientes por aprobar`}
                >
                  {person.pendingProposalCount}
                </span>
              ) : null}
              <div
                className="h-28 opacity-95 transition-all duration-300 group-hover:scale-105"
                style={{
                  background: theme.banner,
                }}
              />
              <div className="-mt-10 p-4 sm:p-5">
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
      <PaginationControls
        page={peoplePage.page}
        totalPages={peoplePage.totalPages}
        searchParams={query}
      />
    </div>
  );
}
