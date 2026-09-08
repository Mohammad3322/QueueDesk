import type { AppNotification, Ticket, User } from "../types";
import {
  ACTIVE_TICKET_STATUSES,
  NOTIFICATION_TYPES,
  RESOLVED_TICKET_STATUSES,
} from "../constants";
import { isTicketOverdue } from "./ticketHelpers";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "2026-01-05" in the local timezone — useful for "per day" grouping. */
export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameLocalDay(a: Date | string, b: Date | string): boolean {
  return getLocalDateKey(new Date(a)) === getLocalDateKey(new Date(b));
}

export function formatRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  return `${Math.floor(diff / DAY)}d ago`;
}

export function isUnread(notification: AppNotification): boolean {
  return !notification.read;
}

const notificationId = (
  type: string,
  ticketId: string,
  recipientId: string,
): string => `ntf-${type}-${ticketId}-${recipientId}-${Date.now()}`;

/**
 * Notification sent to an agent the moment a ticket is (re)assigned to them.
 */
export function buildTicketAssignedNotification(params: {
  id?: string;
  ticket: Ticket;
  assignee: User;
  actorName: string;
  createdAt?: string;
}): AppNotification {
  const { ticket, assignee, actorName } = params;
  return {
    id:
      params.id ??
      notificationId(
        NOTIFICATION_TYPES.TICKET_ASSIGNED,
        ticket.id,
        assignee.id,
      ),
    recipientId: assignee.id,
    type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
    title: "New ticket assigned to you",
    message: `${ticket.id} · ${ticket.subject} was assigned to you by ${actorName}.`,
    ticketId: ticket.id,
    createdAt: params.createdAt ?? new Date().toISOString(),
    read: false,
  };
}

export function buildNewTicketNotification(params: {
  id?: string;
  ticket: Ticket;
  manager: User;
  customerName: string;
  createdAt?: string;
}): AppNotification {
  const { ticket, manager, customerName } = params;
  return {
    id:
      params.id ??
      notificationId(NOTIFICATION_TYPES.NEW_TICKET, ticket.id, manager.id),
    recipientId: manager.id,
    type: NOTIFICATION_TYPES.NEW_TICKET,
    title: "New customer request",
    message: `${customerName} submitted a new request: ${ticket.subject} (${ticket.id}).`,
    ticketId: ticket.id,
    createdAt: params.createdAt ?? new Date().toISOString(),
    read: false,
  };
}

export interface DailySummaryStats {
  completedToday: number;
  newToday: number;
  active: number;
  overdue: number;
  criticalOpen: number;
  avgResolutionMs: number | null;
}

export function computeDailySummaryStats(
  tickets: Ticket[],
  now: Date = new Date(),
): DailySummaryStats {
  const active = tickets.filter((t) =>
    ACTIVE_TICKET_STATUSES.includes(t.status),
  );
  const resolved = tickets.filter((t) =>
    RESOLVED_TICKET_STATUSES.includes(t.status),
  );

  const resolvedDurations = resolved
    .filter((t) => t.resolvedAt)
    .map(
      (t) =>
        new Date(t.resolvedAt as string).getTime() -
        new Date(t.createdAt).getTime(),
    );

  return {
    completedToday: resolved.filter((t) =>
      isSameLocalDay(t.resolvedAt as string, now),
    ).length,
    newToday: tickets.filter((t) => isSameLocalDay(t.createdAt, now)).length,
    active: active.length,
    overdue: active.filter((t) => isTicketOverdue(t)).length,
    criticalOpen: active.filter((t) => t.priority === "critical").length,
    avgResolutionMs:
      resolvedDurations.length > 0
        ? resolvedDurations.reduce((a, b) => a + b, 0) /
          resolvedDurations.length
        : null,
  };
}

/**
 * Notification sent to a manager once a day with the headline support KPIs.
 */
export function buildDailySummaryNotification(params: {
  id?: string;
  manager: User;
  tickets: Ticket[];
  createdAt?: string;
  now?: Date;
}): AppNotification {
  const { manager, tickets } = params;
  const now = params.now ?? new Date();
  const stats = computeDailySummaryStats(tickets, now);
  const dateLabel = now.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const avg =
    stats.avgResolutionMs === null
      ? "—"
      : formatDuration(stats.avgResolutionMs);

  const message = `${stats.completedToday} completed · ${stats.newToday} new · ${stats.active} active · ${stats.overdue} overdue · ${stats.criticalOpen} critical open · Avg resolution ${avg}`;

  return {
    id:
      params.id ??
      `ntf-${NOTIFICATION_TYPES.DAILY_SUMMARY}-${manager.id}-${getLocalDateKey(now)}`,
    recipientId: manager.id,
    type: NOTIFICATION_TYPES.DAILY_SUMMARY,
    title: `Daily Summary — ${dateLabel}`,
    message,
    createdAt: params.createdAt ?? now.toISOString(),
    read: false,
  };
}

/** Compact human-readable duration ("2h 5m", "3d 2h", …). */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
