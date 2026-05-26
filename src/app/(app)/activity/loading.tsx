export default function ActivityLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 animate-fade-in">
      <div>
        <div className="skeleton-text !h-8 w-52 sm:!h-10" />
        <div className="skeleton-text mt-3 w-80" />
      </div>
      <section className="surface rounded-[28px] p-4 sm:p-5">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
            >
              <div className="skeleton-text w-3/4 !h-5" />
              <div className="skeleton-text mt-2 w-40" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
