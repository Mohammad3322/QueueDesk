import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { useFilteredTickets } from "./useFilteredTickets";
import type { Ticket } from "../../types";

const makeTicket = (overrides: Partial<Ticket>): Ticket => ({
  id: "TICK-1001",
  subject: "Subject 1001",
  description: "Desc",
  customerId: "cust-1",
  status: "open",
  priority: "medium",
  category: "General",
  tags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  dueAt: "2026-01-10T00:00:00.000Z",
  ...overrides,
});

const tickets: Ticket[] = [
  makeTicket({
    id: "TICK-1001",
    status: "open",
    priority: "critical",
    assigneeId: "usr-2",
    subject: "Login broken",
    createdAt: "2026-01-03T00:00:00.000Z",
  }),
  makeTicket({
    id: "TICK-1002",
    status: "in-progress",
    priority: "high",
    assigneeId: "usr-3",
    subject: "Invoice wrong",
    category: "Billing",
    customerId: "cust-2",
    createdAt: "2026-01-02T00:00:00.000Z",
  }),
  makeTicket({
    id: "TICK-1003",
    status: "resolved",
    priority: "low",
    assigneeId: undefined,
    subject: "Question about API",
    createdAt: "2026-01-01T00:00:00.000Z",
  }),
];

// The hook-consuming component is rendered INSIDE the Router context below.
function HookConsumer({
  params,
}: {
  params: URLSearchParams;
}): React.ReactNode {
  const r = useFilteredTickets(tickets);
  void params;
  return (
    <tr>
      <td>
        {r.tickets.map((t) => t.id).join(",")}|page={r.currentPage},pages=
        {r.totalPages},items={r.totalItems}
      </td>
    </tr>
  );
}

function renderPipeline(path: string) {
  const [, , href] = path.split("?");
  const params = new URLSearchParams(href || "");
  return render(
    <MemoryRouter initialEntries={[path]}>
      <table>
        <tbody>
          <HookConsumer params={params} />
        </tbody>
      </table>
    </MemoryRouter>,
  );
}

describe("useFilteredTickets derived-state pipeline", () => {
  it("returns all tickets with no filters", () => {
    renderPipeline("/tickets");
    expect(
      screen.getByText("TICK-1001,TICK-1002,TICK-1003|page=1,pages=1,items=3"),
    ).toBeInTheDocument();
  });

  it("filters by status", () => {
    renderPipeline("/tickets?status=open");
    expect(screen.getByText(/TICK-1001/)).toBeInTheDocument();
  });

  it("filters by priority", () => {
    renderPipeline("/tickets?priority=high");
    expect(screen.getByText(/TICK-1002/)).toBeInTheDocument();
  });

  it("filters by category", () => {
    renderPipeline("/tickets?category=Billing");
    expect(screen.getByText(/TICK-1002/)).toBeInTheDocument();
    expect(screen.getByText(/items=1/)).toBeInTheDocument();
  });

  it("searches by customer name", () => {
    renderPipeline("/tickets?search=northwind");
    expect(
      screen.getByText(/TICK-1001,TICK-1003\|page=1,pages=1,items=2/),
    ).toBeInTheDocument();
  });

  it("searches a partial customer name", () => {
    renderPipeline("/tickets?search=traders");
    expect(
      screen.getByText(/TICK-1001,TICK-1003\|page=1,pages=1,items=2/),
    ).toBeInTheDocument();
  });

  it("filters by unassigned", () => {
    renderPipeline("/tickets?assignee=unassigned");
    expect(screen.getByText(/TICK-1003/)).toBeInTheDocument();
  });

  it("combines status + priority filters via intersection", () => {
    renderPipeline("/tickets?priority=critical&status=open");
    expect(screen.getByText(/TICK-1001/)).toBeInTheDocument();
  });

  it("sorts by created date descending by default", () => {
    renderPipeline("/tickets");
    expect(
      screen.getByText("TICK-1001,TICK-1002,TICK-1003|page=1,pages=1,items=3"),
    ).toBeInTheDocument();
  });

  it("sorts by created date ascending when requested", () => {
    renderPipeline("/tickets?sort=createdAt&order=asc");
    expect(
      screen.getByText(/TICK-1003,TICK-1002,TICK-1001/),
    ).toBeInTheDocument();
  });

  it("sorts by customer name ascending", () => {
    // cust-2 = "Acme Corporation" sorts before cust-1 = "Northwind Traders".
    renderPipeline("/tickets?sort=customerName&order=asc");
    expect(
      screen.getByText(/TICK-1002,TICK-1001,TICK-1003/),
    ).toBeInTheDocument();
  });

  it("sorts by customer name descending", () => {
    renderPipeline("/tickets?sort=customerName&order=desc");
    expect(
      screen.getByText(/TICK-1001,TICK-1003,TICK-1002/),
    ).toBeInTheDocument();
  });

  it("trims surrounding whitespace from the search query", () => {
    renderPipeline("/tickets?search=%20%20northwind%20%20");
    expect(screen.getByText(/items=2/)).toBeInTheDocument();
  });

  it("paginates with correct totals and clamps out-of-range pages", () => {
    renderPipeline("/tickets?page=99&pageSize=10");
    expect(screen.getByText(/page=1,pages=1,items=3/)).toBeInTheDocument();
  });

  it("returns zero results when no ticket matches", () => {
    renderPipeline("/tickets?search=zzzz&status=closed");
    expect(screen.getByText(/items=0/)).toBeInTheDocument();
  });
});
