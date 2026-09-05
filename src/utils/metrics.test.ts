import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computeMetrics, formatDuration } from "./metrics";
import type { Ticket } from "../types";

const makeTicket = (overrides: Partial<Ticket>): Ticket => ({
  id: "TICK-1000",
  subject: "Test",
  description: "Desc",
  customerId: "cust-1",
  status: "open",
  priority: "low",
  category: "General",
  tags: [],
  createdAt: new Date(2026, 0, 1, 9, 0).toISOString(),
  updatedAt: new Date(2026, 0, 1, 9, 0).toISOString(),
  dueAt: new Date(2026, 0, 2, 9, 0).toISOString(),
  ...overrides,
});

describe("computeMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns zeros for an empty dataset", () => {
    const m = computeMetrics([]);
    expect(m.total).toBe(0);
    expect(m.open).toBe(0);
    expect(m.overdue).toBe(0);
  });

  it("counts open and in-progress tickets as active", () => {
    const tickets = [
      makeTicket({ status: "open" }),
      makeTicket({ status: "in-progress" }),
      makeTicket({ status: "resolved" }),
    ];
    expect(computeMetrics(tickets).open).toBe(2);
  });

  it("counts critical priority tickets", () => {
    const tickets = [
      makeTicket({ priority: "critical" }),
      makeTicket({ priority: "critical" }),
      makeTicket({ priority: "low" }),
    ];
    expect(computeMetrics(tickets).critical).toBe(2);
  });

  it("counts overdue tickets by derived SLA, ignoring resolved ones", () => {
    const tickets = [
      makeTicket({ dueAt: new Date(2026, 0, 1).toISOString(), status: "open" }),
      makeTicket({
        dueAt: new Date(2026, 0, 1).toISOString(),
        status: "resolved",
      }),
      makeTicket({
        dueAt: new Date(2026, 0, 20).toISOString(),
        status: "open",
      }),
    ];
    expect(computeMetrics(tickets).overdue).toBe(1);
  });

  it("derives status, priority and category distributions", () => {
    const tickets = [
      makeTicket({ status: "open", priority: "high", category: "Billing" }),
      makeTicket({ status: "open", priority: "low", category: "Billing" }),
      makeTicket({ status: "closed", priority: "low", category: "Bug" }),
    ];
    const m = computeMetrics(tickets);
    expect(m.byStatus.find((d) => d.status === "open")?.count).toBe(2);
    expect(m.byPriority.find((d) => d.priority === "high")?.count).toBe(1);
    expect(m.byCategory.find((d) => d.category === "Billing")?.count).toBe(2);
  });

  it("summarizes resolved-today and average resolution duration", () => {
    const tickets = [
      makeTicket({
        status: "resolved",
        createdAt: new Date(2026, 0, 15, 8, 0).toISOString(),
        resolvedAt: new Date(2026, 0, 15, 10, 0).toISOString(),
      }),
      makeTicket({
        status: "closed",
        createdAt: new Date(2026, 0, 15, 8, 30).toISOString(),
        resolvedAt: new Date(2026, 0, 15, 9, 30).toISOString(),
      }),
      makeTicket({ status: "open" }),
    ];
    const m = computeMetrics(tickets);
    expect(m.resolvedToday).toBe(2);
    // avg of 2h and 1h = 1.5h
    expect(m.avgResolutionMs).toBe(90 * 60 * 1000);
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(90 * 60 * 1000)).toBe("1h 30m");
  });

  it("formats minutes only", () => {
    expect(formatDuration(45 * 60 * 1000)).toBe("45m");
  });

  it("formats days for long durations", () => {
    expect(formatDuration(50 * 3600 * 1000)).toBe("2d 2h");
  });
});
