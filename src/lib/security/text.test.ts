import { describe, expect, it } from "vitest";
import { cleanUserText } from "./text";

describe("cleanUserText", () => {
  it("normalizes unicode and removes invisible control characters", () => {
    expect(cleanUserText("  Cafe\u0301\u0000\u200b  ")).toBe("Café");
  });

  it("collapses single-line whitespace without destroying multiline bodies", () => {
    expect(cleanUserText("hola\t\t mundo", { multiline: false })).toBe(
      "hola mundo",
    );
    expect(cleanUserText("hola\n\nmundo", { multiline: true })).toBe(
      "hola\n\nmundo",
    );
  });
});
