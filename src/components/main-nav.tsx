"use client";

import {
  Activity,
  GalleryHorizontalEnd,
  Home,
  Settings,
  Shield,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/people", label: "Personas", icon: UsersRound },
  { href: "/gallery", label: "Galeria", icon: GalleryHorizontalEnd },
  { href: "/activity", label: "Actividad", icon: Activity },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── Sidebar variant (desktop lg+) ──────────────── */

function SidebarNav({
  personId,
  role,
}: {
  personId: string;
  role: "ADMIN" | "USER";
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`sidebar-link group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-strong))] text-[var(--foreground)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {active ? (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
            ) : null}
            <item.icon
              className={`size-[18px] transition-colors ${
                active ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
              }`}
              aria-hidden
            />
            <span className="sidebar-label">{item.label}</span>
          </Link>
        );
      })}

      <div className="my-2 border-t border-[var(--border)]" />

      <Link
        href={`/people/${personId}`}
        aria-current={
          isActivePath(pathname, `/people/${personId}`) ? "page" : undefined
        }
        className={`sidebar-link group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
          isActivePath(pathname, `/people/${personId}`)
            ? "bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-strong))] text-[var(--foreground)]"
            : "text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
        }`}
      >
        {isActivePath(pathname, `/people/${personId}`) ? (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
        ) : null}
        <Settings
          className={`size-[18px] ${
            isActivePath(pathname, `/people/${personId}`)
              ? "text-[var(--accent)]"
              : "text-[var(--muted)]"
          }`}
          aria-hidden
        />
        <span className="sidebar-label">Mi perfil</span>
      </Link>

      {role === "ADMIN" ? (
        <Link
          href="/admin"
          aria-current={
            isActivePath(pathname, "/admin") ? "page" : undefined
          }
          className={`sidebar-link group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
            isActivePath(pathname, "/admin")
              ? "bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-strong))] text-[var(--foreground)]"
              : "text-[var(--accent-ink)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
          }`}
        >
          {isActivePath(pathname, "/admin") ? (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
          ) : null}
          <Shield
            className={`size-[18px] ${
              isActivePath(pathname, "/admin")
                ? "text-[var(--accent)]"
                : "text-[var(--accent-ink)]"
            }`}
            aria-hidden
          />
          <span className="sidebar-label">Admin</span>
        </Link>
      ) : null}
    </div>
  );
}

/* ── Bottom bar variant (mobile <lg) ────────────── */

function BottomBarNav({
  personId,
  role,
}: {
  personId: string;
  role: "ADMIN" | "USER";
}) {
  const pathname = usePathname();

  const allItems = [
    ...nav,
    { href: `/people/${personId}`, label: "Perfil", icon: Settings },
    ...(role === "ADMIN"
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <div className="flex min-w-max flex-nowrap items-center justify-around px-1 py-1.5">
      {allItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-9 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 active:scale-90 ${
              active
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <item.icon
              className={`size-5 ${active ? "text-[var(--accent)]" : ""}`}
              aria-hidden
            />
            <span className="text-[10px] font-semibold leading-tight">
              {item.label}
            </span>
            {active ? (
              <span className="absolute -top-0.5 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

/* ── Main export ─────────────────────────────────── */

export function MainNav({
  personId,
  role,
  variant,
}: {
  personId: string;
  role: "ADMIN" | "USER";
  variant: "sidebar" | "bottom-bar";
}) {
  if (variant === "sidebar") {
    return <SidebarNav personId={personId} role={role} />;
  }

  return <BottomBarNav personId={personId} role={role} />;
}
