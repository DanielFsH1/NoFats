"use client";

import { signInWithPasswordAction } from "@/lib/actions/auth-actions";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signInWithPasswordAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={searchParams.get("next") ?? "/"} />
      <label className="block text-sm font-semibold">
        Correo
        <span className="field mt-2 flex items-center gap-2 px-3">
          <Mail className="size-4 text-[var(--muted)]" aria-hidden />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-12 w-full bg-transparent text-base outline-none"
          />
        </span>
      </label>
      <label className="block text-sm font-semibold">
        Contrasena
        <span className="field mt-2 flex items-center gap-2 px-3">
          <LockKeyhole className="size-4 text-[var(--muted)]" aria-hidden />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-12 w-full bg-transparent text-base outline-none"
          />
        </span>
      </label>
      {state.message ? (
        <p className="animate-shake rounded-xl border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))] px-3 py-2 text-sm text-[var(--danger)]">
          {state.message}
        </p>
      ) : null}
      <LoginButton />
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 font-semibold text-[var(--accent-contrast)] shadow-sm transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-md active:scale-[0.98] disabled:bg-slate-400 disabled:text-white disabled:shadow-none"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      Entrar
    </button>
  );
}
