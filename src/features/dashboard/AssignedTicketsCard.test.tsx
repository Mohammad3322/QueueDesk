import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { AssignedTicketsCard } from "./AssignedTicketsCard";
import { UserProvider } from "../users/UserContext";
import { TicketProvider } from "../tickets/TicketContext";
import type { Ticket } from "../../types";

vi.mock("../../services/api/ticketService", () => ({
  ticketService: {
    getTickets: vi.fn(),
  },
}));

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: "TICK-1001",
  subject: "Cannot log in",
  description: "Description",
  customerId: "cust-1",
  status: "open",
  priority: "medium",
  category: "General",
  tags: [],
  createdAt: new Date(2026, 0, 1).toISOString(),
  updatedAt: new Date(2026, 0, 1).toISOString(),
  dueAt: new Date(2026, 1, 1).toISOString(),
  ...overrides,
});

async function renderWithTickets(tickets: Ticket[]) {
  const { ticketService } = await import("../../services/api/ticketService");
  vi.mocked(ticketService.getTickets).mockResolvedValue(tickets);

  return render(
    <MemoryRouter>
      <UserProvider>
        <TicketProvider>
          <AssignedTicketsCard />
        </TicketProvider>
      </UserProvider>
    </MemoryRouter>,
  );
}

describe("AssignedTicketsCard", () => {
  it("shows only active tickets assigned to the current user", async () => {
    const tickets = [
      makeTicket({ id: "TICK-1", assigneeId: "usr-1", status: "open" }),
      makeTicket({
        id: "TICK-2",
        assigneeId: "usr-1",
        status: "resolved",
      }),
      makeTicket({ id: "TICK-3", assigneeId: "usr-2", status: "open" }),
    ];
    await renderWithTickets(tickets);

    expect(
      await screen.findByText("My Tickets — 1 needs attention"),
    ).toBeInTheDocument();
    expect(screen.getByText("TICK-1")).toBeInTheDocument();
    // Resolved and other-agents' tickets are excluded.
    expect(screen.queryByText("TICK-2")).not.toBeInTheDocument();
    expect(screen.queryByText("TICK-3")).not.toBeInTheDocument();
  });

  it("sorts attention tickets by priority weight, then SLA deadline", async () => {
    const tickets = [
      makeTicket({
        id: "TICK-HIGH",
        assigneeId: "usr-1",
        status: "open",
        priority: "high",
        dueAt: new Date(2026, 1, 1).toISOString(),
      }),
      makeTicket({
        id: "TICK-CRITICAL",
        assigneeId: "usr-1",
        status: "open",
        priority: "critical",
        dueAt: new Date(2026, 1, 2).toISOString(),
      }),
    ];
    await renderWithTickets(tickets);

    await screen.findByText("TICK-HIGH");
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("TICK-CRITICAL");
    expect(items[1]).toHaveTextContent("TICK-HIGH");
  });

  it("marks overdue attention tickets with an Overdue badge", async () => {
    const tickets = [
      makeTicket({
        id: "TICK-LATE",
        assigneeId: "usr-1",
        status: "in-progress",
        dueAt: new Date(2026, 0, 2).toISOString(),
      }),
    ];
    await renderWithTickets(tickets);

    expect(await screen.findByText("Overdue")).toBeInTheDocument();
  });

  it("shows an empty state when nothing needs attention", async () => {
    await renderWithTickets([]);

    expect(
      await screen.findByText(/You have no open tickets assigned to you/),
    ).toBeInTheDocument();
  });
});
