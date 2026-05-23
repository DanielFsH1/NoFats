import { EmptyState } from "@/components/app-shell";
import { EditableSiteText } from "@/components/editable-site-text";
import { PersonAvatar } from "@/components/person-avatar";
import { SubmitButton } from "@/components/submit-button";
import { getDashboardData } from "@/lib/data/queries";
import { createPostAction } from "@/lib/actions/app-actions";
import { getAppSettings } from "@/lib/data/settings";
import { formatDateTime } from "@/lib/product/dates";
import { proposalDisplayTitle } from "@/lib/product/presentation";
import { getProfileTheme } from "@/lib/product/profile-themes";
import { requireUser } from "@/lib/session";
import { Camera, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { person } = await requireUser();
  const [data, { siteCopy }] = await Promise.all([
    getDashboardData(),
    getAppSettings(),
  ]);
  const dailyPeople = data.people.filter((person) => person.dailyNickname);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface rounded-[28px] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
            <Sparkles className="size-4" aria-hidden />
            Apodos del dia
          </div>
          <h1 className="mt-3 text-4xl font-black sm:text-6xl">
            {dailyPeople[0]?.displayName ?? siteCopy.dashboardTitle}
          </h1>
          <div className="mt-4 max-w-2xl text-[var(--muted)]">
            <span>
              {siteCopy.dashboardSubtitle.replace(
                "{count}",
                String(dailyPeople.length),
              )}
            </span>
            <EditableSiteText
              field="dashboardSubtitle"
              value={siteCopy.dashboardSubtitle}
              multiline
              label="Editar texto de apodos del dia"
            />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {dailyPeople.slice(0, 6).map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="soft-card flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <PersonAvatar
                  dailyPhoto={person.dailyPhoto}
                  name={person.displayName}
                  size="sm"
                />
                <span>
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    {person.initialDisplayName}
                  </span>
                  <strong className="block text-lg">
                    {person.displayName}
                  </strong>
                </span>
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
                href={getPendingProposalHref(proposal)}
                className="soft-card flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <span>
                  <span className="block text-sm font-bold">
                    {proposalDisplayTitle(proposal)}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {proposal.approvals} a favor / {proposal.rejections} en
                    contra
                  </span>
                </span>
                <ChevronRight
                  className="size-4 text-[var(--muted)]"
                  aria-hidden
                />
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

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="surface rounded-[28px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">Personas</h2>
            <Link
              href="/people"
              className="text-sm font-bold text-[var(--accent)]"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.people.slice(0, 9).map((person) => {
              const theme = getProfileTheme(
                person.themeStyle,
                person.themeColor,
              );

              return (
                <Link
                  href={`/people/${person.id}`}
                  key={person.id}
                  className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <div className="h-20" style={{ background: theme.banner }} />
                  <div className="-mt-7 p-4">
                    <PersonAvatar
                      dailyPhoto={person.dailyPhoto}
                      name={person.displayName}
                      size="md"
                    />
                    <h3 className="mt-3 font-black group-hover:text-[var(--accent)]">
                      {person.displayName}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {person.nicknameCount} apodos / {person.photoCount} fotos
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface rounded-[28px] p-6">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <MessageCircle className="size-5" aria-hidden />
              Publicaciones
            </h2>
            <form action={createPostAction} className="mt-4 space-y-3">
              <input type="hidden" name="personId" value={person.id} />
              <textarea
                name="body"
                aria-label="Publicar en tu perfil"
                required
                placeholder="Publica algo desde el inicio..."
                className="field min-h-24 w-full p-3 text-sm"
              />
              <SubmitButton>Publicar</SubmitButton>
            </form>
            <div className="mt-4 space-y-3">
              {data.recentPosts.map((post) => (
                <article key={post.id} className="soft-card rounded-2xl p-4">
                  <p className="text-sm">{post.body}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <PersonAvatar
                      dailyPhoto={post.authorDailyPhoto}
                      name={post.authorName}
                      size="sm"
                      className="!size-9 !rounded-xl !border-2 text-xs"
                    />
                    <p className="text-xs text-[var(--muted)]">
                      <strong className="text-[var(--foreground)]">
                        {post.authorName}
                      </strong>{" "}
                      - {formatDateTime(post.createdAt)}
                    </p>
                  </div>
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

function getPendingProposalHref(proposal: {
  id: string;
  type: string;
  targetPersonId?: string | null;
}) {
  if (proposal.targetPersonId) {
    return `/people/${proposal.targetPersonId}`;
  }

  if (proposal.type === "CREATE_FICTIONAL_PERSON") {
    return "/people";
  }

  return `/proposals#${proposal.id}`;
}
