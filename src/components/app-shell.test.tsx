// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/people",
  useRouter: () => ({ refresh: vi.fn() }),
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
    const home = screen.getAllByRole("link", { name: /inicio/i }).at(-1);

    expect(nav.className).toContain("overflow-x-auto");
    expect(nav.className).toContain("flex-nowrap");
    expect(home?.className).toContain("min-h-9");
    expect(screen.getByRole("button", { name: "Contraer barra lateral" })).not.toBeNull();
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
      screen.getAllByRole("link", { name: /personas/i })[0].getAttribute(
        "aria-current",
      ),
    ).toBe("page");
  });
});
