// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NicknameList } from "./nickname-list";

describe("NicknameList", () => {
  it("shows approval and rejection comments for approved nicknames in a disclosure", () => {
    render(
      <NicknameList
        personId="person-1"
        nominateAction={vi.fn()}
        removeAction={vi.fn()}
        nicknames={[
          {
            id: "nick-1",
            value: "Rayo",
            status: "APPROVED",
            voteComments: [
              {
                id: "vote-1",
                authorName: "Ana",
                decision: "APPROVE",
                comment: "Le queda perfecto.",
              },
              {
                id: "vote-2",
                authorName: "Luis",
                decision: "REJECT",
                comment: "Prefiero otro.",
              },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: 'Ver comentarios de votos para "Rayo"',
      }),
    );

    expect(screen.getByText("Le queda perfecto.")).not.toBeNull();
    expect(screen.getByText("Prefiero otro.")).not.toBeNull();
  });
});
