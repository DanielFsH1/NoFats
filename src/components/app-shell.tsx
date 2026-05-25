import { signOutAction } from "@/lib/actions/auth-actions";
import { formatDateTime } from "@/lib/product/dates";
import { AutoRefresh } from "@/components/auto-refresh";
import { EditableSiteText } from "@/components/editable-site-text";
import { MainNav } from "@/components/main-nav";
import { getInitials } from "@/components/person-avatar";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SidebarCollapseControl } from "@/components/sidebar-collapse";
import { ThemeToggle } from "@/components/theme-toggle";
import type { LucideIcon } from "lucide-react";
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
      {/* ── Desktop Sidebar (lg+) ─────────────────────── */}
      <aside className="desktop-sidebar fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] flex-col overflow-visible border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] backdrop-blur-xl lg:flex">
        {/* Logo area */}
        <div className="border-b border-[var(--border)] px-5 py-5">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-sm font-black text-[var(--accent-contrast)] shadow-[var(--shadow-soft)]">
                {getInitials(appName)}
              </span>
              <span className="sidebar-label min-w-0">
                <span className="block text-base font-black leading-tight">
                  <span className="bg-[linear-gradient(135deg,var(--foreground),var(--accent))] bg-clip-text text-transparent">
                    {appName}
                  </span>
                </span>
                <span className="sidebar-date block text-[11px] text-[var(--muted)]">
                  {formatDateTime(new Date())}
                </span>
              </span>
            </Link>
            <span className="sidebar-edit">
              <EditableSiteText
                field="appName"
                value={appName}
                label="Editar nombre de la app"
              />
            </span>
            <SidebarCollapseControl />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <MainNav personId={user.personId} role={user.role} variant="sidebar" />
        </div>

        {/* User area (bottom) */}
        <div className="border-t border-[var(--border)] px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-strong)] text-xs font-black text-[var(--foreground)]">
              {getInitials(user.name)}
            </span>
            <span className="sidebar-user-name min-w-0 flex-1 truncate text-sm font-semibold">
              {user.name}
            </span>
            <ThemeToggle />
            <form action={signOutAction}>
              <button
                className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-95"
                aria-label="Cerrar sesion"
                title="Cerrar sesion"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header (<lg) ──────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-sm font-black text-[var(--accent-contrast)] shadow-sm">
              {getInitials(appName)}
            </span>
            <span className="text-base font-black">
              <span className="bg-[linear-gradient(135deg,var(--foreground),var(--accent))] bg-clip-text text-transparent">
                {appName}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOutAction}>
              <button
                className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--danger)] active:scale-95"
                aria-label="Cerrar sesion"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="px-4 pb-24 pt-5 sm:px-5 lg:ml-[var(--sidebar-width)] lg:px-8 lg:pb-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* ── Mobile Bottom Tab Bar (<lg) ──────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex-nowrap overflow-x-auto border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-xl lg:hidden" aria-label="Navegacion principal">
        <MainNav personId={user.personId} role={user.role} variant="bottom-bar" />
      </nav>

      <ScrollToTop />
      <AutoRefresh />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="animate-fade-in rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-8 text-center">
      {Icon ? (
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface-strong))]">
          <Icon
            className="size-5 text-[var(--muted)]"
            aria-hidden
          />
        </div>
      ) : null}
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}
