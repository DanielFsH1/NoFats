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
        className="ml-2 inline-flex size-8 cursor-pointer list-none items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={label}
        title={label}
      >
        <Pencil className="size-4" aria-hidden />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
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
