import React from "react";
import { Link } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useUser } from "../../hooks/useUser";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { isTicketOverdue, getSLAStatus } from "../../utils/ticketHelpers";

export const DashboardPage: React.FC = () => {
  const { tickets } = useTickets();
  const { currentUser } = useUser();

  // حساب المؤشرات الرئيسية (KPIs)
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "in-progress",
  ).length;
  const overdueTickets = tickets.filter((t) => isTicketOverdue(t)).length;
  const resolvedTickets = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;

  // توزيع الحالات
  const statusCounts = {
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    waiting: tickets.filter((t) => t.status === "waiting-on-customer").length,
    resolved: resolvedTickets,
  };

  // أزمة التذاكر العاجلة والمتأخرة
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

      {/* 1. Metric Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Total Tickets
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalTickets}
          </p>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Active / Open
          </p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {openTickets}
          </p>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            SLA Overdue
          </p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {overdueTickets}
          </p>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Resolved
          </p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {resolvedTickets}
          </p>
        </Card>
      </div>

      {/* 2. Status Breakdown & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ملخص الحالات */}
        <Card
          title="Tickets Status Breakdown"
          className="lg:col-span-1 space-y-4"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Open</span>
              <span className="font-semibold text-gray-900">
                {statusCounts.open}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(statusCounts.open / (totalTickets || 1)) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-gray-900">
                {statusCounts.inProgress}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{
                  width: `${(statusCounts.inProgress / (totalTickets || 1)) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Waiting on Customer</span>
              <span className="font-semibold text-gray-900">
                {statusCounts.waiting}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{
                  width: `${(statusCounts.waiting / (totalTickets || 1)) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Resolved / Closed</span>
              <span className="font-semibold text-gray-900">
                {statusCounts.resolved}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(statusCounts.resolved / (totalTickets || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </Card>

        {/* التنبيهات العاجلة للـ SLA */}
        <Card title="Attention Required (SLA Risk)" className="lg:col-span-2">
          {criticalOverdueTickets.length > 0 ? (
            <div className="space-y-3">
              {criticalOverdueTickets.map((ticket) => {
                const isOverdue = isTicketOverdue(ticket);
                return (
                  <div
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
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center">
              All active tickets are within SLA boundaries. Good job!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
