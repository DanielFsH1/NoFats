"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const classes = {
    primary:
      "bg-[var(--accent)] text-white hover:bg-[var(--accent-ink)] disabled:bg-slate-400",
    secondary:
      "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
    danger: "bg-[var(--danger)] text-white hover:bg-red-800",
  };

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${classes[variant]}`}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
