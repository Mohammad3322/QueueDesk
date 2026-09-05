import type { Ticket } from "../types";
import { isTicketOverdue } from "./ticketHelpers";

export interface DashboardMetrics {
  total: number;
  open: number;
  critical: number;
  overdue: number;
  resolvedToday: number;
  avgResolutionMs: number | null;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byAssignee: { assigneeId: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

export function computeMetrics(tickets: Ticket[]): DashboardMetrics {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const open = tickets.filter(
    (t) => t.status === "open" || t.status === "in-progress",
  ).length;
  const critical = tickets.filter((t) => t.priority === "critical").length;
  const overdue = tickets.filter(
    (t) =>
      isTicketOverdue(t) && t.status !== "resolved" && t.status !== "closed",
  ).length;
  const resolvedToday = tickets.filter(
    (t) =>
      (t.status === "resolved" || t.status === "closed") &&
      t.resolvedAt &&
      new Date(t.resolvedAt).getTime() >= dayStart.getTime(),
  ).length;

  // Average resolution time (ms) for tickets that have been resolved
  const resolvedTickets = tickets.filter(
    (t) => (t.status === "resolved" || t.status === "closed") && t.resolvedAt,
  );
  const resolutionDurations = resolvedTickets.map(
    (t) =>
      new Date(t.resolvedAt as string).getTime() -
      new Date(t.createdAt).getTime(),
  );
  const avgResolutionMs =
    resolutionDurations.length > 0
      ? resolutionDurations.reduce((a, b) => a + b, 0) /
        resolutionDurations.length
      : null;

  // Group by status
  const statusMap = new Map<string, number>();
  tickets.forEach((t) =>
    statusMap.set(t.status, (statusMap.get(t.status) || 0) + 1),
  );

  // Group by priority
  const priorityMap = new Map<string, number>();
  tickets.forEach((t) =>
    priorityMap.set(t.priority, (priorityMap.get(t.priority) || 0) + 1),
  );

  // Group by assignee
  const assigneeMap = new Map<string, number>();
  tickets.forEach((t) => {
    const key = t.assigneeId || "unassigned";
    assigneeMap.set(key, (assigneeMap.get(key) || 0) + 1);
  });

  // Group by category
  const categoryMap = new Map<string, number>();
  tickets.forEach((t) =>
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + 1),
  );

  return {
    total: tickets.length,
    open,
    critical,
    overdue,
    resolvedToday,
    avgResolutionMs,
    byStatus: [...statusMap.entries()].map(([status, count]) => ({
      status,
      count,
    })),
    byPriority: [...priorityMap.entries()].map(([priority, count]) => ({
      priority,
      count,
    })),
    byAssignee: [...assigneeMap.entries()].map(([assigneeId, count]) => ({
      assigneeId,
      count,
    })),
    byCategory: [...categoryMap.entries()].map(([category, count]) => ({
      category,
      count,
    })),
  };
}

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
