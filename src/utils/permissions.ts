import type { User, Ticket } from "../types";

export const canAssignTicket = (user: User): boolean => {
  return user.role === "manager";
};

export const canClaimTicket = (user: User, ticket: Ticket): boolean => {
  return user.role === "agent" && !ticket.assigneeId;
};

export const canChangePriority = (user: User, newPriority: string): boolean => {
  if (newPriority === "critical") {
    return user.role === "manager";
  }
  return true;
};

export const canDeleteTickets = (user: User): boolean => {
  return user.role === "manager";
};

export const canEditTicket = (user: User, ticket: Ticket): boolean => {
  if (user.role === "manager") return true;
  // Agents can work on their own tickets or claim unassigned ones.
  return canClaimTicket(user, ticket) || ticket.assigneeId === user.id;
};

export const canViewAnalytics = (user: User): boolean => {
  return user.role === "manager";
};

export const canManageUsers = (user: User): boolean => {
  return user.role === "manager";
};