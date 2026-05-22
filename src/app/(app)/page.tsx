import { EmptyState } from "@/components/app-shell";
import { getDashboardData } from "@/lib/data/queries";
import { getAppSettings } from "@/lib/data/settings";
import { formatDateTime } from "@/lib/product/dates";
import { requireUser } from "@/lib/session";
import {
  Camera,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireUser();
  const [data, { siteCopy }] = await Promise.all([
    getDashboardData(),
    getAppSettings(),
  ]);
  const dailyPeople = data.people.filter((person) => person.dailyNickname);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface rounded-[28px] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
            <Sparkles className="size-4" aria-hidden />
            Apodos del dia
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            {dailyPeople[0]?.displayName ?? siteCopy.dashboardTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            {siteCopy.dashboardSubtitle.replace(
              "{count}",
              String(dailyPeople.length),
            )}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dailyPeople.slice(0, 6).map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="rounded-2xl border border-[var(--border)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-xs font-semibold text-[var(--muted)]">
                  {person.initialDisplayName}
                </span>
                <strong className="mt-1 block text-lg">{person.displayName}</strong>
              </Link>
            ))}
          </div>
        </div>
        <div className="surface rounded-[28px] p-6">
          <h2 className="text-xl font-black">Pendientes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Votaciones que necesitan ojos del grupo.
          </p>
          <div className="mt-5 space-y-3">
            {data.pendingProposals.slice(0, 4).map((proposal) => (
              <Link
                key={proposal.id}
                href="/proposals"
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-4"
              >
                <span>
                  <span className="block text-sm font-bold">{proposal.title}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {proposal.approvals} aprueban / {proposal.rejections} rechazan
                  </span>
                </span>
                <ChevronRight className="size-4 text-[var(--muted)]" aria-hidden />
              </Link>
            ))}
            {data.pendingProposals.length === 0 ? (
              <EmptyState
                title="Sin votaciones pendientes"
                body="El grupo esta en paz por ahora."
              />
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="surface rounded-[28px] p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">Personas</h2>
            <Link href="/people" className="text-sm font-bold text-[var(--accent)]">
              Ver todas
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.people.slice(0, 9).map((person) => (
              <Link
                href={`/people/${person.id}`}
                key={person.id}
                className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
              >
                <div
                  className="h-20"
                  style={{ backgroundColor: person.themeColor }}
                />
                <div className="-mt-7 p-4">
                  <div className="grid size-14 place-items-center rounded-2xl border-4 border-white bg-[var(--surface-strong)] text-lg font-black">
                    {person.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="mt-3 font-black group-hover:text-[var(--accent)]">
                    {person.displayName}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {person.nicknameCount} apodos
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface rounded-[28px] p-6">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <MessageCircle className="size-5" aria-hidden />
              Publicaciones
            </h2>
            <div className="mt-4 space-y-3">
              {data.recentPosts.map((post) => (
                <article key={post.id} className="rounded-2xl bg-white p-4">
                  <p className="text-sm">{post.body}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {post.authorName} · {formatDateTime(post.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="surface rounded-[28px] p-6">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Camera className="size-5" aria-hidden />
              Fotos recientes
            </h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {data.recentMedia.map((asset) => (
                <Image
                  key={asset.id}
                  src={`/api/media/${asset.id}`}
                  alt={asset.altText || "Foto del grupo"}
                  width={160}
                  height={160}
                  unoptimized
                  className="aspect-square rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
