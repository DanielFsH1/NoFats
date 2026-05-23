import { signOutAction } from "@/lib/actions/auth-actions";
import { formatDateTime } from "@/lib/product/dates";
import { EditableSiteText } from "@/components/editable-site-text";
import { MainNav } from "@/components/main-nav";
import { getInitials } from "@/components/person-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut } from "lucide-react";
import Link from "next/link";

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
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-3">
          <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-start">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2 sm:gap-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-sm font-black text-[var(--accent-contrast)] shadow-[var(--shadow-soft)] sm:size-11 sm:rounded-2xl sm:text-base">
                  {getInitials(appName)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-black sm:text-lg">
                    {appName}
                  </span>
                  <span className="hidden text-xs text-[var(--muted)] sm:block">
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
            <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
              <ThemeToggle />
              <form action={signOutAction}>
                <button
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--danger)]"
                  aria-label="Cerrar sesion"
                >
                  <LogOut className="size-4" aria-hidden />
                </button>
              </form>
            </div>
          </div>
          <MainNav personId={user.personId} role={user.role} />
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <form action={signOutAction} className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted)]">{user.name}</span>
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
