"use client";

import { normalizeNicknameValue } from "@/lib/product/rules";
import {
  CalendarCheck,
  CalendarPlus,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Nickname = {
  id: string;
  value: string;
  status: string;
  tomorrowNominationCount?: number;
  nominatedByCurrentUserForTomorrow?: boolean;
};

type ServerAction = (formData: FormData) => void | Promise<void>;

export function NicknameList({
  nicknames,
  personId,
  nominateAction,
  removeAction,
}: {
  nicknames: Nickname[];
  personId: string;
  nominateAction: ServerAction;
  removeAction: ServerAction;
}) {
  const [query, setQuery] = useState("");
  const [optimisticNominations, setOptimisticNominations] = useState<string[]>(
    [],
  );
  const indexedNicknames = useMemo(
    () =>
      nicknames.map((nickname, index) => ({
        ...nickname,
        number: index + 1,
      })),
    [nicknames],
  );
  const filteredNicknames = useMemo(() => {
    const normalizedQuery = normalizeNicknameValue(query);

    if (!normalizedQuery) {
      return indexedNicknames;
    }

    return indexedNicknames.filter((nickname) =>
      normalizeNicknameValue(nickname.value).includes(normalizedQuery),
    );
  }, [indexedNicknames, query]);

  return (
    <div className="space-y-3">
      <label className="field flex h-11 items-center gap-2 px-3">
        <Search className="size-4 shrink-0 text-[var(--muted)]" aria-hidden />
        <span className="sr-only">Buscar apodo</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar apodo"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
        />
      </label>

      <div className="space-y-2">
        {filteredNicknames.map((nickname) => {
          const optimisticallyNominated = optimisticNominations.includes(
            nickname.id,
          );
          const nominatedByCurrentUser =
            nickname.nominatedByCurrentUserForTomorrow ||
            optimisticallyNominated;
          const nominationCount =
            (nickname.tomorrowNominationCount ?? 0) +
            (optimisticallyNominated &&
            !nickname.nominatedByCurrentUserForTomorrow
              ? 1
              : 0);

          return (
            <div
              key={nickname.id}
              className="soft-card flex items-center justify-between gap-3 rounded-2xl p-3"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--surface-strong)] text-xs font-black text-[var(--muted)]">
                  {nickname.number}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate">{nickname.value}</strong>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                    {nickname.status === "TEMPORARY" ? (
                      <span>inicial</span>
                    ) : null}
                    {nickname.status === "APPROVED" ? (
                      <span>
                        {nominationCount}{" "}
                        {nominationCount === 1
                          ? "postulacion para manana"
                          : "postulaciones para manana"}
                      </span>
                    ) : null}
                    {nominatedByCurrentUser ? (
                      <span
                        role="status"
                        className="rounded-full bg-[color-mix(in_srgb,var(--success)_14%,transparent)] px-2 py-0.5 font-black text-[var(--success)]"
                      >
                        Postulado
                      </span>
                    ) : null}
                  </span>
                </span>
              </span>
              <div className="flex shrink-0 gap-1">
                {nickname.status === "APPROVED" ? (
                  <form
                    action={nominateAction}
                    onSubmit={() =>
                      setOptimisticNominations((current) =>
                        current.includes(nickname.id)
                          ? current
                          : [...current, nickname.id],
                      )
                    }
                  >
                    <input type="hidden" name="personId" value={personId} />
                    <input
                      type="hidden"
                      name="nicknameId"
                      value={nickname.id}
                    />
                    <NominateButton
                      nickname={nickname.value}
                      nominated={nominatedByCurrentUser}
                    />
                  </form>
                ) : null}
                <form action={removeAction}>
                  <input type="hidden" name="nicknameId" value={nickname.id} />
                  <button
                    type="submit"
                    aria-label={`Quitar el apodo "${nickname.value}"`}
                    title="Quitar apodo"
                    className="inline-flex size-9 items-center justify-center rounded-full text-[var(--danger)] transition hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger)]"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNicknames.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          No hay apodos que coincidan con esa busqueda.
        </p>
      ) : null}
    </div>
  );
}

function NominateButton({
  nickname,
  nominated,
}: {
  nickname: string;
  nominated: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || nominated}
      aria-label={
        nominated
          ? `"${nickname}" ya esta postulado para el apodo del dia siguiente`
          : `Postular "${nickname}" para apodo del dia siguiente`
      }
      title={nominated ? "Ya postulado para manana" : "Postular para manana"}
      className="inline-flex size-9 items-center justify-center rounded-full text-[var(--accent)] transition hover:bg-[var(--surface-strong)] disabled:cursor-not-allowed disabled:bg-[color-mix(in_srgb,var(--success)_12%,transparent)] disabled:text-[var(--success)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : nominated ? (
        <CalendarCheck className="size-4" aria-hidden />
      ) : (
        <CalendarPlus className="size-4" aria-hidden />
      )}
    </button>
  );
}
