import type {
  NotificationType,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "../types";

// Application routes
// Single source for route paths so layouts and links stay in sync.
export const APP_ROUTES = {
  dashboard: "/",
  tickets: "/tickets",
  newTicket: "/tickets/new",
  notifications: "/notifications",
  account: "/account",
  analytics: "/analytics",
  users: "/users",
  customers: "/customers",
} as const;

//Ticket Statuses
export const TICKET_STATUSES: readonly TicketStatus[] = [
  "open",
  "in-progress",
  "waiting-on-customer",
  "resolved",
  "closed",
];

export const ACTIVE_TICKET_STATUSES: readonly TicketStatus[] = [
  "open",
  "in-progress",
  "waiting-on-customer",
];

export const RESOLVED_TICKET_STATUSES: readonly TicketStatus[] = [
  "resolved",
  "closed",
];



export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  "waiting-on-customer": "Waiting on Customer",
  resolved: "Resolved",
  closed: "Closed",
};

//Ticket Priorities
export const TICKET_PRIORITIES: readonly TicketPriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export const PRIORITY_WEIGHTS: Record<TicketPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const TICKET_CATEGORIES: readonly string[] = [
  "Account Access",
  "Billing",
  "Bug Report",
  "Feature Question",
  "Integration",
  "Performance",
  "Security",
  "General Question",
];

// Create-ticket form limits
export const SUBJECT_MIN_LENGTH = 5;
export const SUBJECT_MAX_LENGTH = 120;
export const DESCRIPTION_MIN_LENGTH = 20;
export const DEFAULT_TICKET_CATEGORY = "Bug Report";
export const DEFAULT_TICKET_PRIORITY: TicketPriority = "medium";
export const DEFAULT_TAG = "support";

//  SLA
export const SLA_DUE_SOON_MINUTES = 60;

export const SLA_STATUS_LABELS = {
  "on-track": "On Track",
  "due-soon": "Due Soon",
  overdue: "Overdue",
  completed: "Completed",
} as const;

// Roles
export const ROLE_LABELS: Record<UserRole, string> = {
  agent: "Agent",
  manager: "Manager",
};

// Notifications
export const NOTIFICATION_TYPES = {
  TICKET_ASSIGNED: "ticket-assigned",
  NEW_TICKET: "new-ticket",
  DAILY_SUMMARY: "daily-summary",
} as const;

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  "ticket-assigned": "Assignment",
  "new-ticket": "New Request",
  "daily-summary": "Daily Summary",
};
