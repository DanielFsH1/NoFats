"use client";

import { registerWithInvite, type FormState } from "@/lib/actions/auth-actions";
import { useActionState } from "react";
import { SubmitButton } from "./submit-button";

export function InviteForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(
    registerWithInvite,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-semibold">
        Correo
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3"
        />
      </label>
      <label className="block text-sm font-semibold">
        Nombre completo
        <input
          name="fullName"
          required
          autoComplete="name"
          className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Contrasena
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3"
          />
        </label>
        <label className="block text-sm font-semibold">
          Confirmar
          <input
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3"
          />
        </label>
      </div>
      {state.message ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.message}
        </p>
      ) : null}
      <SubmitButton>Crear mi cuenta</SubmitButton>
    </form>
  );
}
