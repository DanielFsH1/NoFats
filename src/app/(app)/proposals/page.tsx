import { EmptyState } from "@/components/app-shell";
import { SubmitButton } from "@/components/submit-button";
import {
  addProposalCommentAction,
  proposeFictionalPersonAction,
  proposeSiteCopyAction,
  voteProposalAction,
} from "@/lib/actions/app-actions";
import { getProposalsWithVotes, getVoteCommentList, getVotingThreshold } from "@/lib/data/queries";
import { getAppSettings } from "@/lib/data/settings";
import { getProposalThresholds } from "@/lib/product/rules";
import { requireUser } from "@/lib/session";
import { Check, MessageCircle, PencilLine, Plus, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  await requireUser();
  const [proposals, eligibleUsers, settings] = await Promise.all([
    getProposalsWithVotes(),
    getVotingThreshold(),
    getAppSettings(),
  ]);
  const thresholds = getProposalThresholds(eligibleUsers, settings.voteSettings);
  const proposalCards = await Promise.all(
    proposals.map(async (proposal) => ({
      proposal,
      voteComments: await getVoteCommentList(proposal.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-4xl font-black">Propuestas y votaciones</h1>
          <p className="mt-2 text-[var(--muted)]">
            Umbral actual: {thresholds.approvalThreshold} aprobacion(es) al{" "}
            {settings.voteSettings.approvalPercentage}% y{" "}
            {thresholds.rejectionThreshold} rechazo(s) al{" "}
            {settings.voteSettings.rejectionPercentage}% de {eligibleUsers} usuarios
            reales activos.
          </p>
        </div>
        <div className="space-y-4">
          <section className="surface rounded-[24px] p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Plus className="size-5" aria-hidden />
              Proponer perfil
            </h2>
            <form action={proposeFictionalPersonAction} className="mt-4 space-y-3">
              <label className="block text-sm font-semibold" htmlFor="displayName">
                Nombre visible
              </label>
              <input
                id="displayName"
                name="displayName"
                required
                placeholder="Nombre visible"
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
              />
              <label className="block text-sm font-semibold" htmlFor="fullName">
                Descripcion opcional
              </label>
              <input
                id="fullName"
                name="fullName"
                placeholder="Descripcion opcional"
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
              />
              <SubmitButton>Proponer</SubmitButton>
            </form>
          </section>

          <section className="surface rounded-[24px] p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <PencilLine className="size-5" aria-hidden />
              Proponer textos
            </h2>
            <form action={proposeSiteCopyAction} className="mt-4 space-y-3">
              <label className="block text-sm font-semibold" htmlFor="appName">
                Titulo de la web
              </label>
              <input
                id="appName"
                name="appName"
                required
                defaultValue={settings.siteCopy.appName}
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
              />
              <label className="block text-sm font-semibold" htmlFor="loginEyebrow">
                Etiqueta pequena del login
              </label>
              <input
                id="loginEyebrow"
                name="loginEyebrow"
                required
                defaultValue={settings.siteCopy.loginEyebrow}
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
              />
              <label className="block text-sm font-semibold" htmlFor="loginHeroTitle">
                Mensaje principal del login
              </label>
              <textarea
                id="loginHeroTitle"
                name="loginHeroTitle"
                required
                defaultValue={settings.siteCopy.loginHeroTitle}
                className="min-h-20 w-full rounded-xl border border-[var(--border)] p-3"
              />
              <label className="block text-sm font-semibold" htmlFor="loginHeroSubtitle">
                Comentario pequeno
              </label>
              <textarea
                id="loginHeroSubtitle"
                name="loginHeroSubtitle"
                required
                defaultValue={settings.siteCopy.loginHeroSubtitle}
                className="min-h-20 w-full rounded-xl border border-[var(--border)] p-3"
              />
              <label className="block text-sm font-semibold" htmlFor="dashboardTitle">
                Titulo del inicio
              </label>
              <input
                id="dashboardTitle"
                name="dashboardTitle"
                required
                defaultValue={settings.siteCopy.dashboardTitle}
                className="h-11 w-full rounded-xl border border-[var(--border)] px-3"
              />
              <label className="block text-sm font-semibold" htmlFor="dashboardSubtitle">
                Comentario del inicio
              </label>
              <textarea
                id="dashboardSubtitle"
                name="dashboardSubtitle"
                required
                defaultValue={settings.siteCopy.dashboardSubtitle}
                className="min-h-20 w-full rounded-xl border border-[var(--border)] p-3"
              />
              <SubmitButton variant="secondary">Enviar a votacion</SubmitButton>
            </form>
          </section>
        </div>
      </div>

      <section className="space-y-4">
        {proposalCards.map(({ proposal, voteComments }) => {
          return (
            <article
              key={proposal.id}
              className="surface rounded-[28px] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                    {proposal.type} · {proposal.status}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{proposal.title}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">{proposal.summary}</p>
                </div>
                <div className="min-w-64 rounded-2xl bg-white p-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-black text-[var(--success)]">
                        {proposal.approvals}
                      </p>
                      <p className="text-xs text-[var(--muted)]">aprueban</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[var(--danger)]">
                        {proposal.rejections}
                      </p>
                      <p className="text-xs text-[var(--muted)]">rechazan</p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-xl bg-[var(--surface-strong)] p-2 text-center text-xs font-semibold">
                    Se necesitan {thresholds.approvalThreshold} para aprobar o{" "}
                    {thresholds.rejectionThreshold} para rechazar
                  </p>
                </div>
              </div>

              {proposal.status === "PENDING" ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <form action={voteProposalAction} className="rounded-2xl bg-white p-4">
                    <input type="hidden" name="proposalId" value={proposal.id} />
                    <input type="hidden" name="decision" value="APPROVE" />
                    <textarea
                      name="comment"
                      placeholder="Comentario opcional"
                      className="min-h-20 w-full rounded-xl border border-[var(--border)] p-3"
                    />
                    <div className="mt-3">
                      <SubmitButton>
                        <Check className="size-4" aria-hidden />
                        Aprobar
                      </SubmitButton>
                    </div>
                  </form>
                  <form action={voteProposalAction} className="rounded-2xl bg-white p-4">
                    <input type="hidden" name="proposalId" value={proposal.id} />
                    <input type="hidden" name="decision" value="REJECT" />
                    <textarea
                      name="comment"
                      placeholder="Comentario opcional"
                      className="min-h-20 w-full rounded-xl border border-[var(--border)] p-3"
                    />
                    <div className="mt-3">
                      <SubmitButton variant="danger">
                        <X className="size-4" aria-hidden />
                        Rechazar
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <h3 className="flex items-center gap-2 font-black">
                    <MessageCircle className="size-4" aria-hidden />
                    Comentarios de votos
                  </h3>
                  <div className="mt-3 space-y-2">
                    {voteComments
                      .filter((vote) => vote.comment)
                      .map((vote) => (
                        <p key={vote.id} className="text-sm">
                          <strong>{vote.authorName}</strong>{" "}
                          <span className="text-xs text-[var(--muted)]">
                            {vote.decision}
                          </span>
                          : {vote.comment}
                        </p>
                      ))}
                  </div>
                </div>
                <form action={addProposalCommentAction} className="rounded-2xl bg-white p-4">
                  <input type="hidden" name="proposalId" value={proposal.id} />
                  <textarea
                    name="body"
                    required
                    placeholder="Comentario general..."
                    className="min-h-20 w-full rounded-xl border border-[var(--border)] p-3"
                  />
                  <div className="mt-3">
                    <SubmitButton variant="secondary">Comentar</SubmitButton>
                  </div>
                </form>
              </div>
            </article>
          );
        })}
        {proposals.length === 0 ? (
          <EmptyState title="Sin propuestas" body="Cuando alguien proponga algo, aparecera aqui." />
        ) : null}
      </section>
    </div>
  );
}
