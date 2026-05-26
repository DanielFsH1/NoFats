"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  function handleRetry() {
    reset();
    window.setTimeout(() => {
      window.location.reload();
    }, 0);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="surface max-w-lg animate-fade-in rounded-[28px] p-8 text-center">
        <h1 className="text-3xl font-black">Algo salio mal</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{error.message}</p>
        <button
          onClick={handleRetry}
          className="mt-6 h-11 rounded-xl bg-[var(--accent)] px-4 font-semibold text-[var(--accent-contrast)] shadow-sm transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-md"
        >
          Intentar otra vez
        </button>
      </section>
    </main>
  );
}
