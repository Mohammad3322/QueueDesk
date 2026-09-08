// User Roles
export type UserRole = "agent" | "manager";

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role: UserRole;
}

// Customer Subscription Plan
export type CustomerPlan = "free" | "starter" | "business" | "enterprise";

// Customer Interface
export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  plan: CustomerPlan;
  createdAt: string;
}

// Ticket States and Priorities
export type TicketStatus =
  | "open"
  | "in-progress"
  | "waiting-on-customer"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "critical";

// Ticket Interface
export interface Ticket {
  id: string;
  subject: string;
  description: string;
  customerId: string;
  assigneeId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  resolvedAt?: string;
}

// Comments
export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

// Activity Log
export type ActivityEventType =
  | "ticket-created"
  | "status-changed"
  | "priority-changed"
  | "assigned"
  | "comment-added"
  | "ticket-resolved";

export interface ActivityEvent {
  id: string;
  ticketId: string;
  type: ActivityEventType;
  actorId: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// Notifications
export type NotificationType =
  | "ticket-assigned"
  | "new-ticket"
  | "daily-summary";

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  ticketId?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationsContextType {
  notifications: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCountFor: (recipientId: string) => number;
  notificationsFor: (recipientId: string) => AppNotification[];
}
