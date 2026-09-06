import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { TicketQuickActions } from "./TicketQuickActions";
import { UserProvider } from "../users/UserContext";
import { UsersProvider } from "../users/UsersProvider";
import { TicketProvider } from "./TicketContext";
import { NotificationsProvider } from "../notifications/NotificationsProvider";
import { useUser } from "../../hooks/useUser";
import type { Ticket, User } from "../../types";

vi.mock("../../services/api/ticketService", () => ({
  ticketService: {
    getTickets: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../services/api/userService", () => ({
  userService: {
    getUsers: vi.fn().mockResolvedValue([
      {
        id: "usr-1",
        name: "Sarah Connor",
        email: "sarah@q.com",
        role: "manager",
      },
      { id: "usr-2", name: "Alex Mercer", email: "alex@q.com", role: "agent" },
      {
        id: "usr-3",
        name: "Elena Fisher",
        email: "elena@q.com",
        role: "agent",
      },
    ]),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const ticket: Ticket = {
  id: "TICK-1001",
  subject: "Test",
  description: "Desc",
  customerId: "cust-1",
  status: "open",
  priority: "medium",
  category: "General",
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  dueAt: new Date().toISOString(),
};

function UserSetter({ currentUser }: { currentUser: User }) {
  const { setCurrentUser } = useUser();
  React.useEffect(() => {
    setCurrentUser(currentUser);
  }, [currentUser, setCurrentUser]);
  return null;
}

const renderQuickActions = (user: User, seeded: Ticket = ticket) => {
  return render(
    <MemoryRouter>
      <UserProvider>
        <UserSetter currentUser={user} />
        <UsersProvider>
          <TicketProvider>
            <NotificationsProvider>
              <TicketQuickActions ticket={seeded} />
            </NotificationsProvider>
          </TicketProvider>
        </UsersProvider>
      </UserProvider>
    </MemoryRouter>,
  );
};

describe("TicketQuickActions", () => {
  it("allows a manager to change status, priority and assignee", async () => {
    renderQuickActions({
      id: "usr-1",
      name: "Sarah",
      email: "sarah@q.com",
      role: "manager",
    });

    await waitFor(() => {
      const status = screen.getByLabelText("Status") as HTMLSelectElement;
      const priority = screen.getByLabelText("Priority") as HTMLSelectElement;
      const assignee = screen.getByLabelText("Assignee") as HTMLSelectElement;
      expect(status).not.toBeDisabled();
      expect(priority).not.toBeDisabled();
      expect(assignee).not.toBeDisabled();
    });
  });

  it("shows a read-only notice for an agent who owns another agent's ticket", async () => {
    renderQuickActions(
      {
        id: "usr-2",
        name: "Alex",
        email: "alex@q.com",
        role: "agent",
      },
      { ...ticket, assigneeId: "usr-3" },
    );

    await waitFor(() => {
      expect(
        screen.getByText("You can only edit tickets assigned to you."),
      ).toBeInTheDocument();
    });
  });

  it("lets an agent claim an unassigned ticket", async () => {
    renderQuickActions(
      {
        id: "usr-2",
        name: "Alex",
        email: "alex@q.com",
        role: "agent",
      },
      { ...ticket, assigneeId: undefined },
    );

    await waitFor(() => {
      const assignee = screen.getByLabelText("Assignee") as HTMLSelectElement;
      expect(assignee).not.toBeDisabled();
      expect(
        screen.getByRole("option", { name: /claim/i }),
      ).toBeInTheDocument();
    });
  });

  it("hides the critical option for agents and shows the manager hint", async () => {
    renderQuickActions(
      {
        id: "usr-3",
        name: "Elena",
        email: "elena@q.com",
        role: "agent",
      },
      { ...ticket, assigneeId: "usr-3" },
    );

    await waitFor(() => {
      const priority = screen.getByLabelText("Priority") as HTMLSelectElement;
      expect(priority).not.toBeDisabled();
      const options = Array.from(priority.options).map((o) => o.value);
      expect(options).not.toContain("critical");
      expect(
        screen.getByText("Only managers can set Critical priority."),
      ).toBeInTheDocument();
    });
  });

  it("opens a confirmation dialog when closing a ticket and cancels without committing", async () => {
    renderQuickActions({
      id: "usr-1",
      name: "Sarah",
      email: "sarah@q.com",
      role: "manager",
    });

    await waitFor(() => {
      const status = screen.getByLabelText("Status") as HTMLSelectElement;
      fireEvent.change(status, { target: { value: "closed" } });
    });

    const dialog = screen.getByRole("dialog", {
      name: "Close this ticket?",
    });
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close Ticket" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the confirmation dialog when the close is confirmed", async () => {
    renderQuickActions({
      id: "usr-1",
      name: "Sarah",
      email: "sarah@q.com",
      role: "manager",
    });

    await waitFor(() => {
      const status = screen.getByLabelText("Status") as HTMLSelectElement;
      fireEvent.change(status, { target: { value: "closed" } });
    });

    fireEvent.click(screen.getByRole("button", { name: "Close Ticket" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
