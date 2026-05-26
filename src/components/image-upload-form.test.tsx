// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageUploadForm } from "./image-upload-form";

describe("ImageUploadForm", () => {
  it("shows a friendly success message after the action completes", async () => {
    const action = vi.fn(async () => undefined);
    render(<ImageUploadForm action={action} personId="person-1" />);

    const file = new File(["image"], "foto.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Seleccionar foto"), {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByLabelText("Descripcion breve"), {
      target: { value: "Una foto" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /subir foto/i }).closest("form")!,
    );

    await waitFor(() =>
      expect(
        screen.getByText("Foto enviada. Si necesita aprobacion, aparecera como pendiente."),
      ).not.toBeNull(),
    );
    expect(action).toHaveBeenCalledTimes(1);
  });
});
