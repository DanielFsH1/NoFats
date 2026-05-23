"use client";

import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function MediaLightbox({
  src,
  fullSrc,
  alt,
  width,
  height,
  className = "",
  imageClassName = "",
}: {
  src: string;
  fullSrc?: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  className?: string;
  imageClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const naturalWidth = width && width > 0 ? width : 1200;
  const naturalHeight = height && height > 0 ? height : 900;
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block overflow-hidden text-left ${className}`}
        aria-label={`Ampliar imagen: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={naturalWidth}
          height={naturalHeight}
          unoptimized
          className={imageClassName}
        />
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/50 text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="size-4" aria-hidden />
        </span>
      </button>

      {open && portalTarget
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-black/82 p-3 backdrop-blur-sm sm:p-6"
            >
              <div
                className="absolute inset-0"
                onClick={() => setOpen(false)}
              />
              <div className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-white/15 bg-black shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px]">
                <div className="flex items-center justify-between gap-3 border-b border-white/12 px-4 py-3 text-white">
                  <h2 id={titleId} className="truncate text-sm font-black">
                    {alt}
                  </h2>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/18"
                    aria-label="Cerrar imagen"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <div className="relative min-h-0 flex-1">
                  <Image
                    src={fullSrc ?? src}
                    alt={alt}
                    width={naturalWidth}
                    height={naturalHeight}
                    unoptimized
                    className="max-h-[calc(100dvh-5.5rem)] w-full object-contain sm:max-h-[calc(100dvh-7rem)]"
                  />
                </div>
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
