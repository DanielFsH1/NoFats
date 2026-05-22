import { describe, expect, it } from "vitest";
import {
  proposalDisplayTitle,
  proposalStatusLabel,
  proposalTypeLabel,
} from "./presentation";

describe("proposal presentation", () => {
  it("renders nickname proposals with profile display names instead of raw technical text", () => {
    const title = proposalDisplayTitle({
      type: "ADD_NICKNAME",
      title: "Usuario QA propone el apodo \"Robot\"",
      summary: "",
      payload: { value: "Robot" },
      createdByName: "Usuario QA",
      creatorDisplayName: "Rayo",
      targetDisplayName: "Max",
    });

    expect(title).toBe('Rayo quiere sumar "Robot" a Max');
    expect(title).not.toContain("Usuario QA propone");
  });

  it("maps internal proposal enums to human labels", () => {
    expect(proposalTypeLabel("ADD_NICKNAME")).toBe("Apodo");
    expect(proposalStatusLabel("PENDING")).toBe("En votacion");
  });
});
