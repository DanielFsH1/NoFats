// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpandablePanel } from "./expandable-panel";

describe("ExpandablePanel", () => {
  it("opens a centered dialog in document.body and closes without blocking the page", async () => {
    render(
      <div data-testid="host">
        <ExpandablePanel title="Apodos aprobados" openLabel="Ver apodos">
          <button type="button">Accion interna</button>
        </ExpandablePanel>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ver apodos" }));

    const dialog = screen.getByRole("dialog", { name: "Apodos aprobados" });
    expect(dialog.parentElement).toBe(document.body);
    expect(
      within(dialog).getByRole("button", { name: "Accion interna" }),
    ).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("button", { name: "Ver apodos" })).not.toBeNull();
  });
});
