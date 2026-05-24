import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="surface max-w-lg animate-fade-in rounded-[28px] p-8 text-center">
        <p className="text-7xl font-black text-[var(--muted)] opacity-30">404</p>
        <h1 className="mt-4 text-4xl font-black">No encontrado</h1>
        <p className="mt-3 text-[var(--muted)]">
          La pagina o perfil que buscas no existe.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-[var(--accent)] px-4 font-semibold text-[var(--accent-contrast)] shadow-sm transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-md"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
