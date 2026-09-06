import type { Ticket } from "../types";
import { SLA_DUE_SOON_MINUTES } from "../constants";

// Re-exported so existing importers (pipeline, tests) keep working from one place.
export { PRIORITY_WEIGHTS } from "../constants";

export const isTicketOverdue = (ticket: Ticket): boolean => {
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return false;
  }
  return new Date(ticket.dueAt).getTime() < Date.now();
};

export const getSLAStatus = (
  ticket: Ticket,
): "on-track" | "due-soon" | "overdue" | "completed" => {
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return "completed";
  }
  const diffMinutes =
    (new Date(ticket.dueAt).getTime() - Date.now()) / (1000 * 60);

  if (diffMinutes < 0) return "overdue";
  if (diffMinutes <= SLA_DUE_SOON_MINUTES) return "due-soon";
  return "on-track";
};
