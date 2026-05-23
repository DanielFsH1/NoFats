import { PersonAvatar } from "@/components/person-avatar";
import { SubmitButton } from "@/components/submit-button";
import { formatDateTime } from "@/lib/product/dates";
import { Check, ChevronDown, X } from "lucide-react";

type ServerAction = (formData: FormData) => void | Promise<void>;

type DailyPhoto = {
  id: string;
  altText?: string | null;
} | null;

type NicknameProposal = {
  id: string;
  type: string;
  title: string;
  payload: unknown;
  createdByUserId: string;
  creatorDisplayName: string;
  creatorDailyPhoto: DailyPhoto;
  approvals: number;
  rejections: number;
  votes: {
    id: string;
    userId: string;
    decision: string;
    comment?: string | null;
    createdAt: Date;
    authorName: string;
    authorDailyPhoto: DailyPhoto;
  }[];
};

export function NicknameProposalList({
  proposals,
  currentUserId,
  approvalThreshold,
  rejectionThreshold,
  voteAction,
}: {
  proposals: NicknameProposal[];
  currentUserId: string;
  approvalThreshold: number;
  rejectionThreshold: number;
  voteAction: ServerAction;
}) {
  if (proposals.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
        No hay apodos pendientes.
      </p>
    );
  }

  return (
    <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1 sm:max-h-[30rem]">
      {proposals.map((proposal) => {
        const payload = proposal.payload as {
          value?: unknown;
        };
        const proposedNickname = String(payload.value ?? proposal.title);
        const totalNeeded = Math.max(approvalThreshold, rejectionThreshold, 1);
        const approvalWidth = Math.min(
          100,
          Math.round((proposal.approvals / totalNeeded) * 100),
        );
        const rejectionWidth = Math.min(
          100,
          Math.round((proposal.rejections / totalNeeded) * 100),
        );
        const currentVote = proposal.votes.find(
          (vote) => vote.userId === currentUserId,
        )?.decision;

        return (
          <details
            key={proposal.id}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-3">
                <PersonAvatar
                  dailyPhoto={proposal.creatorDailyPhoto}
                  name={proposal.creatorDisplayName}
                  size="sm"
                  className="!size-10 !rounded-xl !border-2 text-xs"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">
                    {proposal.type === "ADD_NICKNAME"
                      ? proposedNickname
                      : `Quitar ${proposedNickname}`}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {proposal.creatorDisplayName} propuso este cambio
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-2 py-1 text-xs font-black text-[var(--success)]">
                  {proposal.approvals}/{approvalThreshold}
                </span>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-2 py-1 text-xs font-black text-[var(--danger)]">
                  {proposal.rejections}/{rejectionThreshold}
                </span>
                <ChevronDown
                  className="size-4 shrink-0 text-[var(--muted)] transition group-open:rotate-180"
                  aria-hidden
                />
              </span>
            </summary>

            <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
              <div className="space-y-2">
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

              <div className="space-y-2 text-sm">
                <p className="font-bold">Aprobaciones</p>
                {proposal.votes.length > 0 ? (
                  proposal.votes.map((vote) => (
                    <article
                      key={vote.id}
                      className="flex gap-3 rounded-xl bg-[var(--surface-muted)] px-3 py-2"
                    >
                      <PersonAvatar
                        dailyPhoto={vote.authorDailyPhoto}
                        name={vote.authorName}
                        size="sm"
                        className="!size-9 !rounded-xl !border-2 text-xs"
                      />
                      <p>
                        <strong>{vote.authorName}</strong>{" "}
                        <span
                          className={
                            vote.decision === "APPROVE"
                              ? "text-[var(--success)]"
                              : "text-[var(--danger)]"
                          }
                        >
                          {vote.decision === "APPROVE" ? "aprobo" : "rechazo"}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          {" "}
                          {formatDateTime(vote.createdAt)}
                        </span>
                        {vote.comment ? (
                          <span className="block text-[var(--muted)]">
                            {vote.comment}
                          </span>
                        ) : null}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-[var(--muted)]">Aun no hay decisiones.</p>
                )}
              </div>

              {proposal.createdByUserId === currentUserId ? (
                <p className="rounded-2xl bg-[var(--surface-muted)] p-3 text-sm text-[var(--muted)]">
                  Otra persona debe aprobar o rechazar esta propuesta.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <form action={voteAction} className="space-y-2">
                    <input
                      type="hidden"
                      name="proposalId"
                      value={proposal.id}
                    />
                    <input type="hidden" name="decision" value="APPROVE" />
                    <input
                      name="comment"
                      aria-label="Comentario opcional al aprobar"
                      placeholder="Comentario opcional"
                      className="field h-10 w-full px-3 text-sm"
                    />
                    <SubmitButton
                      variant="secondary"
                      disabled={currentVote === "APPROVE"}
                    >
                      <Check className="size-4" aria-hidden />
                      {currentVote === "APPROVE" ? "Aprobado" : "Aprobar"}
                    </SubmitButton>
                  </form>
                  <form action={voteAction} className="space-y-2">
                    <input
                      type="hidden"
                      name="proposalId"
                      value={proposal.id}
                    />
                    <input type="hidden" name="decision" value="REJECT" />
                    <input
                      name="comment"
                      aria-label="Comentario opcional al rechazar"
                      placeholder="Comentario opcional"
                      className="field h-10 w-full px-3 text-sm"
                    />
                    <SubmitButton
                      variant="danger"
                      disabled={currentVote === "REJECT"}
                    >
                      <X className="size-4" aria-hidden />
                      {currentVote === "REJECT" ? "Rechazado" : "Rechazar"}
                    </SubmitButton>
                  </form>
                </div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
