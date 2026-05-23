import { describe, expect, it } from "vitest";
import { getContrastRatio, getProfileTheme } from "./profile-themes";

describe("profile themes", () => {
  it("keeps light custom profile colors readable on action surfaces", () => {
    const theme = getProfileTheme("AURORA", "#ffffaa");

    expect(getContrastRatio(theme.accent, "#ffffff")).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(
      getContrastRatio(theme.accentContrast, theme.accent),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps dark custom profile colors readable in neon profiles", () => {
    const theme = getProfileTheme("NEON", "#111111");

    expect(getContrastRatio(theme.accent, "#111827")).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(
      getContrastRatio(theme.accentContrast, theme.accent),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
