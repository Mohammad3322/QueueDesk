import React from "react";
import { Link } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useUser } from "../../hooks/useUser";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  ACTIVE_TICKET_STATUSES,
  APP_ROUTES,
  PRIORITY_WEIGHTS,
} from "../../constants";
import { isTicketOverdue, getSLAStatus } from "../../utils/ticketHelpers";
import type { Ticket } from "../../types";

/**
 * Tickets assigned to the current user that still need their attention
 * (anything not resolved or closed). Sorted by priority weight, then by SLA
 * deadline so urgent work surfaces first.
 */
const myAttentionTickets = (tickets: Ticket[], userId: string): Ticket[] => {
  return tickets
    .filter(
      (t) =>
        t.assigneeId === userId && ACTIVE_TICKET_STATUSES.includes(t.status),
    )
    .sort(
      (a, b) =>
        PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority] ||
        new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );
};

export const AssignedTicketsCard: React.FC = () => {
  const { tickets } = useTickets();
  const { currentUser } = useUser();

  const assigned = myAttentionTickets(tickets, currentUser.id);
  const shown = assigned.slice(0, 5);

  return (
    <Card
      title={`My Tickets — ${assigned.length} need${assigned.length === 1 ? "s" : ""} attention`}
      className="space-y-4"
    >
      {shown.length > 0 ? (
        <ul className="space-y-3">
          {shown.map((ticket) => {
            const isOverdue = isTicketOverdue(ticket);
            const sla = getSLAStatus(ticket);
            return (
              <li
                key={ticket.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`${APP_ROUTES.tickets}/${ticket.id}`}
                      className="font-mono text-xs font-bold text-blue-600 hover:underline"
                    >
                      {ticket.id}
                    </Link>
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {ticket.subject}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Priority:{" "}
                    <span className="capitalize font-medium">
                      {ticket.priority}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOverdue ? (
                    <Badge variant="danger">Overdue</Badge>
                  ) : sla === "due-soon" ? (
                    <Badge variant="warning">Due Soon</Badge>
                  ) : null}
                  <Link
                    to={`${APP_ROUTES.tickets}/${ticket.id}`}
                    className="text-xs font-medium text-blue-600 hover:underline ml-2"
                  >
                    View
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 py-4 text-center">
          You have no open tickets assigned to you. Claim an unassigned ticket
          or wait for a new assignment.
        </p>
      )}
    </Card>
  );
};
