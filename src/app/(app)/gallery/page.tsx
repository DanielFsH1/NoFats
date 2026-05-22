import { EmptyState } from "@/components/app-shell";
import { getGallery } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/product/dates";
import Image from "next/image";
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
          Fotos aprobadas de todos los perfiles. Algunas se convierten en foto del dia de forma estable.
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <figure
            key={asset.id}
            className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="relative">
              <Image
                src={`/api/media/${asset.id}`}
                alt={asset.altText || "Foto del grupo"}
                width={640}
                height={480}
                unoptimized
                className="aspect-[4/3] w-full object-cover"
              />
              {asset.isDailyPhoto ? (
                <span className="pill absolute left-3 top-3 bg-[var(--surface)]">
                  Foto de hoy
                </span>
              ) : null}
            </div>
            <figcaption className="p-4 text-sm">
              <strong>{asset.displayName}</strong>
              <span className="mt-1 block text-xs text-[var(--muted)]">
                {formatDateTime(asset.createdAt)}
              </span>
            </figcaption>
          </figure>
        ))}
      </section>
      {assets.length === 0 ? (
        <EmptyState title="Galeria vacia" body="Sube fotos desde el perfil de cada persona." />
      ) : null}
    </div>
  );
}
