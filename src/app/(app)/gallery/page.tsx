import { EmptyState } from "@/components/app-shell";
import { MediaLightbox } from "@/components/media-lightbox";
import { PaginationControls } from "@/components/pagination-controls";
import { getGallery } from "@/lib/data/queries";
import { paginateItems, parsePageParam } from "@/lib/product/pagination";
import { requireUser } from "@/lib/session";
import { Camera } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const [assets, query] = await Promise.all([getGallery(), searchParams]);
  const galleryPage = paginateItems(assets, {
    page: parsePageParam(query.page),
    pageSize: 28,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <div className="max-w-3xl">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-black sm:text-4xl">Galeria</h1>
          {assets.length > 0 ? (
            <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-sm font-bold text-[var(--muted)]">
              {assets.length} {assets.length === 1 ? "foto" : "fotos"}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
          Fotos aprobadas de todos los perfiles. Algunas se convierten en foto
          del dia de forma estable.
        </p>
      </div>
      <section className="grid auto-rows-[7rem] grid-cols-2 gap-1.5 sm:auto-rows-[8rem] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
        {galleryPage.items.map((asset) => {
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
            <figure key={asset.id} className={`${tileClass} group/tile relative min-w-0 overflow-hidden rounded-xl`}>
              <MediaLightbox
                src={`/api/media/${asset.id}`}
                alt={asset.altText || `Foto de ${asset.displayName}`}
                width={asset.width}
                height={asset.height}
                className="h-full w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] transition-transform duration-300 group-hover/tile:scale-[1.03]"
                imageClassName="h-full w-full object-cover"
              />
              {asset.isDailyPhoto ? (
                <span className="pill pointer-events-none absolute left-2 top-2 bg-[var(--surface)] px-2 py-1 text-[0.68rem]">
                  Foto de hoy
                </span>
              ) : null}
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-[linear-gradient(180deg,transparent,rgb(0_0_0/0.72))] px-2 pb-2 pt-10 text-xs font-black text-white opacity-80 transition-opacity duration-200 group-hover/tile:opacity-100">
                <span className="block truncate">{asset.displayName}</span>
              </figcaption>
            </figure>
          );
        })}
      </section>
      <PaginationControls
        page={galleryPage.page}
        totalPages={galleryPage.totalPages}
        searchParams={query}
      />
      {assets.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="Galeria vacia"
          body="Sube fotos desde el perfil de cada persona."
        />
      ) : null}
    </div>
  );
}
