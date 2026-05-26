// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaLightbox } from "./media-lightbox";

describe("MediaLightbox", () => {
  it("opens image viewer in document.body and restores page scroll when closed", () => {
    render(
      <MediaLightbox
        src="/api/media/test"
        alt="Foto de prueba"
        className="h-20 w-20"
        imageClassName="h-full w-full object-cover"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ampliar imagen/i }));

    const dialog = screen.getByRole("dialog", { name: "Foto de prueba" });
    expect(dialog.parentElement).toBe(document.body);
    expect(document.body.style.overflow).toBe("hidden");
    expect(within(dialog).getByRole("button", { name: "Cerrar imagen" })).toBe(
      document.activeElement,
    );
    expect(
      within(dialog).getByRole("img", { name: "Foto de prueba" }),
    ).not.toBeNull();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Cerrar imagen" }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
