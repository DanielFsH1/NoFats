"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "nofats-sidebar-collapsed";

function applySidebarState(collapsed: boolean) {
  document.documentElement.dataset.sidebarCollapsed = String(collapsed);
}

export function SidebarCollapseControl() {
  const [collapsed, setCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY) === "true",
  );

  useEffect(() => {
    applySidebarState(collapsed);
  }, [collapsed]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      applySidebarState(next);
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      className="sidebar-collapse-control absolute right-0 top-1/2 z-10 inline-flex size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
      title={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
