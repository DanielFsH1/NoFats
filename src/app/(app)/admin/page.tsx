import { SubmitButton } from "@/components/submit-button";
import {
  createFictionalPersonAction,
  createRegistrationSlotAction,
  disableRegistrationSlotAction,
  toggleUserDisabledAction,
  updateSiteCopyAction,
  updateVoteSettingsAction,
} from "@/lib/actions/app-actions";
import { getAdminOverview } from "@/lib/data/queries";
import { getAppSettings } from "@/lib/data/settings";
import { formatDateTime } from "@/lib/product/dates";
import { roleLabel, slotStatusLabel } from "@/lib/product/presentation";
import { requireAdmin } from "@/lib/session";
import {
  Copy,
  Hash,
  Image as ImageIcon,
  MessageCircle,
  PencilLine,
  SlidersHorizontal,
  ThumbsUp,
  UserPlus,
  Users,
  UsersRound,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  await requireAdmin();
  const [{ invite }, overview, settings] = await Promise.all([
    searchParams,
    getAdminOverview(),
    getAppSettings(),
  ]);

  const metrics: [string, number, LucideIcon, string][] = [
    ["Usuarios reales", overview.metrics.realUsers, Users, "var(--accent)"],
    ["Perfiles totales", overview.metrics.totalPeople, UsersRound, "var(--blue)"],
    ["Perfiles no reales", overview.metrics.fictionalPeople, UsersRound, "var(--coral)"],
    ["Apodos aprobados", overview.metrics.approvedNicknames, Hash, "var(--accent)"],
    ["Propuestas pendientes", overview.metrics.pendingProposals, Vote, "var(--warning)"],
    ["Imagenes aprobadas", overview.metrics.approvedImages, ImageIcon, "var(--success)"],
    ["Publicaciones", overview.metrics.totalPosts, MessageCircle, "var(--blue)"],
    ["Comentarios", overview.metrics.totalComments, MessageCircle, "var(--muted)"],
    ["Votos", overview.metrics.totalVotes, ThumbsUp, "var(--coral)"],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-black sm:text-4xl">Administracion</h1>
        <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
          Cupos, perfiles, usuarios, metricas y moderacion basica.
        </p>
      </div>

      {invite ? (
        <section className="rounded-[24px] border border-[var(--accent)] bg-[var(--surface)] p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
            <Copy className="size-4" aria-hidden />
            Enlace creado
          </p>
          <code className="mt-3 block overflow-x-auto rounded-2xl bg-[var(--surface-strong)] p-3 text-sm">
            {invite}
          </code>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {metrics.map(([label, value, Icon, color]) => (
          <div key={label} className="surface rounded-[24px] p-4 sm:p-5 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-2">
              <span
                className="grid size-8 place-items-center rounded-lg"
                style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
              >
                <Icon
                  className="size-4"
                  style={{ color }}
                  aria-hidden
                />
              </span>
              <p className="text-sm font-bold text-[var(--muted)]">{label}</p>
            </div>
            <p className="mt-3 text-4xl font-black">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="surface rounded-[28px] p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
            <SlidersHorizontal className="size-5" aria-hidden />
            Umbrales de votacion
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Estos porcentajes controlan cuantas aprobaciones o rechazos necesita
            cualquier propuesta sensible.
          </p>
          <form action={updateVoteSettingsAction} className="mt-5 space-y-4">
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="approvalPercentage"
              >
                Porcentaje para aprobar
              </label>
              <input
                id="approvalPercentage"
                name="approvalPercentage"
                type="number"
                min={1}
                max={100}
                required
                defaultValue={settings.voteSettings.approvalPercentage}
                className="field mt-2 h-12 w-full px-3"
              />
            </div>
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="rejectionPercentage"
              >
                Porcentaje para rechazar
              </label>
              <input
                id="rejectionPercentage"
                name="rejectionPercentage"
                type="number"
                min={1}
                max={100}
                required
                defaultValue={settings.voteSettings.rejectionPercentage}
                className="field mt-2 h-12 w-full px-3"
              />
            </div>
            <SubmitButton>Guardar porcentajes</SubmitButton>
          </form>
        </div>

        <div className="surface rounded-[28px] p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
            <PencilLine className="size-5" aria-hidden />
            Textos principales
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            El administrador puede aplicarlos directo; los usuarios tambien
            pueden proponer cambios desde los perfiles o desde la seccion
            correspondiente.
          </p>
          <form
            action={updateSiteCopyAction}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-sm font-semibold" htmlFor="adminAppName">
                Titulo de la web
              </label>
              <input
                id="adminAppName"
                name="appName"
                required
                defaultValue={settings.siteCopy.appName}
                className="field mt-2 h-12 w-full px-3"
              />
            </div>
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="adminLoginEyebrow"
              >
                Etiqueta pequena
              </label>
              <input
                id="adminLoginEyebrow"
                name="loginEyebrow"
                required
                defaultValue={settings.siteCopy.loginEyebrow}
                className="field mt-2 h-12 w-full px-3"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                className="text-sm font-semibold"
                htmlFor="adminLoginHeroTitle"
              >
                Mensaje principal del login
              </label>
              <textarea
                id="adminLoginHeroTitle"
                name="loginHeroTitle"
                required
                defaultValue={settings.siteCopy.loginHeroTitle}
                className="field mt-2 min-h-24 w-full p-3"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                className="text-sm font-semibold"
                htmlFor="adminLoginHeroSubtitle"
              >
                Comentario pequeno del login
              </label>
              <textarea
                id="adminLoginHeroSubtitle"
                name="loginHeroSubtitle"
                required
                defaultValue={settings.siteCopy.loginHeroSubtitle}
                className="field mt-2 min-h-24 w-full p-3"
              />
            </div>
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="adminDashboardTitle"
              >
                Titulo del inicio
              </label>
              <input
                id="adminDashboardTitle"
                name="dashboardTitle"
                required
                defaultValue={settings.siteCopy.dashboardTitle}
                className="field mt-2 h-12 w-full px-3"
              />
            </div>
            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="adminDashboardSubtitle"
              >
                Comentario del inicio
              </label>
              <input
                id="adminDashboardSubtitle"
                name="dashboardSubtitle"
                required
                defaultValue={settings.siteCopy.dashboardSubtitle}
                className="field mt-2 h-12 w-full px-3"
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton>Guardar textos</SubmitButton>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-[28px] p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
            <UserPlus className="size-5" aria-hidden />
            Crear cupo real
          </h2>
          <form
            action={createRegistrationSlotAction}
            className="mt-5 flex gap-3"
          >
            <input
              name="shortName"
              required
              placeholder="Diego, Max, Valentina..."
              className="field h-12 min-w-0 flex-1 px-3"
            />
            <SubmitButton>Crear</SubmitButton>
          </form>
          <div className="mt-6 space-y-3">
            {overview.slots.map((slot) => (
              <div
                key={slot.id}
                className="soft-card flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <span>
                  <strong>{slot.shortName}</strong>
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    {slotStatusLabel(slot.status)}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    {formatDateTime(slot.createdAt)}
                  </span>
                </span>
                {slot.status === "PENDING" ? (
                  <form action={disableRegistrationSlotAction}>
                    <input type="hidden" name="slotId" value={slot.id} />
                    <SubmitButton variant="danger">Desactivar</SubmitButton>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-[28px] p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
            <UsersRound className="size-5" aria-hidden />
            Crear perfil no real
          </h2>
          <form action={createFictionalPersonAction} className="mt-5 space-y-3">
            <input
              name="displayName"
              required
              placeholder="Nombre visible"
              className="field h-12 w-full px-3"
            />
            <input
              name="fullName"
              placeholder="Nombre descriptivo"
              className="field h-12 w-full px-3"
            />
            <SubmitButton>Crear perfil</SubmitButton>
          </form>
        </div>
      </section>

      <section className="surface rounded-[28px] p-4 sm:p-6">
        <h2 className="text-xl font-black sm:text-2xl">Usuarios</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-3">Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {overview.users.map((user) => (
                <tr key={user.id} className="border-b border-[var(--border)]">
                  <td className="py-3 font-semibold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{roleLabel(user.role)}</td>
                  <td>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        user.disabled
                          ? "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]"
                          : "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]"
                      }`}
                    >
                      {user.disabled ? "Desactivado" : "Activo"}
                    </span>
                  </td>
                  <td>
                    <form action={toggleUserDisabledAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        type="hidden"
                        name="disabled"
                        value={user.disabled ? "false" : "true"}
                      />
                      <SubmitButton
                        variant={user.disabled ? "secondary" : "danger"}
                      >
                        {user.disabled ? "Activar" : "Desactivar"}
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
