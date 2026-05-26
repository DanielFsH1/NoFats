import { EmptyState } from "@/components/app-shell";
import { ExpandablePanel } from "@/components/expandable-panel";
import { ImageUploadForm } from "@/components/image-upload-form";
import { MediaLightbox } from "@/components/media-lightbox";
import { NicknameList } from "@/components/nickname-list";
import { NicknameProposalList } from "@/components/nickname-proposal-list";
import { PersonAvatar } from "@/components/person-avatar";
import { SubmitButton } from "@/components/submit-button";
import {
  addCommentAction,
  addNicknameAction,
  createPostAction,
  deletePostAction,
  nominateDailyNicknameAction,
  removeImageAction,
  removeNicknameAction,
  updateProfileAction,
  voteProposalAction,
} from "@/lib/actions/app-actions";
import { PaginationControls } from "@/components/pagination-controls";
import { uploadImageAction } from "@/lib/actions/media-actions";
import { getPersonProfile, getVotingThreshold } from "@/lib/data/queries";
import { getAppSettings } from "@/lib/data/settings";
import { formatDateTime } from "@/lib/product/dates";
import { paginateItems, parsePageParam } from "@/lib/product/pagination";
import {
  getProfileTheme,
  profileThemeOptions,
} from "@/lib/product/profile-themes";
import { canManagePerson, getProposalThresholds } from "@/lib/product/rules";
import { requireUser } from "@/lib/session";
import {
  Camera,
  Check,
  ChevronDown,
  FileText,
  MessageCircle,
  Pencil,
  Quote,
  Sparkles,
  Trash2,
  Type,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ user }, { id }, query, eligibleUsers, settings] = await Promise.all([
    requireUser(),
    params,
    searchParams,
    getVotingThreshold(),
    getAppSettings(),
  ]);
  const profile = await getPersonProfile(id, {
    includeAdminProfiles: user.role === "ADMIN",
    currentUserId: user.id,
  });

  if (!profile) {
    notFound();
  }

  const canEdit = canManagePerson({
    actor: { id: user.id, role: user.role },
    target: { kind: profile.person.kind, userId: profile.person.userId },
  });

  const approvedNicknames = profile.nicknames.filter(
    (nickname) =>
      nickname.status === "APPROVED" || nickname.status === "TEMPORARY",
  );
  const nicknameProposals = profile.pendingProposals.filter(
    (proposal) =>
      proposal.type === "ADD_NICKNAME" || proposal.type === "REMOVE_NICKNAME",
  );
  const imageProposals = profile.pendingProposals.filter(
    (proposal) => proposal.type === "ADD_IMAGE" || proposal.type === "REMOVE_IMAGE",
  );
  const approvedMedia = profile.media.filter((asset) => asset.status === "APPROVED");
  const mediaPage = paginateItems(approvedMedia, {
    page: parsePageParam(query.fotos),
    pageSize: 12,
  });
  const postsPage = paginateItems(profile.posts, {
    page: parsePageParam(query.publicaciones),
    pageSize: 8,
  });
  const thresholds = getProposalThresholds(
    eligibleUsers,
    settings.voteSettings,
  );
  const profileTheme = getProfileTheme(
    profile.person.themeStyle,
    profile.person.themeColor,
  );
  const themedPageStyle = {
    background: profileTheme.page,
    color: profileTheme.text,
    "--foreground": profileTheme.text,
    "--muted": profileTheme.muted,
    "--surface": profileTheme.panel,
    "--surface-muted": profileTheme.surfaceMuted,
    "--surface-strong": profileTheme.surfaceStrong,
    "--border": profileTheme.border,
    "--accent": profileTheme.accent,
    "--accent-ink": profileTheme.accentInk,
    "--accent-contrast": profileTheme.accentContrast,
    "--accent-hover": profileTheme.accentHover,
    "--shadow": profileTheme.shadow,
    "--shadow-soft": profileTheme.shadowSoft,
  } as CSSProperties;

  return (
    <div
      className="relative left-1/2 -my-6 w-screen -translate-x-1/2 overflow-hidden px-3 py-6 sm:px-6 lg:-my-8 lg:py-8"
      style={themedPageStyle}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: profileTheme.page }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25 mix-blend-soft-light"
        style={{ background: profileTheme.banner }}
      />
      <div className="relative z-10 mx-auto max-w-6xl space-y-5 sm:space-y-6">
        <section
          className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
          style={{
            background: profileTheme.surface,
            color: profileTheme.text,
            borderColor: profileTheme.border,
          }}
        >
          <div
            className="relative h-48 overflow-hidden sm:h-64"
            style={{ background: profileTheme.banner }}
          >
            {profile.person.dailyPhoto ? (
              <Image
                src={`/api/media/${profile.person.dailyPhoto.id}`}
                alt={profile.person.dailyPhoto.altText || "Foto del dia"}
                fill
                sizes="100vw"
                unoptimized
                className="object-cover opacity-45 saturate-125"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(0_0_0/0.18),transparent_44%,rgb(255_255_255/0.14))]" />
          </div>
          <div className="-mt-16 p-4 sm:p-6 lg:p-8">
            <PersonAvatar
              dailyPhoto={profile.person.dailyPhoto}
              name={profile.person.displayName}
              size="xl"
              className="border-8 ring-4 ring-[color-mix(in_srgb,var(--accent)_25%,transparent)] ring-offset-2 ring-offset-[var(--surface)]"
            />
            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
              <div>
                <p className="text-sm font-bold uppercase text-[var(--accent)]">
                  {profile.person.dailyNickname || profile.person.dailyPhoto
                    ? "Hoy en el perfil"
                    : "Perfil"}
                </p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl lg:text-6xl">
                  {profile.person.displayName}
                </h1>
                {profile.person.fullName ? (
                  <p
                    className="mt-3 text-lg"
                    style={{ color: profileTheme.muted }}
                  >
                    {profile.person.fullName}
                  </p>
                ) : null}
                <p
                  className="mt-4 max-w-3xl"
                  style={{ color: profileTheme.muted }}
                >
                  {profile.person.description ||
                    profile.person.bio ||
                    "Sin descripcion todavia."}
                </p>
              </div>
              <div
                className="rounded-3xl border border-[var(--border)] p-4 sm:p-5"
                style={{
                  background: profileTheme.panel,
                  borderColor: profileTheme.border,
                }}
              >
                <p
                  className="text-sm font-bold"
                  style={{ color: profileTheme.muted }}
                >
                  Frase
                </p>
                <p className="mt-2 text-xl font-black">
                  {profile.person.phrase ||
                    "Pendiente de una frase legendaria."}
                </p>
                <p
                  className="mt-4 text-sm"
                  style={{ color: profileTheme.muted }}
                >
                  {approvedNicknames.length} apodos / {profile.media.length}{" "}
                  fotos
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface rounded-[28px] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Sparkles className="size-5" aria-hidden />
                Apodos
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {approvedNicknames.length} aprobados /{" "}
                {nicknameProposals.length} pendientes
              </p>
            </div>
            <form
              action={addNicknameAction}
              className="flex w-full gap-2 sm:max-w-md"
            >
              <input type="hidden" name="personId" value={profile.person.id} />
              <input
                name="nickname"
                aria-label="Nuevo apodo"
                required
                placeholder="Nuevo apodo"
                className="field h-11 min-w-0 flex-1 px-3"
              />
              <SubmitButton variant="secondary">Agregar</SubmitButton>
            </form>
          </div>

          <div className="mt-5 grid min-h-0 gap-4 xl:grid-cols-2">
            <ExpandablePanel
              title="Apodos aprobados"
              count={approvedNicknames.length}
              openLabel="Ver apodos"
            >
              <NicknameList
                nicknames={approvedNicknames.map((nickname) => ({
                  id: nickname.id,
                  value: nickname.value,
                  status: nickname.status,
                  tomorrowNominationCount:
                    nickname.tomorrowNominationCount,
                  nominatedByCurrentUserForTomorrow:
                    nickname.nominatedByCurrentUserForTomorrow,
                  voteComments: nickname.voteComments,
                }))}
                personId={profile.person.id}
                nominateAction={nominateDailyNicknameAction}
                removeAction={removeNicknameAction}
              />
            </ExpandablePanel>

            <ExpandablePanel
              title="Pendientes de aprobacion"
              count={nicknameProposals.length}
              openLabel="Ver pendientes"
            >
              <NicknameProposalList
                proposals={nicknameProposals}
                currentUserId={user.id}
                approvalThreshold={thresholds.approvalThreshold}
                rejectionThreshold={thresholds.rejectionThreshold}
                voteAction={voteProposalAction}
              />
            </ExpandablePanel>
          </div>
        </section>

        <section className="surface rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black">
                <Camera className="size-5" aria-hidden />
                Galeria
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Las fotos aprobadas rotan como foto de perfil del dia. Toca una
                imagen para verla completa sin salir del perfil.
              </p>
            </div>
            <div className="w-full lg:max-w-sm">
              <ImageUploadForm
                action={uploadImageAction}
                personId={profile.person.id}
              />
            </div>
          </div>

          {imageProposals.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Fotos pendientes de aprobacion
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {imageProposals.map((proposal) => {
                  const payload = proposal.payload as {
                    mediaId?: unknown;
                    altText?: unknown;
                    width?: unknown;
                    height?: unknown;
                  };
                  const label =
                    typeof payload.altText === "string" && payload.altText
                      ? payload.altText
                      : "Foto propuesta";
                  const totalNeeded = Math.max(
                    thresholds.approvalThreshold,
                    thresholds.rejectionThreshold,
                    1,
                  );
                  const approvalWidth = Math.min(
                    100,
                    Math.round((proposal.approvals / totalNeeded) * 100),
                  );
                  const rejectionWidth = Math.min(
                    100,
                    Math.round((proposal.rejections / totalNeeded) * 100),
                  );
                  const currentVote = proposal.votes.find(
                    (vote) => vote.userId === user.id,
                  )?.decision;

                  return (
                    <details
                      key={proposal.id}
                      name="image-proposals"
                      className="group rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 sm:p-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                            <Image
                              src={
                                proposal.type === "REMOVE_IMAGE" &&
                                typeof payload.mediaId === "string"
                                  ? `/api/media/${payload.mediaId}`
                                  : `/api/proposal-media/${proposal.id}`
                              }
                              alt={label}
                              fill
                              sizes="56px"
                              unoptimized
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black">
                              {label}
                            </span>
                            <span className="mt-1 block text-xs text-[var(--muted)]">
                              {proposal.type === "REMOVE_IMAGE"
                                ? `${proposal.creatorDisplayName} propuso quitar esta foto`
                                : `${proposal.creatorDisplayName} propuso esta foto`}
                            </span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-2 py-1 text-xs font-black text-[var(--success)]">
                            {proposal.approvals}/
                            {thresholds.approvalThreshold}
                          </span>
                          <span className="rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-2 py-1 text-xs font-black text-[var(--danger)]">
                            {proposal.rejections}/
                            {thresholds.rejectionThreshold}
                          </span>
                          <ChevronDown
                            className="size-4 shrink-0 text-[var(--muted)] transition group-open:rotate-180"
                            aria-hidden
                          />
                        </span>
                      </summary>

                      <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
                        <MediaLightbox
                          src={
                            proposal.type === "REMOVE_IMAGE" &&
                            typeof payload.mediaId === "string"
                              ? `/api/media/${payload.mediaId}`
                              : `/api/proposal-media/${proposal.id}`
                          }
                          fullSrc={
                            proposal.type === "REMOVE_IMAGE" &&
                            typeof payload.mediaId === "string"
                              ? `/api/media/${payload.mediaId}`
                              : `/api/proposal-media/${proposal.id}?size=full`
                          }
                          alt={label}
                          width={
                            typeof payload.width === "number"
                              ? payload.width
                              : undefined
                          }
                          height={
                            typeof payload.height === "number"
                              ? payload.height
                              : undefined
                          }
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                          imageClassName="aspect-[4/3] w-full object-cover sm:aspect-video"
                        />

                        <div className="space-y-2">
                          <div
                            className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]"
                            aria-hidden
                          >
                            <div
                              className="h-full rounded-full bg-[var(--success)]"
                              style={{ width: `${approvalWidth}%` }}
                            />
                          </div>
                          <div
                            className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]"
                            aria-hidden
                          >
                            <div
                              className="h-full rounded-full bg-[var(--danger)]"
                              style={{ width: `${rejectionWidth}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p className="font-bold">Decisiones</p>
                          {proposal.votes.length > 0 ? (
                            proposal.votes.map((vote) => (
                              <article
                                key={vote.id}
                                className="flex gap-3 rounded-xl bg-[var(--surface)] px-3 py-2"
                              >
                                <PersonAvatar
                                  dailyPhoto={vote.authorDailyPhoto}
                                  name={vote.authorName}
                                  size="sm"
                                  className="!size-9 !rounded-xl !border-2 text-xs"
                                />
                                <p>
                                  <strong>{vote.authorName}</strong>{" "}
                                  <span
                                    className={
                                      vote.decision === "APPROVE"
                                        ? "text-[var(--success)]"
                                        : "text-[var(--danger)]"
                                    }
                                  >
                                    {vote.decision === "APPROVE"
                                      ? "aprobo"
                                      : "rechazo"}
                                  </span>
                                  <span className="text-xs text-[var(--muted)]">
                                    {" "}
                                    {formatDateTime(vote.createdAt)}
                                  </span>
                                  {vote.comment ? (
                                    <span className="block text-[var(--muted)]">
                                      {vote.comment}
                                    </span>
                                  ) : null}
                                </p>
                              </article>
                            ))
                          ) : (
                            <p className="text-[var(--muted)]">
                              Aun no hay decisiones.
                            </p>
                          )}
                        </div>

                        {proposal.createdByUserId === user.id ? (
                          <p className="rounded-2xl bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
                            Otra persona debe aprobar o rechazar esta foto.
                          </p>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            <form
                              action={voteProposalAction}
                              className="space-y-2"
                            >
                              <input
                                type="hidden"
                                name="proposalId"
                                value={proposal.id}
                              />
                              <input
                                type="hidden"
                                name="decision"
                                value="APPROVE"
                              />
                              <input
                                name="comment"
                                aria-label="Comentario opcional al aprobar foto"
                                placeholder="Comentario opcional"
                                className="field h-10 w-full px-3 text-sm"
                              />
                              <SubmitButton
                                variant="secondary"
                                disabled={currentVote === "APPROVE"}
                              >
                                <Check className="size-4" aria-hidden />
                                {currentVote === "APPROVE"
                                  ? "Aprobado"
                                  : "Aprobar"}
                              </SubmitButton>
                            </form>
                            <form
                              action={voteProposalAction}
                              className="space-y-2"
                            >
                              <input
                                type="hidden"
                                name="proposalId"
                                value={proposal.id}
                              />
                              <input
                                type="hidden"
                                name="decision"
                                value="REJECT"
                              />
                              <input
                                name="comment"
                                aria-label="Comentario opcional al rechazar foto"
                                placeholder="Comentario opcional"
                                className="field h-10 w-full px-3 text-sm"
                              />
                              <SubmitButton
                                variant="danger"
                                disabled={currentVote === "REJECT"}
                              >
                                <X className="size-4" aria-hidden />
                                {currentVote === "REJECT"
                                  ? "Rechazado"
                                  : "Rechazar"}
                              </SubmitButton>
                            </form>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid auto-rows-[7rem] grid-cols-2 gap-1.5 sm:auto-rows-[7rem] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {mediaPage.items.map((asset) => {
                const isTall =
                  asset.width && asset.height
                    ? asset.height / asset.width > 1.2
                    : false;
                const isWide =
                  asset.width && asset.height
                    ? asset.width / asset.height > 1.35
                    : false;
                const tileClass = isTall
                  ? "row-span-2"
                  : isWide
                    ? "col-span-2"
                    : "";

                return (
                  <figure
                    key={asset.id}
                    className={`${tileClass} group/photo relative min-w-0 overflow-hidden rounded-xl`}
                  >
                    <MediaLightbox
                      src={`/api/media/${asset.id}`}
                      alt={asset.altText || "Foto del perfil"}
                      width={asset.width}
                      height={asset.height}
                      className="h-full w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]"
                      imageClassName="h-full w-full object-cover"
                    />
                    <form
                      action={removeImageAction}
                      className="absolute right-2 top-2 opacity-0 transition group-hover/photo:opacity-100 group-focus-within/photo:opacity-100"
                    >
                      <input type="hidden" name="mediaId" value={asset.id} />
                      <button
                        type="submit"
                        className="grid size-9 place-items-center rounded-full bg-black/60 text-white shadow-sm transition hover:bg-[var(--danger)]"
                        aria-label="Proponer quitar foto"
                        title="Quitar foto"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </form>
                  </figure>
                );
              })}
          </div>
          <PaginationControls
            page={mediaPage.page}
            totalPages={mediaPage.totalPages}
            searchParams={query}
            pageParam="fotos"
          />
          {approvedMedia.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="Sin fotos"
              body="Cuando haya fotos aprobadas, apareceran en esta galeria."
            />
          ) : null}
        </section>

        <section className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5 sm:space-y-6">
            <div className="surface rounded-[28px] p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-2xl font-black">
                <MessageCircle className="size-5" aria-hidden />
                Publicaciones
              </h2>
              <form action={createPostAction} className="mt-4 space-y-3">
                <input
                  type="hidden"
                  name="personId"
                  value={profile.person.id}
                />
                <textarea
                  name="body"
                  aria-label="Publica algo breve"
                  required
                  placeholder="Publica algo breve..."
                  className="field min-h-28 w-full p-4"
                />
                <SubmitButton>Publicar</SubmitButton>
              </form>
              <div className="mt-6 space-y-4">
                {postsPage.items.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <PersonAvatar
                          dailyPhoto={post.authorDailyPhoto}
                          name={post.authorName}
                          size="sm"
                        />
                        <div>
                          <p className="font-bold">{post.authorName}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {formatDateTime(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      {!post.deletedAt ? (
                        <form action={deletePostAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <button
                            className="inline-flex size-9 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"
                            aria-label="Eliminar publicacion"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </form>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-6">
                      {post.deletedAt ? "Publicacion eliminada." : post.body}
                    </p>
                    {!post.deletedAt && !post.parentPostId ? (
                      <form
                        action={createPostAction}
                        className="mt-4 flex gap-2"
                      >
                        <input
                          type="hidden"
                          name="personId"
                          value={profile.person.id}
                        />
                        <input
                          type="hidden"
                          name="parentPostId"
                          value={post.id}
                        />
                        <input
                          name="body"
                          aria-label="Responder"
                          required
                          placeholder="Responder..."
                          className="field h-10 min-w-0 flex-1 px-3 text-sm"
                        />
                        <SubmitButton variant="secondary">
                          Responder
                        </SubmitButton>
                      </form>
                    ) : null}
                  </article>
                ))}
                <PaginationControls
                  page={postsPage.page}
                  totalPages={postsPage.totalPages}
                  searchParams={query}
                  pageParam="publicaciones"
                />
                {profile.posts.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="Sin publicaciones"
                    body="Aun no hay publicaciones."
                  />
                ) : null}
              </div>
            </div>

            <div className="surface rounded-[28px] p-4 sm:p-5">
              <h2 className="text-xl font-black sm:text-2xl">Comentarios generales</h2>
              <form action={addCommentAction} className="mt-4 flex gap-2">
                <input type="hidden" name="subjectType" value="PERSON" />
                <input
                  type="hidden"
                  name="subjectId"
                  value={profile.person.id}
                />
                <input
                  type="hidden"
                  name="personId"
                  value={profile.person.id}
                />
                <input
                  name="body"
                  aria-label="Comentar"
                  required
                  placeholder="Comentar..."
                  className="field h-11 min-w-0 flex-1 px-3"
                />
                <SubmitButton variant="secondary">Comentar</SubmitButton>
              </form>
              <div className="mt-4 space-y-2">
                {profile.comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="soft-card flex gap-3 rounded-2xl p-4 text-sm"
                  >
                    <PersonAvatar
                      dailyPhoto={comment.authorDailyPhoto}
                      name={comment.authorName}
                      size="sm"
                      className="!size-10 !rounded-xl !border-2 text-xs"
                    />
                    <p>
                      <strong>{comment.authorName}</strong> {comment.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5 sm:space-y-6">
            {canEdit ? (
              <section className="surface rounded-[28px] p-4 sm:p-5">
                <h2 className="flex items-center gap-2 text-xl font-black">
                  <Pencil className="size-5" aria-hidden />
                  Personalizar
                </h2>
                <form action={updateProfileAction} className="mt-4 space-y-3">
                  <input
                    type="hidden"
                    name="personId"
                    value={profile.person.id}
                  />
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                    <User className="size-4 shrink-0" aria-hidden />
                    Nombre completo
                  </label>
                  <input
                    name="fullName"
                    aria-label="Nombre completo o descriptivo"
                    defaultValue={profile.person.fullName ?? ""}
                    placeholder="Nombre completo o descriptivo"
                    className="field h-11 w-full px-3"
                  />
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                    <Type className="size-4 shrink-0" aria-hidden />
                    Bio corta
                  </label>
                  <input
                    name="bio"
                    aria-label="Bio corta"
                    defaultValue={profile.person.bio}
                    placeholder="Bio corta"
                    className="field h-11 w-full px-3"
                  />
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                    <FileText className="size-4 shrink-0" aria-hidden />
                    Descripcion
                  </label>
                  <textarea
                    name="description"
                    aria-label="Descripcion"
                    defaultValue={profile.person.description}
                    placeholder="Descripcion"
                    className="field min-h-24 w-full p-3"
                  />
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                    <Quote className="size-4 shrink-0" aria-hidden />
                    Frase personal
                  </label>
                  <input
                    name="phrase"
                    aria-label="Frase personal"
                    defaultValue={profile.person.phrase}
                    placeholder="Frase personal"
                    className="field h-11 w-full px-3"
                  />
                  <label className="block text-sm font-semibold">
                    Color base
                    <input
                      name="themeColor"
                      type="color"
                      defaultValue={profile.person.themeColor}
                      className="field mt-2 h-11 w-full p-1"
                    />
                  </label>
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">
                      Estilo del perfil
                    </legend>
                    <div className="grid gap-2">
                      {profileThemeOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition hover:border-[var(--accent)]"
                        >
                          <input
                            type="radio"
                            name="themeStyle"
                            value={option.value}
                            defaultChecked={
                              (profile.person.themeStyle ?? "AURORA") ===
                              option.value
                            }
                            className="sr-only peer"
                          />
                          <span
                            className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border)] shadow-sm peer-checked:ring-2 peer-checked:ring-[var(--accent)]"
                            style={{
                              background: getProfileTheme(
                                option.value,
                                option.accent,
                              ).banner,
                            }}
                            aria-hidden
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-black">
                              {option.label}
                            </span>
                            <span className="block text-xs text-[var(--muted)]">
                              {option.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <SubmitButton>Guardar</SubmitButton>
                </form>
              </section>
            ) : null}

          </aside>
        </section>
      </div>
    </div>
  );
}
