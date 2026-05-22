import { LoginForm } from "@/components/login-form";
import { getAppSettings } from "@/lib/data/settings";
import { UsersRound } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { siteCopy } = await getAppSettings();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[var(--shadow)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[420px] bg-[var(--accent-ink)] p-8 text-white sm:p-10">
          <div className="absolute inset-0 opacity-35 [background:linear-gradient(135deg,#1f8a70_0%,#2f6fbb_45%,#e7654d_100%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold">
              <UsersRound className="size-4" aria-hidden />
              {siteCopy.loginEyebrow}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/70">
                {siteCopy.appName}
              </p>
              <h1 className="mt-3 max-w-lg text-4xl font-black leading-tight sm:text-6xl">
                {siteCopy.loginHeroTitle}
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-white/78">
                {siteCopy.loginHeroSubtitle}
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-black">Entrar</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Inicia sesion para ver perfiles, propuestas y actividad.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-48 rounded-2xl bg-[var(--surface-strong)]" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
