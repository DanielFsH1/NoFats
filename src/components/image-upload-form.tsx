"use client";

import { SubmitButton } from "@/components/submit-button";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ImageUploadForm({
  action,
  personId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  personId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="personId" value={personId} />
      <input
        ref={inputRef}
        name="image"
        type="file"
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
    </form>
  );
}
