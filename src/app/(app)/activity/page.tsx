import { EmptyState } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { getActivity } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/product/dates";
import { paginateItems, parsePageParam } from "@/lib/product/pagination";
import { activityTypeLabel } from "@/lib/product/presentation";
import { requireUser } from "@/lib/session";
import {
  Activity,
  CheckCircle2,
  Hash,
  MessageCircle,
  PenLine,
  Settings2,
  Sparkles,
  UserPlus,
  UserRoundPlus,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const activityMeta: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  "admin.slot_created": { icon: UserRoundPlus, color: "var(--accent)" },
  "person.fictional_created": { icon: Sparkles, color: "var(--coral)" },
  "proposal.created": { icon: Vote, color: "var(--blue)" },
  "settings.site_copy_updated": { icon: Settings2, color: "var(--muted)" },
  "settings.site_copy_field_updated": { icon: Settings2, color: "var(--muted)" },
  "settings.voting_updated": { icon: Settings2, color: "var(--warning)" },
  "person.updated": { icon: PenLine, color: "var(--accent)" },
  "nickname.added": { icon: Hash, color: "var(--coral)" },
  "post.reply_created": { icon: MessageCircle, color: "var(--blue)" },
  "post.created": { icon: MessageCircle, color: "var(--accent)" },
  "comment.created": { icon: MessageCircle, color: "var(--muted)" },
  "proposal.applied": { icon: CheckCircle2, color: "var(--success)" },
  "registration.completed": { icon: UserPlus, color: "var(--success)" },
};

function getDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const [events, query] = await Promise.all([getActivity(200), searchParams]);
  const eventsPage = paginateItems(events, {
    page: parsePageParam(query.page),
    pageSize: 30,
  });

  const grouped: { dateKey: string; items: typeof events }[] = [];
  for (const event of eventsPage.items) {
    const key = getDateKey(event.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.dateKey === key) {
      last.items.push(event);
    } else {
      grouped.push({ dateKey: key, items: [event] });
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black sm:text-4xl">Actividad reciente</h1>
        <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
          Historial visible de cambios y movimiento social del grupo.
        </p>
      </div>
      <section className="surface rounded-[28px] p-4 sm:p-5">
        {grouped.map((group) => (
          <div key={group.dateKey} className="mb-6 last:mb-0">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              {group.dateKey}
            </h2>
            <ol className="relative ml-4 space-y-0 border-l-2 border-[var(--border)]">
              {group.items.map((event) => {
                const meta = activityMeta[event.type] ?? {
                  icon: Activity,
                  color: "var(--muted)",
                };
                const IconComponent = meta.icon;
                return (
                  <li key={event.id} className="relative pb-4 pl-7 last:pb-0">
                    <span
                      className="timeline-dot absolute -left-[13px] top-1 grid size-6 place-items-center rounded-full border-2 border-[var(--surface)] shadow-sm"
                      style={{ backgroundColor: meta.color }}
                    >
                      <IconComponent
                        className="size-3 text-white"
                        aria-hidden
                      />
                    </span>
                    <p className="font-semibold leading-snug">
                      {event.message}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {activityTypeLabel(event.type)} -{" "}
                      {formatDateTime(event.createdAt)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
        {events.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Sin actividad"
            body="Los eventos importantes apareceran aqui."
          />
        ) : null}
      </section>
      <PaginationControls
        page={eventsPage.page}
        totalPages={eventsPage.totalPages}
        searchParams={query}
      />
    </div>
  );
}
