export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 animate-fade-in">
      <section className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <div className="surface rounded-[28px] p-4 sm:p-6 lg:p-8">
          <div className="skeleton-text w-32" />
          <div className="skeleton mt-3 h-10 w-3/4 sm:h-14" />
          <div className="skeleton-text mt-4 w-full max-w-sm" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
              >
                <div className="skeleton size-12 shrink-0 !rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="skeleton-text w-16" />
                  <div className="skeleton-text w-28 !h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="surface rounded-[28px] p-4 sm:p-6">
          <div className="skeleton-text w-36" />
          <div className="skeleton mt-3 h-10 w-2/3 sm:h-12" />
          <div className="skeleton-text mt-3 w-full max-w-xs" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton aspect-[4/3] !rounded-2xl"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="surface rounded-[28px] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="skeleton-text w-28 !h-7" />
          <div className="skeleton-text w-20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="skeleton h-20 !rounded-none" />
              <div className="-mt-7 p-4">
                <div className="skeleton size-16 !rounded-3xl" />
                <div className="skeleton-text mt-3 w-24 !h-5" />
                <div className="skeleton-text mt-2 w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
