import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getSLAStatus,
  isTicketOverdue,
  PRIORITY_WEIGHTS,
} from "./ticketHelpers";
import type { Ticket } from "../types";

const baseTicket: Ticket = {
  id: "TICK-1001",
  subject: "Test ticket",
  description: "Description",
  customerId: "cust-1",
  status: "open",
  priority: "medium",
  category: "General",
  tags: [],
  createdAt: new Date(2026, 0, 1).toISOString(),
  updatedAt: new Date(2026, 0, 1).toISOString(),
  dueAt: "",
};

describe("getSLAStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0)); // noon
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const makeTicket = (dueAt: Date, status: Ticket["status"] = "open") => ({
    ...baseTicket,
    dueAt: dueAt.toISOString(),
    status,
  });

  it("returns on-track when more than 60 minutes remain", () => {
    const ticket = makeTicket(new Date(2026, 0, 1, 14, 0, 0));
    expect(getSLAStatus(ticket)).toBe("on-track");
  });

  it("returns due-soon when exactly 60 minutes remain (boundary)", () => {
    const ticket = makeTicket(new Date(2026, 0, 1, 13, 0, 0));
    expect(getSLAStatus(ticket)).toBe("due-soon");
  });

  it("returns due-soon when 0-60 minutes remain", () => {
    const ticket = makeTicket(new Date(2026, 0, 1, 12, 30, 0));
    expect(getSLAStatus(ticket)).toBe("due-soon");
  });

  it("returns overdue the moment the deadline passes", () => {
    const ticket = makeTicket(new Date(2026, 0, 1, 11, 59, 59));
    expect(getSLAStatus(ticket)).toBe("overdue");
  });

  it("returns overdue for past deadlines", () => {
    const ticket = makeTicket(new Date(2026, 0, 1, 8, 0, 0));
    expect(getSLAStatus(ticket)).toBe("overdue");
  });

  it("returns completed for resolved tickets regardless of deadline", () => {
    const late = makeTicket(new Date(2026, 0, 1, 2, 0, 0), "resolved");
    expect(getSLAStatus(late)).toBe("completed");
  });

  it("returns completed for closed tickets regardless of deadline", () => {
    const late = makeTicket(new Date(2026, 0, 1, 2, 0, 0), "closed");
    expect(getSLAStatus(late)).toBe("completed");
  });
});

describe("isTicketOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when the deadline has passed", () => {
    const ticket = {
      ...baseTicket,
      dueAt: new Date(2026, 0, 1, 10).toISOString(),
    };
    expect(isTicketOverdue(ticket)).toBe(true);
  });

  it("returns false when the deadline is in the future", () => {
    const ticket = {
      ...baseTicket,
      dueAt: new Date(2026, 0, 1, 14).toISOString(),
    };
    expect(isTicketOverdue(ticket)).toBe(false);
  });

  it("returns false for resolved overdue tickets (SLA no longer accumulates)", () => {
    const ticket: Ticket = {
      ...baseTicket,
      dueAt: new Date(2026, 0, 1, 10).toISOString(),
      status: "resolved",
      resolvedAt: new Date(2026, 0, 1, 12).toISOString(),
    };
    expect(isTicketOverdue(ticket)).toBe(false);
  });
});

describe("PRIORITY_WEIGHTS", () => {
  it("orders priorities by business weight: critical > high > medium > low", () => {
    expect(PRIORITY_WEIGHTS.critical).toBeGreaterThan(PRIORITY_WEIGHTS.high);
    expect(PRIORITY_WEIGHTS.high).toBeGreaterThan(PRIORITY_WEIGHTS.medium);
    expect(PRIORITY_WEIGHTS.medium).toBeGreaterThan(PRIORITY_WEIGHTS.low);
  });
});
