import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { TicketsPage } from "./TicketsPage";
import { UserProvider } from "../users/UserContext";
import { UsersProvider } from "../users/UsersProvider";
import { TicketProvider } from "./TicketContext";
import { useUser } from "../../hooks/useUser";
import type { Ticket, User } from "../../types";

const { seededTickets } = vi.hoisted(() => {
  const tickets: Ticket[] = [
    {
      id: "TICK-1001",
      subject: "Printer jams in lobby",
      description: "Desc",
      customerId: "cust-1",
      status: "open",
      priority: "high",
      category: "Hardware",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: "TICK-1002",
      subject: "Reset lobby kiosk password",
      description: "Desc",
      customerId: "cust-2",
      status: "in-progress",
      priority: "medium",
      category: "General",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 86400000).toISOString(),
    },
  ];
  return { seededTickets: tickets };
});

vi.mock("../../services/api/ticketService", () => ({
  ticketService: {
    getTickets: vi.fn().mockResolvedValue(seededTickets),
  },
}));

function UserSetter({ currentUser }: { currentUser: User }) {
  const { setCurrentUser } = useUser();
  React.useEffect(() => {
    setCurrentUser(currentUser);
  }, [currentUser, setCurrentUser]);
  return null;
}

const renderTicketsPage = (user: User) => {
  return render(
    <MemoryRouter>
      <UserProvider>
        <UserSetter currentUser={user} />
        <UsersProvider>
          <TicketProvider>
            <TicketsPage />
          </TicketProvider>
        </UsersProvider>
      </UserProvider>
    </MemoryRouter>,
  );
};

const manager: User = {
  id: "usr-1",
  name: "Sarah Connor",
  email: "sarah@queuedesk.com",
  role: "manager",
};

const agent: User = {
  id: "usr-2",
  name: "Alex Mercer",
  email: "alex@queuedesk.com",
  role: "agent",
};

describe("TicketsPage ticket deletion", () => {
  it("shows a delete action per row for managers", async () => {
    renderTicketsPage(manager);

    await waitFor(() => {
      expect(
        screen.getAllByText("Printer jams in lobby").length,
      ).toBeGreaterThan(0);
    });
    expect(
      screen.getAllByRole("button", { name: "Delete TICK-1001" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "Delete TICK-1002" }).length,
    ).toBeGreaterThan(0);
  });

  it("hides the delete action for agents", async () => {
    renderTicketsPage(agent);

    await waitFor(() => {
      expect(
        screen.getAllByText("Printer jams in lobby").length,
      ).toBeGreaterThan(0);
    });
    expect(
      screen.queryByRole("button", { name: "Delete TICK-1001" }),
    ).not.toBeInTheDocument();
  });

  it("removes a ticket after confirming the delete dialog", async () => {
    renderTicketsPage(manager);

    await waitFor(() => {
      expect(
        screen.getAllByText("Printer jams in lobby").length,
      ).toBeGreaterThan(0);
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete TICK-1001" })[0],
    );
    expect(
      screen.getByRole("dialog", { name: "Delete ticket?" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Ticket" }));

    await waitFor(() => {
      expect(screen.queryAllByText("Printer jams in lobby")).toHaveLength(0);
      expect(
        screen.getAllByText("Reset lobby kiosk password").length,
      ).toBeGreaterThan(0);
    });
  });

  it("cancelling the dialog keeps the ticket", async () => {
    renderTicketsPage(manager);

    await waitFor(() => {
      expect(
        screen.getAllByText("Printer jams in lobby").length,
      ).toBeGreaterThan(0);
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete TICK-1001" })[0],
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("Printer jams in lobby").length).toBeGreaterThan(
      0,
    );
  });
});
