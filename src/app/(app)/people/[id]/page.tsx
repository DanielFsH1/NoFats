import { EmptyState } from "@/components/app-shell";
import { SubmitButton } from "@/components/submit-button";
import {
  addCommentAction,
  addNicknameAction,
  createPostAction,
  deletePostAction,
  nominateDailyNicknameAction,
  removeNicknameAction,
  updateProfileAction,
} from "@/lib/actions/app-actions";
import { uploadImageAction } from "@/lib/actions/media-actions";
import { getPersonProfile } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/product/dates";
import { canManagePerson } from "@/lib/product/rules";
import { requireUser } from "@/lib/session";
import { Camera, MessageCircle, Pencil, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ user }, { id }] = await Promise.all([requireUser(), params]);
  const profile = await getPersonProfile(id);

  if (!profile) {
    notFound();
  }

  const canEdit = canManagePerson({
    actor: { id: user.id, role: user.role },
    target: { kind: profile.person.kind, userId: profile.person.userId },
  });

  const approvedNicknames = profile.nicknames.filter(
    (nickname) => nickname.status === "APPROVED" || nickname.status === "TEMPORARY",
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[var(--shadow)]">
        <div
          className="h-48 sm:h-64"
          style={{ backgroundColor: profile.person.themeColor }}
        />
        <div className="-mt-16 p-5 sm:p-8">
          <div className="grid size-32 place-items-center rounded-[32px] border-8 border-white bg-[var(--surface-strong)] text-4xl font-black">
            {profile.person.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                {profile.person.dailyNickname ? "Apodo del dia" : "Perfil"}
              </p>
              <h1 className="mt-2 text-4xl font-black sm:text-6xl">
                {profile.person.displayName}
              </h1>
              {profile.person.fullName ? (
                <p className="mt-3 text-lg text-[var(--muted)]">
                  {profile.person.fullName}
                </p>
              ) : null}
              <p className="mt-4 max-w-3xl text-[var(--muted)]">
                {profile.person.description || profile.person.bio || "Sin descripcion todavia."}
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-bold text-[var(--muted)]">Frase</p>
              <p className="mt-2 text-xl font-black">
                {profile.person.phrase || "Pendiente de una frase legendaria."}
              </p>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {approvedNicknames.length} apodos aprobados · {profile.media.length} fotos
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="surface rounded-[28px] p-5">
            <h2 className="flex items-center gap-2 text-2xl font-black">
              <MessageCircle className="size-5" aria-hidden />
              Muro
            </h2>
            <form action={createPostAction} className="mt-4 space-y-3">
              <input type="hidden" name="personId" value={profile.person.id} />
              <textarea
                name="body"
                required
                placeholder="Publica algo breve..."
                className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-white p-4"
              />
              <SubmitButton>Publicar</SubmitButton>
            </form>
            <div className="mt-6 space-y-4">
              {profile.posts.map((post) => (
                <article key={post.id} className="rounded-3xl border border-[var(--border)] bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{post.authorName}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatDateTime(post.createdAt)}
                      </p>
                    </div>
                    {!post.deletedAt ? (
                      <form action={deletePostAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button
                          className="inline-flex size-9 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-red-50 hover:text-[var(--danger)]"
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
                    <form action={createPostAction} className="mt-4 flex gap-2">
                      <input type="hidden" name="personId" value={profile.person.id} />
                      <input type="hidden" name="parentPostId" value={post.id} />
                      <input
                        name="body"
                        required
                        placeholder="Responder..."
                        className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3 text-sm"
                      />
                      <SubmitButton variant="secondary">Responder</SubmitButton>
                    </form>
                  ) : null}
                </article>
              ))}
              {profile.posts.length === 0 ? (
                <EmptyState title="Muro vacio" body="Aun no hay publicaciones." />
              ) : null}
            </div>
          </div>

          <div className="surface rounded-[28px] p-5">
            <h2 className="text-2xl font-black">Comentarios generales</h2>
            <form action={addCommentAction} className="mt-4 flex gap-2">
              <input type="hidden" name="subjectType" value="PERSON" />
              <input type="hidden" name="subjectId" value={profile.person.id} />
              <input type="hidden" name="personId" value={profile.person.id} />
              <input
                name="body"
                required
                placeholder="Comentar..."
                className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3"
              />
              <SubmitButton variant="secondary">Comentar</SubmitButton>
            </form>
            <div className="mt-4 space-y-2">
              {profile.comments.map((comment) => (
                <p key={comment.id} className="rounded-2xl bg-white p-4 text-sm">
                  <strong>{comment.authorName}</strong> {comment.body}
                </p>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {canEdit ? (
            <section className="surface rounded-[28px] p-5">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Pencil className="size-5" aria-hidden />
                Personalizar
              </h2>
              <form action={updateProfileAction} className="mt-4 space-y-3">
                <input type="hidden" name="personId" value={profile.person.id} />
                <input
                  name="fullName"
                  defaultValue={profile.person.fullName ?? ""}
                  placeholder="Nombre completo o descriptivo"
                  className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
                />
                <input
                  name="bio"
                  defaultValue={profile.person.bio}
                  placeholder="Bio corta"
                  className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
                />
                <textarea
                  name="description"
                  defaultValue={profile.person.description}
                  placeholder="Descripcion"
                  className="min-h-24 w-full rounded-xl border border-[var(--border)] p-3"
                />
                <input
                  name="phrase"
                  defaultValue={profile.person.phrase}
                  placeholder="Frase personal"
                  className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
                />
                <label className="block text-sm font-semibold">
                  Color
                  <input
                    name="themeColor"
                    type="color"
                    defaultValue={profile.person.themeColor}
                    className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-white p-1"
                  />
                </label>
                <SubmitButton>Guardar</SubmitButton>
              </form>
            </section>
          ) : null}

          <section className="surface rounded-[28px] p-5">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Sparkles className="size-5" aria-hidden />
              Apodos
            </h2>
            <form action={addNicknameAction} className="mt-4 flex gap-2">
              <input type="hidden" name="personId" value={profile.person.id} />
              <input
                name="nickname"
                required
                placeholder="Nuevo apodo"
                className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3"
              />
              <SubmitButton variant="secondary">Agregar</SubmitButton>
            </form>
            <div className="mt-4 space-y-2">
              {approvedNicknames.map((nickname) => (
                <div key={nickname.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                  <span>
                    <strong>{nickname.value}</strong>
                    {nickname.status === "TEMPORARY" ? (
                      <span className="ml-2 text-xs text-[var(--muted)]">temporal</span>
                    ) : null}
                  </span>
                  <div className="flex gap-1">
                    {nickname.status === "APPROVED" ? (
                      <form action={nominateDailyNicknameAction}>
                        <input type="hidden" name="personId" value={profile.person.id} />
                        <input type="hidden" name="nicknameId" value={nickname.id} />
                        <button className="rounded-lg px-2 py-1 text-xs font-bold text-[var(--accent)] hover:bg-[var(--surface-strong)]">
                          manana
                        </button>
                      </form>
                    ) : null}
                    <form action={removeNicknameAction}>
                      <input type="hidden" name="nicknameId" value={nickname.id} />
                      <button className="rounded-lg px-2 py-1 text-xs font-bold text-[var(--danger)] hover:bg-red-50">
                        quitar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface rounded-[28px] p-5">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Camera className="size-5" aria-hidden />
              Galeria
            </h2>
            <form action={uploadImageAction} className="mt-4 space-y-3">
              <input type="hidden" name="personId" value={profile.person.id} />
              <input
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                required
                className="block w-full text-sm"
              />
              <input
                name="altText"
                placeholder="Descripcion breve"
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
              />
              <SubmitButton variant="secondary">Subir foto</SubmitButton>
            </form>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {profile.media
                .filter((asset) => asset.status === "APPROVED")
                .map((asset) => (
                  <Image
                    key={asset.id}
                    src={`/api/media/${asset.id}`}
                    alt={asset.altText || "Foto del perfil"}
                    width={180}
                    height={180}
                    unoptimized
                    className="aspect-square rounded-xl object-cover"
                  />
                ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
