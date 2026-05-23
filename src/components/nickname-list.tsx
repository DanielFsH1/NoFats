"use client";

import { normalizeNicknameValue } from "@/lib/product/rules";
import { CalendarPlus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type Nickname = {
  id: string;
  value: string;
  status: string;
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

      <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1 sm:max-h-[30rem]">
        {filteredNicknames.map((nickname) => (
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
                {nickname.status === "TEMPORARY" ? (
                  <span className="text-xs text-[var(--muted)]">inicial</span>
                ) : null}
              </span>
            </span>
            <div className="flex shrink-0 gap-1">
              {nickname.status === "APPROVED" ? (
                <form action={nominateAction}>
                  <input type="hidden" name="personId" value={personId} />
                  <input
                    type="hidden"
                    name="nicknameId"
                    value={nickname.id}
                  />
                  <button
                    type="submit"
                    aria-label={`Postular "${nickname.value}" para apodo del dia siguiente`}
                    title="Postular para el dia siguiente"
                    className="inline-flex size-9 items-center justify-center rounded-full text-[var(--accent)] transition hover:bg-[var(--surface-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <CalendarPlus className="size-4" aria-hidden />
                  </button>
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
        ))}
      </div>

      {filteredNicknames.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          No hay apodos que coincidan con esa busqueda.
        </p>
      ) : null}
    </div>
  );
}
