import Link from "next/link";

export function PaginationControls({
  page,
  totalPages,
  searchParams,
  pageParam = "page",
}: {
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | string[] | undefined>;
  pageParam?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  function hrefFor(nextPage: number) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (key === pageParam || typeof value === "undefined") {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          params.append(key, item);
        }
      } else {
        params.set(key, value);
      }
    }

    params.set(pageParam, String(nextPage));
    return `?${params.toString()}`;
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
      aria-label="Paginacion"
    >
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-black transition ${
          page <= 1
            ? "pointer-events-none opacity-45"
            : "hover:bg-[var(--surface-strong)]"
        }`}
      >
        Anterior
      </Link>
      <span className="rounded-xl bg-[var(--surface-strong)] px-3 py-2 text-sm font-black text-[var(--muted)]">
        {page} / {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-black transition ${
          page >= totalPages
            ? "pointer-events-none opacity-45"
            : "hover:bg-[var(--surface-strong)]"
        }`}
      >
        Siguiente
      </Link>
    </nav>
  );
}
