// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SidebarCollapseControl } from "./sidebar-collapse";

describe("SidebarCollapseControl", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-sidebar-collapsed");
    localStorage.clear();
  });

  it("collapses and expands the desktop sidebar state", () => {
    render(<SidebarCollapseControl />);

    fireEvent.click(
      screen.getByRole("button", { name: "Contraer barra lateral" }),
    );

    expect(document.documentElement.dataset.sidebarCollapsed).toBe("true");
    expect(
      screen.getByRole("button", { name: "Expandir barra lateral" }),
    ).not.toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Expandir barra lateral" }),
    );

    expect(document.documentElement.dataset.sidebarCollapsed).toBe("false");
  });
});
