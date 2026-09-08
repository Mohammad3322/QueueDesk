import React from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { useUser } from "../../hooks/useUser";
import { useTickets } from "../../hooks/useTickets";
import { useCustomers } from "../../hooks/useCustomers";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  APP_ROUTES,
  NOTIFICATION_TYPE_LABELS,
} from "../../constants";
import { formatRelativeTime } from "../../utils/notifications";
import type {
  AppNotification,
  NotificationType,
} from "../../types";
import BackButton from "../../components/ui/BackButton";
import { GoButton } from "../../components/ui/GoButton";

const NOTIFICATION_BADGE_VARIANTS: Record<
  NotificationType,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  "ticket-assigned": "info",
  "new-ticket": "warning",
  "daily-summary": "success",
};

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useUser();
  const { notifications, markAsRead, markAllAsRead, notificationsFor, unreadCountFor } =
    useNotifications();
  const { getTicketById } = useTickets();
  const { customers, getCustomerById } = useCustomers();

  const myNotifications = notificationsFor(currentUser.id);
  const unreadCount = unreadCountFor(currentUser.id);

  // Resolve the requesting customer for a "new customer request" notification.
  // Prefer the stored customerId; fall back to the ticket, then to the customer
  // name embedded in the message (old notifications predate customerId and may
  // reference tickets that were replaced by the mock dataset on reload).
  const customerForNotification = (
    notification: AppNotification,
  ) => {
    const byId =
      notification.customerId ??
      (notification.ticketId
        ? getTicketById(notification.ticketId)?.customerId
        : undefined);
    const found = byId ? getCustomerById(byId) : undefined;
    if (found) return found;

    const name = notification.message.split(" submitted a new request: ")[0];
    return name ? customers.find((c) => c.name === name) : undefined;
  };

  // A "new customer request" notification opens the Add Ticket page with the
  // requesting customer pre-selected; other ticket notifications open the ticket.
  const targetHrefFor = (notification: AppNotification): string | undefined => {
    if (notification.type === "new-ticket") {
      const customer = customerForNotification(notification);
      return customer
        ? `${APP_ROUTES.newTicket}?customer=${encodeURIComponent(customer.id)}`
        : APP_ROUTES.newTicket;
    }
    return notification.ticketId
      ? `/tickets/${notification.ticketId}`
      : undefined;
  };

  return (
    <div className="flex flex-col gap-10">
      <Link to="/">
        <BackButton />
      </Link>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You are all caught up"}
            </p>
          </div>
          {myNotifications.length > 0 && (
            <Button variant="primary" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {myNotifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="Notifications about assigned tickets, new customer requests, and daily summaries will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {myNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                href={targetHrefFor(notification)}
                onOpen={() => markAsRead(notification.id)}
              />
            ))}
          </ul>
        )}

        {notifications.length > 0 && (
          <p className="text-xs text-gray-400">
            Viewing {myNotifications.length} notification
            {myNotifications.length === 1 ? "" : "s"} for {currentUser.name}.
          </p>
        )}
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: AppNotification;
  href?: string;
  onOpen: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  href,
  onOpen,
}) => {
  const inner = (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`w-2 h-2 rounded-full shrink-0 ${
          notification.read ? "bg-transparent" : "bg-primary"
        }`}
      />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-sm font-semibold text-gray-900 ${
              notification.read ? "" : "pr-1"
            }`}
          >
            {notification.title}
          </span>
          <Badge variant={NOTIFICATION_BADGE_VARIANTS[notification.type]}>
            {NOTIFICATION_TYPE_LABELS[notification.type]}
          </Badge>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{notification.message}</p>
      </div>
      {href && (
        <div className="shrink-0">
          <GoButton child="Go" />
        </div>
      )}
    </div>
  );

  const content = href ? (
    <Link
      to={href}
      onClick={onOpen}
      className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      {inner}
    </Link>
  ) : (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50">
      {inner}
    </div>
  );

  return <li>{content}</li>;
};
