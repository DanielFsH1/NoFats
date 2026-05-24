export default function PeopleLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6 animate-fade-in">
      <div className="max-w-3xl">
        <div className="skeleton-text !h-8 w-40 sm:!h-10" />
        <div className="skeleton-text mt-3 w-72" />
      </div>
      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)]"
          >
            <div className="skeleton h-28 !rounded-none" />
            <div className="-mt-10 p-4 sm:p-5">
              <div className="skeleton size-24 !rounded-[28px]" />
              <div className="skeleton-text mt-4 w-32 !h-6" />
              <div className="skeleton-text mt-2 w-full" />
              <div className="skeleton-text mt-2 w-full" />
              <div className="mt-4 flex items-center justify-between">
                <div className="skeleton-text w-24 !rounded-full" />
                <div className="skeleton-text w-12" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
