"use client";

import { authClient } from "@/lib/auth-client";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: searchParams.get("next") ?? "/",
      rememberMe: true,
    });

    if (authError) {
      setError(authError.message ?? "No pudimos iniciar sesion.");
      setPending(false);
      return;
    }

    window.location.href = searchParams.get("next") ?? "/";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 font-semibold text-white transition hover:bg-[var(--accent-ink)] disabled:bg-slate-400"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Entrar
      </button>
    </form>
  );
}
