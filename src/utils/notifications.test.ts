import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Ticket, User } from "../types";
import {
  buildDailySummaryNotification,
  buildNewTicketNotification,
  buildTicketAssignedNotification,
  computeDailySummaryStats,
  formatRelativeTime,
  getLocalDateKey,
  isSameLocalDay,
} from "./notifications";

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: "TICK-1001",
  subject: "Cannot log in",
  description: "Long enough description for the ticket.",
  customerId: "cust-1",
  status: "open",
  priority: "medium",
  category: "Account Access",
  tags: [],
  createdAt: new Date(2026, 0, 1, 9, 0, 0).toISOString(),
  updatedAt: new Date(2026, 0, 1, 9, 0, 0).toISOString(),
  dueAt: new Date(2026, 0, 1, 17, 0, 0).toISOString(),
  ...overrides,
});

const agent: User = {
  id: "usr-2",
  name: "Alex Mercer",
  email: "alex@queuedesk.com",
  role: "agent",
};

const manager: User = {
  id: "usr-1",
  name: "Sarah Connor",
  email: "sarah@queuedesk.com",
  role: "manager",
};

describe("date helpers", () => {
  it("formats a local date key for grouping by day", () => {
    expect(getLocalDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("detects whether two dates fall on the same local day", () => {
    expect(
      isSameLocalDay(new Date(2026, 5, 3, 23, 59), new Date(2026, 5, 3, 0, 30)),
    ).toBe(true);
    expect(
      isSameLocalDay(new Date(2026, 5, 3, 12, 0), new Date(2026, 5, 4, 12, 0)),
    ).toBe(false);
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const at = (minutesAgo: number) =>
    new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

  it("returns 'just now' for timestamps under a minute old", () => {
    expect(formatRelativeTime(at(0))).toBe("just now");
  });

  it("returns minutes for timestamps under an hour old", () => {
    expect(formatRelativeTime(at(5))).toBe("5m ago");
  });

  it("returns hours for timestamps under a day old", () => {
    expect(formatRelativeTime(at(3 * 60))).toBe("3h ago");
  });

  it("returns days for older timestamps", () => {
    expect(formatRelativeTime(at(2 * 24 * 60))).toBe("2d ago");
  });
});

describe("buildTicketAssignedNotification", () => {
  it("notifies the assignee about the ticket", () => {
    const notification = buildTicketAssignedNotification({
      id: "ntf-assign-test",
      ticket: makeTicket(),
      assignee: agent,
      actorName: "Sarah Connor",
      createdAt: new Date(2026, 0, 1, 12, 0, 0).toISOString(),
    });

    expect(notification.type).toBe("ticket-assigned");
    expect(notification.recipientId).toBe("usr-2");
    expect(notification.ticketId).toBe("TICK-1001");
    expect(notification.read).toBe(false);
    expect(notification.title).toBe("New ticket assigned to you");
    expect(notification.message).toContain("TICK-1001");
    expect(notification.message).toContain("Cannot log in");
    expect(notification.message).toContain("Sarah Connor");
  });
});

describe("buildNewTicketNotification", () => {
  it("notifies the manager when a customer request becomes a ticket", () => {
    const notification = buildNewTicketNotification({
      id: "ntf-new-test",
      ticket: makeTicket({ id: "TICK-1100" }),
      manager,
      customerName: "Acme Corporation",
      createdAt: new Date(2026, 0, 1, 12, 0, 0).toISOString(),
    });

    expect(notification.type).toBe("new-ticket");
    expect(notification.recipientId).toBe("usr-1");
    expect(notification.title).toBe("New customer request");
    expect(notification.message).toContain("Acme Corporation");
    expect(notification.message).toContain("Cannot log in");
    expect(notification.message).toContain("TICK-1100");
  });
});

describe("computeDailySummaryStats", () => {
  const now = new Date(2026, 0, 5, 12, 0, 0);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const tickets = [
    // Resolved earlier today →
    makeTicket({
      id: "TICK-A",
      status: "resolved",
      resolvedAt: new Date(2026, 0, 5, 10, 0, 0).toISOString(),
    }),
    // Closed today →
    makeTicket({
      id: "TICK-B",
      status: "closed",
      resolvedAt: new Date(2026, 0, 5, 11, 0, 0).toISOString(),
    }),
    // Created today, active, overdue →
    makeTicket({
      id: "TICK-C",
      createdAt: new Date(2026, 0, 5, 9, 0, 0).toISOString(),
      dueAt: new Date(2026, 0, 5, 8, 0, 0).toISOString(),
    }),
    // Active, not overdue, critical →
    makeTicket({
      id: "TICK-D",
      priority: "critical",
      dueAt: new Date(2026, 0, 6, 8, 0, 0).toISOString(),
    }),
    // Resolved on another day → excluded from today's counts
    makeTicket({
      id: "TICK-E",
      status: "resolved",
      resolvedAt: new Date(2026, 0, 2, 10, 0, 0).toISOString(),
    }),
    // Waiting on customer → still active but not overdue
    makeTicket({
      id: "TICK-F",
      status: "waiting-on-customer",
      dueAt: new Date(2026, 0, 6, 8, 0, 0).toISOString(),
    }),
  ];

  it("counts tickets completed, created, active, overdue and critical", () => {
    const stats = computeDailySummaryStats(tickets, now);

    expect(stats.completedToday).toBe(2);
    expect(stats.newToday).toBe(1);
    expect(stats.active).toBe(3);
    expect(stats.overdue).toBe(1);
    expect(stats.criticalOpen).toBe(1);
    expect(stats.avgResolutionMs).not.toBeNull();
  });
});

describe("buildDailySummaryNotification", () => {
  it("builds a daily summary for a manager with the headline KPIs", () => {
    const now = new Date(2026, 0, 5, 18, 0, 0);
    const resolved = makeTicket({
      id: "TICK-A",
      status: "resolved",
      createdAt: new Date(2026, 0, 5, 6, 0, 0).toISOString(),
      resolvedAt: new Date(2026, 0, 5, 10, 0, 0).toISOString(),
    });

    const notification = buildDailySummaryNotification({
      id: "ntf-daily-test",
      manager,
      tickets: [resolved, makeTicket({ id: "TICK-B" })],
      now,
      createdAt: now.toISOString(),
    });

    expect(notification.type).toBe("daily-summary");
    expect(notification.recipientId).toBe("usr-1");
    expect(notification.title).toMatch(/^Daily Summary —/);
    expect(notification.message).toContain("1 completed");
    expect(notification.message).toContain("Avg resolution");
  });
});
