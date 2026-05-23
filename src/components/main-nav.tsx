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

function navLinkClass(active: boolean, admin = false) {
  const base =
    "inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition sm:min-h-10 sm:gap-2 sm:px-3 sm:text-sm";

  if (active) {
    return `${base} bg-[var(--surface-strong)] text-[var(--foreground)] shadow-sm`;
  }

  return `${base} ${
    admin ? "text-[var(--accent-ink)]" : "text-[var(--muted)]"
  } hover:bg-[var(--surface)] hover:text-[var(--foreground)]`;
}

export function MainNav({
  personId,
  role,
}: {
  personId: string;
  role: "ADMIN" | "USER";
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacion principal"
      className="-mx-3 flex snap-x flex-nowrap gap-1.5 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] sm:-mx-6 sm:gap-2 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
    >
      {nav.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={navLinkClass(active)}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <Link
        href={`/people/${personId}`}
        aria-current={isActivePath(pathname, `/people/${personId}`) ? "page" : undefined}
        className={navLinkClass(isActivePath(pathname, `/people/${personId}`))}
      >
        <Settings className="size-4" aria-hidden />
        Mi perfil
      </Link>
      {role === "ADMIN" ? (
        <Link
          href="/admin"
          aria-current={isActivePath(pathname, "/admin") ? "page" : undefined}
          className={navLinkClass(isActivePath(pathname, "/admin"), true)}
        >
          <Shield className="size-4" aria-hidden />
          Admin
        </Link>
      ) : null}
    </nav>
  );
}
