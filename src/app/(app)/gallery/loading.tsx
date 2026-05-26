export default function GalleryLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6 animate-fade-in">
      <div className="max-w-3xl">
        <div className="skeleton-text !h-8 w-36 sm:!h-10" />
        <div className="skeleton-text mt-3 w-80" />
      </div>
      <section className="grid auto-rows-[7rem] grid-cols-2 gap-1.5 sm:auto-rows-[8rem] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="skeleton !rounded-xl" />
        ))}
      </section>
    </div>
  );
}
