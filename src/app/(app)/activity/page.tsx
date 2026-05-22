import { EmptyState } from "@/components/app-shell";
import { getActivity } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/product/dates";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  await requireUser();
  const events = await getActivity(80);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">Actividad reciente</h1>
        <p className="mt-2 text-[var(--muted)]">
          Historial visible de cambios y movimiento social del grupo.
        </p>
      </div>
      <section className="surface rounded-[28px] p-5">
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-2xl bg-white p-4">
              <p className="font-semibold">{event.message}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {event.type} · {formatDateTime(event.createdAt)}
              </p>
            </li>
          ))}
        </ol>
        {events.length === 0 ? (
          <EmptyState title="Sin actividad" body="Los eventos importantes apareceran aqui." />
        ) : null}
      </section>
    </div>
  );
}
