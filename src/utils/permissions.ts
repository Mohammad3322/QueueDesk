import type { User, Ticket } from "../types";

export const canAssignTicket = (user: User | null): boolean => {
  return user?.role === "manager";
};

export const canEditTicket = (user: User | null, ticket: Ticket): boolean => {
  if (!user) return false;
  if (user.role === "manager") return true;
  return ticket.assigneeId === user.id;
};

export const canViewAnalytics = (user: User | null): boolean => {
  return user?.role === "manager";
};

export const canChangeCriticalPriority = (user: User | null): boolean => {
  return user?.role === "manager";
};