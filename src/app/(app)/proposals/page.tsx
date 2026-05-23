import { EmptyState } from "@/components/app-shell";
import { PersonAvatar } from "@/components/person-avatar";
import { SubmitButton } from "@/components/submit-button";
import {
  addProposalCommentAction,
  proposeFictionalPersonAction,
  proposeSiteCopyAction,
  voteProposalAction,
} from "@/lib/actions/app-actions";
import {
  getProposalsWithVotes,
  getVoteCommentList,
  getVotingThreshold,
} from "@/lib/data/queries";
import { getAppSettings } from "@/lib/data/settings";
import {
  proposalDisplaySummary,
  proposalDisplayTitle,
  proposalStatusLabel,
  proposalTypeLabel,
  voteDecisionLabel,
} from "@/lib/product/presentation";
import { getProposalThresholds } from "@/lib/product/rules";
import { requireUser } from "@/lib/session";
import { Check, MessageCircle, PencilLine, Plus, X } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const { user } = await requireUser();
  const [proposals, eligibleUsers, settings] = await Promise.all([
    getProposalsWithVotes(),
    getVotingThreshold(),
    getAppSettings(),
  ]);
  const thresholds = getProposalThresholds(
    eligibleUsers,
    settings.voteSettings,
  );
  const proposalCards = await Promise.all(
    proposals.map(async (proposal) => ({
      proposal,
      voteComments: await getVoteCommentList(proposal.id),
    })),
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-4 xl:order-2">
        <div className="surface rounded-[24px] p-5">
          <p className="text-xs font-bold uppercase text-[var(--accent)]">
            Reglas del grupo
          </p>
          <h1 className="mt-2 text-3xl font-black">Votos y propuestas</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Hoy se necesitan {thresholds.approvalThreshold} voto(s) a favor al{" "}
            {settings.voteSettings.approvalPercentage}% o{" "}
            {thresholds.rejectionThreshold} en contra al{" "}
            {settings.voteSettings.rejectionPercentage}% entre {eligibleUsers}{" "}
            integrante(s) con voto.
          </p>
        </div>

        <section className="surface rounded-[24px] p-5">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <Plus className="size-5" aria-hidden />
            Proponer perfil
          </h2>
          <form
            action={proposeFictionalPersonAction}
            className="mt-4 space-y-3"
          >
            <label
              className="block text-sm font-semibold"
              htmlFor="displayName"
            >
              Nombre visible
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              placeholder="Nombre visible"
              className="field h-11 w-full px-3"
            />
            <label className="block text-sm font-semibold" htmlFor="fullName">
              Descripcion opcional
            </label>
            <input
              id="fullName"
              name="fullName"
              placeholder="Descripcion opcional"
              className="field h-11 w-full px-3"
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
              className="field h-11 w-full px-3"
            />
            <label
              className="block text-sm font-semibold"
              htmlFor="loginEyebrow"
            >
              Etiqueta pequena del login
            </label>
            <input
              id="loginEyebrow"
              name="loginEyebrow"
              required
              defaultValue={settings.siteCopy.loginEyebrow}
              className="field h-11 w-full px-3"
            />
            <label
              className="block text-sm font-semibold"
              htmlFor="loginHeroTitle"
            >
              Mensaje principal del login
            </label>
            <textarea
              id="loginHeroTitle"
              name="loginHeroTitle"
              required
              defaultValue={settings.siteCopy.loginHeroTitle}
              className="field min-h-20 w-full p-3"
            />
            <label
              className="block text-sm font-semibold"
              htmlFor="loginHeroSubtitle"
            >
              Comentario pequeno
            </label>
            <textarea
              id="loginHeroSubtitle"
              name="loginHeroSubtitle"
              required
              defaultValue={settings.siteCopy.loginHeroSubtitle}
              className="field min-h-20 w-full p-3"
            />
            <label
              className="block text-sm font-semibold"
              htmlFor="dashboardTitle"
            >
              Titulo del inicio
            </label>
            <input
              id="dashboardTitle"
              name="dashboardTitle"
              required
              defaultValue={settings.siteCopy.dashboardTitle}
              className="field h-11 w-full px-3"
            />
            <label
              className="block text-sm font-semibold"
              htmlFor="dashboardSubtitle"
            >
              Comentario del inicio
            </label>
            <textarea
              id="dashboardSubtitle"
              name="dashboardSubtitle"
              required
              defaultValue={settings.siteCopy.dashboardSubtitle}
              className="field min-h-20 w-full p-3"
            />
            <SubmitButton variant="secondary">Enviar a votacion</SubmitButton>
          </form>
        </section>
      </section>

      <section className="space-y-4 xl:order-1">
        {proposalCards.map(({ proposal, voteComments }) => {
          const displayTitle = proposalDisplayTitle(proposal);
          const displaySummary = proposalDisplaySummary(proposal);
          const totalNeeded = Math.max(
            thresholds.approvalThreshold,
            thresholds.rejectionThreshold,
            1,
          );
          const approvalWidth = Math.min(
            100,
            Math.round((proposal.approvals / totalNeeded) * 100),
          );
          const rejectionWidth = Math.min(
            100,
            Math.round((proposal.rejections / totalNeeded) * 100),
          );
          const currentVote = proposal.votes.find(
            (vote) => vote.userId === user.id,
          )?.decision;

          return (
            <article
              id={proposal.id}
              key={proposal.id}
              className="surface overflow-hidden rounded-[28px]"
            >
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="pill">
                      {proposalTypeLabel(proposal.type)}
                    </span>
                    <span className="pill pill-muted">
                      {proposalStatusLabel(proposal.status)}
                    </span>
                  </div>
                  <h2 className="mt-3 text-pretty text-2xl font-black leading-tight">
                    {displayTitle}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    {displaySummary}
                  </p>
                  {proposal.type === "ADD_IMAGE" &&
                  proposal.status === "PENDING" ? (
                    <a
                      href={`/api/proposal-media/${proposal.id}?size=full`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]"
                      aria-label={`Ver foto propuesta: ${displaySummary}`}
                    >
                      <Image
                        src={`/api/proposal-media/${proposal.id}`}
                        alt={displaySummary}
                        width={640}
                        height={360}
                        unoptimized
                        className="aspect-video w-full object-cover"
                      />
                    </a>
                  ) : null}
                </div>

                <div className="soft-card rounded-2xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-black text-[var(--success)]">
                        {proposal.approvals}
                      </p>
                      <p className="text-xs text-[var(--muted)]">a favor</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[var(--danger)]">
                        {proposal.rejections}
                      </p>
                      <p className="text-xs text-[var(--muted)]">en contra</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-[var(--success)]"
                        style={{ width: `${approvalWidth}%` }}
                      />
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-[var(--danger)]"
                        style={{ width: `${rejectionWidth}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs font-semibold text-[var(--muted)]">
                    Meta: {thresholds.approvalThreshold} a favor o{" "}
                    {thresholds.rejectionThreshold} en contra
                  </p>
                </div>
              </div>

              {proposal.status === "PENDING" ? (
                <div className="grid gap-3 border-y border-[var(--border)] bg-[var(--surface-muted)] p-4 md:grid-cols-2">
                  <form
                    action={voteProposalAction}
                    className="soft-card rounded-2xl p-4"
                  >
                    <input
                      type="hidden"
                      name="proposalId"
                      value={proposal.id}
                    />
                    <input type="hidden" name="decision" value="APPROVE" />
                    <textarea
                      name="comment"
                      placeholder="Comentario opcional"
                      className="field min-h-20 w-full p-3"
                    />
                    <div className="mt-3">
                      <SubmitButton disabled={currentVote === "APPROVE"}>
                        <Check className="size-4" aria-hidden />
                        {currentVote === "APPROVE" ? "Aprobado" : "Aprobar"}
                      </SubmitButton>
                    </div>
                  </form>
                  <form
                    action={voteProposalAction}
                    className="soft-card rounded-2xl p-4"
                  >
                    <input
                      type="hidden"
                      name="proposalId"
                      value={proposal.id}
                    />
                    <input type="hidden" name="decision" value="REJECT" />
                    <textarea
                      name="comment"
                      placeholder="Comentario opcional"
                      className="field min-h-20 w-full p-3"
                    />
                    <div className="mt-3">
                      <SubmitButton
                        variant="danger"
                        disabled={currentVote === "REJECT"}
                      >
                        <X className="size-4" aria-hidden />
                        {currentVote === "REJECT" ? "Rechazado" : "Rechazar"}
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              ) : null}

              <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
                <div className="soft-card rounded-2xl p-4">
                  <h3 className="flex items-center gap-2 font-black">
                    <MessageCircle className="size-4" aria-hidden />
                    Comentarios de votos
                  </h3>
                  <div className="mt-3 space-y-2">
                    {voteComments
                      .filter((vote) => vote.comment)
                      .map((vote) => (
                        <article key={vote.id} className="flex gap-3 text-sm">
                          <PersonAvatar
                            dailyPhoto={vote.authorDailyPhoto}
                            name={vote.authorName}
                            size="sm"
                            className="!size-9 !rounded-xl !border-2 text-xs"
                          />
                          <p>
                            <strong>{vote.authorName}</strong>{" "}
                            <span className="text-xs text-[var(--muted)]">
                              {voteDecisionLabel(vote.decision)}
                            </span>
                            : {vote.comment}
                          </p>
                        </article>
                      ))}
                  </div>
                </div>
                <form
                  action={addProposalCommentAction}
                  className="soft-card rounded-2xl p-4"
                >
                  <input type="hidden" name="proposalId" value={proposal.id} />
                  <textarea
                    name="body"
                    required
                    placeholder="Comentario general..."
                    className="field min-h-20 w-full p-3"
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
          <EmptyState
            title="Sin propuestas"
            body="Cuando alguien proponga algo, aparecera aqui."
          />
        ) : null}
      </section>
    </div>
  );
}
