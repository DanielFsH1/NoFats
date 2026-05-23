import { EmptyState } from "@/components/app-shell";
import { MediaLightbox } from "@/components/media-lightbox";
import { getGallery } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  await requireUser();
  const assets = await getGallery();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-black">Galeria</h1>
        <p className="mt-2 text-[var(--muted)]">
          Fotos aprobadas de todos los perfiles. Algunas se convierten en foto
          del dia de forma estable.
        </p>
      </div>
      <section className="grid auto-rows-[6.5rem] grid-cols-3 gap-1.5 sm:auto-rows-[8rem] sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {assets.map((asset) => {
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
            <figure key={asset.id} className={`${tileClass} relative min-w-0`}>
              <MediaLightbox
                src={`/api/media/${asset.id}`}
                alt={asset.altText || `Foto de ${asset.displayName}`}
                width={asset.width}
                height={asset.height}
                className="h-full w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]"
                imageClassName="h-full w-full object-cover"
              />
              {asset.isDailyPhoto ? (
                <span className="pill pointer-events-none absolute left-2 top-2 bg-[var(--surface)] px-2 py-1 text-[0.68rem]">
                  Foto de hoy
                </span>
              ) : null}
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-[linear-gradient(180deg,transparent,rgb(0_0_0/0.68))] px-2 pb-2 pt-8 text-xs font-black text-white">
                <span className="block truncate">{asset.displayName}</span>
              </figcaption>
            </figure>
          );
        })}
      </section>
      {assets.length === 0 ? (
        <EmptyState
          title="Galeria vacia"
          body="Sube fotos desde el perfil de cada persona."
        />
      ) : null}
    </div>
  );
}
