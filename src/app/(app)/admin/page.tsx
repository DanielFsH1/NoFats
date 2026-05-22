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
import { requireAdmin } from "@/lib/session";
import { Copy, PencilLine, SlidersHorizontal, UserPlus, UsersRound } from "lucide-react";

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

  const metrics = [
    ["Usuarios reales", overview.metrics.realUsers],
    ["Perfiles totales", overview.metrics.totalPeople],
    ["Perfiles no reales", overview.metrics.fictionalPeople],
    ["Apodos aprobados", overview.metrics.approvedNicknames],
    ["Propuestas pendientes", overview.metrics.pendingProposals],
    ["Imagenes aprobadas", overview.metrics.approvedImages],
    ["Publicaciones", overview.metrics.totalPosts],
    ["Comentarios", overview.metrics.totalComments],
    ["Votos", overview.metrics.totalVotes],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Administracion</h1>
        <p className="mt-2 text-[var(--muted)]">
          Cupos, perfiles, usuarios, metricas y moderacion basica.
        </p>
      </div>

      {invite ? (
        <section className="rounded-[24px] border border-[var(--accent)] bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
            <Copy className="size-4" aria-hidden />
            Enlace creado
          </p>
          <code className="mt-3 block overflow-x-auto rounded-2xl bg-[var(--surface-strong)] p-3 text-sm">
            {invite}
          </code>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="surface rounded-[24px] p-5">
            <p className="text-sm font-bold text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-4xl font-black">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="surface rounded-[28px] p-6">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <SlidersHorizontal className="size-5" aria-hidden />
            Umbrales de votacion
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Estos porcentajes controlan cuantas aprobaciones o rechazos necesita
            cualquier propuesta sensible.
          </p>
          <form action={updateVoteSettingsAction} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold" htmlFor="approvalPercentage">
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
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="rejectionPercentage">
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
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-3"
              />
            </div>
            <SubmitButton>Guardar porcentajes</SubmitButton>
          </form>
        </div>

        <div className="surface rounded-[28px] p-6">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <PencilLine className="size-5" aria-hidden />
            Textos principales
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            El administrador puede aplicarlos directo; los usuarios tambien
            pueden proponer cambios desde Votos.
          </p>
          <form action={updateSiteCopyAction} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="adminAppName">
                Titulo de la web
              </label>
              <input
                id="adminAppName"
                name="appName"
                required
                defaultValue={settings.siteCopy.appName}
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="adminLoginEyebrow">
                Etiqueta pequena
              </label>
              <input
                id="adminLoginEyebrow"
                name="loginEyebrow"
                required
                defaultValue={settings.siteCopy.loginEyebrow}
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-3"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold" htmlFor="adminLoginHeroTitle">
                Mensaje principal del login
              </label>
              <textarea
                id="adminLoginHeroTitle"
                name="loginHeroTitle"
                required
                defaultValue={settings.siteCopy.loginHeroTitle}
                className="mt-2 min-h-24 w-full rounded-xl border border-[var(--border)] p-3"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold" htmlFor="adminLoginHeroSubtitle">
                Comentario pequeno del login
              </label>
              <textarea
                id="adminLoginHeroSubtitle"
                name="loginHeroSubtitle"
                required
                defaultValue={settings.siteCopy.loginHeroSubtitle}
                className="mt-2 min-h-24 w-full rounded-xl border border-[var(--border)] p-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="adminDashboardTitle">
                Titulo del inicio
              </label>
              <input
                id="adminDashboardTitle"
                name="dashboardTitle"
                required
                defaultValue={settings.siteCopy.dashboardTitle}
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="adminDashboardSubtitle">
                Comentario del inicio
              </label>
              <input
                id="adminDashboardSubtitle"
                name="dashboardSubtitle"
                required
                defaultValue={settings.siteCopy.dashboardSubtitle}
                className="mt-2 h-12 w-full rounded-xl border border-[var(--border)] px-3"
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton>Guardar textos</SubmitButton>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-[28px] p-6">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <UserPlus className="size-5" aria-hidden />
            Crear cupo real
          </h2>
          <form action={createRegistrationSlotAction} className="mt-5 flex gap-3">
            <input
              name="shortName"
              required
              placeholder="Diego, Max, Valentina..."
              className="h-12 min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3"
            />
            <SubmitButton>Crear</SubmitButton>
          </form>
          <div className="mt-6 space-y-3">
            {overview.slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
                <span>
                  <strong>{slot.shortName}</strong>
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    {slot.status}
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

        <div className="surface rounded-[28px] p-6">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <UsersRound className="size-5" aria-hidden />
            Crear perfil no real
          </h2>
          <form action={createFictionalPersonAction} className="mt-5 space-y-3">
            <input
              name="displayName"
              required
              placeholder="Nombre visible"
              className="h-12 w-full rounded-xl border border-[var(--border)] px-3"
            />
            <input
              name="fullName"
              placeholder="Nombre descriptivo"
              className="h-12 w-full rounded-xl border border-[var(--border)] px-3"
            />
            <SubmitButton>Crear perfil</SubmitButton>
          </form>
        </div>
      </section>

      <section className="surface rounded-[28px] p-6">
        <h2 className="text-2xl font-black">Usuarios</h2>
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
                  <td>{user.role}</td>
                  <td>{user.disabled ? "Desactivado" : "Activo"}</td>
                  <td>
                    <form action={toggleUserDisabledAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        type="hidden"
                        name="disabled"
                        value={user.disabled ? "false" : "true"}
                      />
                      <SubmitButton variant={user.disabled ? "secondary" : "danger"}>
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
