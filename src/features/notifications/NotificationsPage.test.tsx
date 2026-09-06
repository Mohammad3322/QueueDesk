import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { NotificationsPage } from "./NotificationsPage";
import { UserProvider } from "../users/UserContext";
import { UsersProvider } from "../users/UsersProvider";
import { TicketProvider } from "../tickets/TicketContext";
import { NotificationsProvider } from "./NotificationsProvider";
import { useUser } from "../../hooks/useUser";
import type { User } from "../../types";

vi.mock("../../services/api/userService", () => ({
  userService: {
    getUsers: vi.fn().mockResolvedValue([
      {
        id: "usr-1",
        name: "Sarah Connor",
        email: "sarah@queuedesk.com",
        role: "manager",
      },
      {
        id: "usr-2",
        name: "Alex Mercer",
        email: "alex@queuedesk.com",
        role: "agent",
      },
      {
        id: "usr-3",
        name: "Elena Fisher",
        email: "elena@queuedesk.com",
        role: "agent",
      },
      {
        id: "usr-4",
        name: "David Miller",
        email: "david@queuedesk.com",
        role: "agent",
      },
    ]),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

vi.mock("../../services/api/ticketService", () => ({
  ticketService: {
    getTickets: vi.fn().mockResolvedValue([]),
    getTicket: vi.fn(),
    createTicket: vi.fn(),
    updateTicket: vi.fn(),
    deleteTicket: vi.fn(),
  },
}));

function ActorSetter({ currentUser }: { currentUser: User }) {
  const { setCurrentUser } = useUser();
  React.useEffect(() => {
    setCurrentUser(currentUser);
  }, [currentUser, setCurrentUser]);
  return null;
}

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

function renderNotificationsPage(currentUser: User = manager) {
  return render(
    <MemoryRouter initialEntries={["/notifications"]}>
      <UserProvider>
        <ActorSetter currentUser={currentUser} />
        <UsersProvider>
          <TicketProvider>
            <NotificationsProvider>
              <Routes>
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/tickets/:ticketId" element={<div>Detail</div>} />
              </Routes>
            </NotificationsProvider>
          </TicketProvider>
        </UsersProvider>
      </UserProvider>
    </MemoryRouter>,
  );
}

describe("NotificationsPage", () => {
  it("shows a daily summary and an unread count for a manager", async () => {
    renderNotificationsPage(manager);

    expect(await screen.findByText(/Daily Summary —/)).toBeInTheDocument();
    expect(screen.getByText("1 unread notification")).toBeInTheDocument();
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    renderNotificationsPage(manager);

    await screen.findByText(/Daily Summary —/);
    await user.click(screen.getByRole("button", { name: "Mark all as read" }));

    await waitFor(() => {
      expect(screen.getByText("You are all caught up")).toBeInTheDocument();
    });
  });

  it("shows an empty state for an agent with no notifications", async () => {
    renderNotificationsPage(agent);

    expect(await screen.findByText("No notifications")).toBeInTheDocument();
  });
});
