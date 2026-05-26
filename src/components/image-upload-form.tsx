"use client";

import { SubmitButton } from "@/components/submit-button";
import { ImagePlus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

export function ImageUploadForm({
  action,
  personId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  personId: string;
}) {
  type UploadState = { ok: boolean; message: string };
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [state, formAction] = useActionState(
    async (_state: UploadState, formData: FormData): Promise<UploadState> => {
      try {
        await action(formData);
        return {
          ok: true,
          message:
            "Foto enviada. Si necesita aprobacion, aparecera como pendiente.",
        };
      } catch (error) {
        return {
          ok: false,
          message:
            error instanceof Error
              ? error.message
              : "No pudimos subir la foto.",
        };
      }
    },
    { ok: false, message: "" },
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="personId" value={personId} />
      <input
        ref={inputRef}
        name="image"
        type="file"
        aria-label="Seleccionar foto"
        accept="image/png,image/jpeg,image/webp,image/gif"
        required
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          setFileName(file?.name ?? "");
          setPreviewUrl(file ? URL.createObjectURL(file) : "");
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <ImagePlus className="size-4" aria-hidden />
        {fileName || "Seleccionar foto"}
      </button>
      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Vista previa de la foto seleccionada"
            className="aspect-video w-full object-cover"
          />
        </div>
      ) : null}
      <input
        name="altText"
        aria-label="Descripcion breve"
        placeholder="Descripcion breve"
        className="field h-11 w-full px-3"
      />
      <SubmitButton variant="secondary" disabled={!fileName}>
        Subir foto
      </SubmitButton>
      {state.message ? (
        <p
          role="status"
          className={`rounded-2xl border p-3 text-sm ${
            state.ok
              ? "border-[color-mix(in_srgb,var(--success)_32%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]"
              : "border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
