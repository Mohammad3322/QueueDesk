import type { Ticket, TicketPriority } from "../types";

// أوزان ترتيب الأولوية حسب المتطلبات (Critical > High > Medium > Low)
export const PRIORITY_WEIGHTS: Record<TicketPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

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
  if (diffMinutes <= 60) return "due-soon";
  return "on-track";
};
