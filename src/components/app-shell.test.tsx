// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/people",
}));

describe("AppShell", () => {
  it("uses a compact horizontally scrollable navigation on small screens", () => {
    render(
      <AppShell
        appName="NoFats"
        user={{ name: "Usuario", role: "USER", personId: "person-1" }}
      >
        <main>Contenido</main>
      </AppShell>,
    );

    const nav = screen.getByRole("navigation", {
      name: "Navegacion principal",
    });
    const home = screen.getByRole("link", { name: /inicio/i });

    expect(nav.className).toContain("overflow-x-auto");
    expect(nav.className).toContain("flex-nowrap");
    expect(home.className).toContain("min-h-9");
    expect(screen.getByText("Usuario").closest("div")?.className).toContain(
      "hidden",
    );
  });

  it("marks the current navigation item for keyboard and screen-reader users", () => {
    render(
      <AppShell
        appName="NoFats"
        user={{ name: "Usuario", role: "USER", personId: "person-1" }}
      >
        <main>Contenido</main>
      </AppShell>,
    );

    expect(
      screen.getByRole("link", { name: /personas/i }).getAttribute(
        "aria-current",
      ),
    ).toBe("page");
  });
});
