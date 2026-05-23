import { signOutAction } from "@/lib/actions/auth-actions";
import { formatDateTime } from "@/lib/product/dates";
import { EditableSiteText } from "@/components/editable-site-text";
import { getInitials } from "@/components/person-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Activity,
  GalleryHorizontalEnd,
  Home,
  LogOut,
  Settings,
  Shield,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const nav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/people", label: "Personas", icon: UsersRound },
  { href: "/gallery", label: "Galeria", icon: GalleryHorizontalEnd },
  { href: "/activity", label: "Actividad", icon: Activity },
];

export function AppShell({
  appName = "NoFats",
  children,
  user,
}: {
  appName?: string;
  children: React.ReactNode;
  user: { name: string; role: "ADMIN" | "USER"; personId: string };
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_86%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[var(--accent)] font-black text-white shadow-[var(--shadow-soft)]">
                {getInitials(appName)}
              </span>
              <span>
                <span className="block text-lg font-black">{appName}</span>
                <span className="block text-xs text-[var(--muted)]">
                  {formatDateTime(new Date())}
                </span>
              </span>
            </Link>
            <EditableSiteText
              field="appName"
              value={appName}
              label="Editar nombre de la app"
            />
          </div>
          <nav
            aria-label="Navegacion principal"
            className="flex flex-wrap gap-2"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
            <Link
              href={`/people/${user.personId}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <Settings className="size-4" aria-hidden />
              Mi perfil
            </Link>
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:bg-[var(--surface)]"
              >
                <Shield className="size-4" aria-hidden />
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOutAction} className="flex items-center gap-2">
              <span className="hidden text-sm text-[var(--muted)] sm:block">
                {user.name}
              </span>
              <button
                className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--danger)]"
                aria-label="Cerrar sesion"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-8 text-center">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}
