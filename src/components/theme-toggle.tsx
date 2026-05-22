"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("nofats-theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      <Sun className="theme-icon-sun size-4" aria-hidden />
      <Moon className="theme-icon-moon size-4" aria-hidden />
    </button>
  );
}
