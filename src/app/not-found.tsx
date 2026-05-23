import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="surface max-w-lg rounded-[28px] p-8 text-center">
        <h1 className="text-4xl font-black">No encontrado</h1>
        <p className="mt-3 text-[var(--muted)]">
          La pagina o perfil que buscas no existe.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-[var(--accent)] px-4 font-semibold text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
