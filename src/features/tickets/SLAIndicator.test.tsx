import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SLAIndicator } from "./SLAIndicator";
import type { Ticket } from "../../types";

vi.mock("../../utils/ticketHelpers", () => ({
  getSLAStatus: vi.fn(),
}));
import { getSLAStatus } from "../../utils/ticketHelpers";

const mockedGetSLAStatus = vi.mocked(getSLAStatus);

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

describe("SLAIndicator", () => {
  beforeEach(() => {
    mockedGetSLAStatus.mockReset();
  });

  it("labels an overdue ticket as Overdue", async () => {
    mockedGetSLAStatus.mockReturnValue("overdue");
    render(<SLAIndicator ticket={ticket} />);
    await waitFor(() => {
      expect(screen.getByText("SLA Overdue")).toBeInTheDocument();
    });
  });

  it("labels a due-soon ticket", async () => {
    mockedGetSLAStatus.mockReturnValue("due-soon");
    render(<SLAIndicator ticket={ticket} />);
    expect(screen.getByText("SLA Due Soon")).toBeInTheDocument();
  });

  it("labels an on-track ticket", async () => {
    mockedGetSLAStatus.mockReturnValue("on-track");
    render(<SLAIndicator ticket={ticket} />);
    expect(screen.getByText("SLA On Track")).toBeInTheDocument();
  });

  it("labels a completed (resolved) ticket", async () => {
    mockedGetSLAStatus.mockReturnValue("completed");
    render(<SLAIndicator ticket={ticket} />);
    expect(screen.getByText("SLA Completed")).toBeInTheDocument();
  });

  it("renders the due date", async () => {
    mockedGetSLAStatus.mockReturnValue("on-track");
    render(<SLAIndicator ticket={ticket} />);
    expect(screen.getByText(/Due Date:/i)).toBeInTheDocument();
  });
});
