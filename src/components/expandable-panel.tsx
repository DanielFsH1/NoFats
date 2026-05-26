"use client";

import { Maximize2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export function ExpandablePanel({
  title,
  count,
  openLabel,
  children,
}: {
  title: string;
  count?: number;
  openLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <section className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase text-[var(--muted)]">
          {title}
        </h3>
        {typeof count === "number" ? (
          <span className="rounded-full bg-[var(--surface-strong)] px-2 py-1 text-xs font-black text-[var(--muted)]">
            {count}
          </span>
        ) : null}
      </div>

      {!open ? (
        <div className="relative">
          <div className="max-h-[18rem] overflow-hidden md:max-h-none md:overflow-visible">
            {children}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,var(--surface-muted))] md:hidden"
            aria-hidden
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-black text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
      >
        <Maximize2 className="size-4" aria-hidden />
        {openLabel}
      </button>

      {open && portalTarget
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-black/65 p-3 backdrop-blur-sm sm:p-6"
            >
              <div
                className="absolute inset-0"
                onClick={() => setOpen(false)}
              />
              <section className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                  <h2 id={titleId} className="text-lg font-black">
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--surface-strong)] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
                    aria-label="Cerrar"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
                  {children}
                </div>
              </section>
            </div>,
            portalTarget,
          )
        : null}
    </section>
  );
}
