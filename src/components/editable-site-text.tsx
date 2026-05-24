import { SubmitButton } from "@/components/submit-button";
import { updateSiteCopyFieldAction } from "@/lib/actions/app-actions";
import { Pencil } from "lucide-react";

type EditableSiteTextField =
  | "appName"
  | "loginEyebrow"
  | "loginHeroTitle"
  | "loginHeroSubtitle"
  | "dashboardTitle"
  | "dashboardSubtitle";

export function EditableSiteText({
  field,
  value,
  multiline = false,
  label = "Editar texto",
}: {
  field: EditableSiteTextField;
  value: string;
  multiline?: boolean;
  label?: string;
}) {
  return (
    <details className="group relative inline-block align-middle">
      <summary
        className="ml-1 inline-flex size-8 shrink-0 cursor-pointer list-none items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={label}
        title={label}
      >
        <Pencil className="size-3.5" aria-hidden />
      </summary>
      <div className="absolute left-0 z-50 mt-3 w-[min(320px,calc(100vw-2rem))] animate-fade-in-scale rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
        <div className="absolute -top-1.5 left-4 size-3 rotate-45 border-l border-t border-[var(--border)] bg-[var(--surface)]" />
        <form action={updateSiteCopyFieldAction} className="space-y-3">
          <input type="hidden" name="field" value={field} />
          {multiline ? (
            <textarea
              name="value"
              aria-label={label}
              defaultValue={value}
              required
              className="field min-h-28 w-full p-3 text-sm"
            />
          ) : (
            <input
              name="value"
              aria-label={label}
              defaultValue={value}
              required
              className="field h-11 w-full px-3 text-sm"
            />
          )}
          <SubmitButton variant="secondary">Guardar texto</SubmitButton>
        </form>
      </div>
    </details>
  );
}
