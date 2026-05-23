"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="surface max-w-lg rounded-[28px] p-8 text-center">
        <h1 className="text-3xl font-black">Algo salio mal</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 h-11 rounded-xl bg-[var(--accent)] px-4 font-semibold text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]"
        >
          Intentar otra vez
        </button>
      </section>
    </main>
  );
}
