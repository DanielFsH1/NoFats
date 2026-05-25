import { describe, expect, it } from "vitest";
import {
  proposalDisplaySummary,
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

  it("renders image removal proposals as first-class photo proposals", () => {
    const proposal = {
      type: "REMOVE_IMAGE",
      title: "Eliminar foto",
      summary: "Foto antigua",
      payload: { altText: "Foto borrosa" },
      createdByName: "Usuario QA",
      creatorDisplayName: "Ana",
      targetDisplayName: "Luis",
    } as const;

    expect(proposalTypeLabel(proposal.type)).toBe("Quitar foto");
    expect(proposalDisplayTitle(proposal)).toBe(
      "Ana quiere quitar una foto de Luis",
    );
    expect(proposalDisplaySummary(proposal)).toBe("Foto borrosa");
  });
});
