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
        <span className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3">
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
        <span className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3">
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
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
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
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 font-semibold text-white transition hover:bg-[var(--accent-ink)] disabled:bg-slate-400"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      Entrar
    </button>
  );
}
