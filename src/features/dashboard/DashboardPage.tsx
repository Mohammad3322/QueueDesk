import React from "react";
import { Link } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useUser } from "../../hooks/useUser";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { computeMetrics, formatDuration } from "../../utils/metrics";
import { isTicketOverdue, getSLAStatus } from "../../utils/ticketHelpers";

export const DashboardPage: React.FC = () => {
  const { tickets, loadState, errorMessage, refresh } = useTickets();
  const { currentUser } = useUser();

  const metrics = computeMetrics(tickets);

  const criticalOverdueTickets = tickets
    .filter((t) => isTicketOverdue(t) || getSLAStatus(t) === "due-soon")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          QueueDesk Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Welcome back, {currentUser.name} ({currentUser.role.toUpperCase()})
        </p>
      </div>

      {loadState === "loading" && tickets.length === 0 ? (
        <Spinner
          label="Loading dashboard..."
          className="bg-white border border-gray-200 rounded-xl"
        />
      ) : loadState === "error" && tickets.length === 0 ? (
        <EmptyState
          title="Could not load dashboard data"
          description={errorMessage || "Something went wrong. Try again."}
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : (
        <>
          {/* 1. Metric Cards (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Total Tickets
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {metrics.total}
              </p>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Active / Open
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {metrics.open}
              </p>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                SLA Overdue
              </p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {metrics.overdue}
              </p>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Resolved Today
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {metrics.resolvedToday}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg resolution:{" "}
                {metrics.avgResolutionMs !== null
                  ? formatDuration(metrics.avgResolutionMs)
                  : "—"}
              </p>
            </Card>
          </div>

          {/* 2. Status Breakdown & Critical Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
              title="Tickets Status Breakdown"
              className="lg:col-span-1 space-y-4"
            >
              <div className="space-y-3">
                {[
                  {
                    label: "Open",
                    value:
                      metrics.byStatus.find((d) => d.status === "open")
                        ?.count ?? 0,
                    color: "bg-blue-600",
                  },
                  {
                    label: "In Progress",
                    value:
                      metrics.byStatus.find((d) => d.status === "in-progress")
                        ?.count ?? 0,
                    color: "bg-yellow-500",
                  },
                  {
                    label: "Waiting on Customer",
                    value:
                      metrics.byStatus.find(
                        (d) => d.status === "waiting-on-customer",
                      )?.count ?? 0,
                    color: "bg-purple-500",
                  },
                  {
                    label: "Resolved / Closed",
                    value: metrics.byStatus
                      .filter(
                        (d) => d.status === "resolved" || d.status === "closed",
                      )
                      .reduce((a, d) => a + d.count, 0),
                    color: "bg-green-500",
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{row.label}</span>
                      <span className="font-semibold text-gray-900">
                        {row.value}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div
                        className={`${row.color} h-2 rounded-full`}
                        style={{
                          width: `${(row.value / (metrics.total || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/analytics"
                className="inline-block text-xs font-medium text-blue-600 hover:underline"
              >
                View full analytics →
              </Link>
            </Card>

            <Card
              title="Attention Required (SLA Risk)"
              className="lg:col-span-2"
            >
              {criticalOverdueTickets.length > 0 ? (
                <ul className="space-y-3">
                  {criticalOverdueTickets.map((ticket) => {
                    const isOverdue = isTicketOverdue(ticket);
                    return (
                      <li
                        key={ticket.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/tickets/${ticket.id}`}
                              className="font-mono text-xs font-bold text-blue-600 hover:underline"
                            >
                              {ticket.id}
                            </Link>
                            <span className="text-sm font-semibold text-gray-900">
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

                        <div className="flex items-center gap-2">
                          {isOverdue ? (
                            <Badge variant="danger">Overdue</Badge>
                          ) : (
                            <Badge variant="warning">Due Soon</Badge>
                          )}
                          <Link
                            to={`/tickets/${ticket.id}`}
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
                  All active tickets are within SLA boundaries. Good job!
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
