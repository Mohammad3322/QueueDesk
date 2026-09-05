import React from "react";
import { Link } from "react-router-dom";
import {
  MOCK_TICKETS,
  MOCK_CUSTOMERS,
  MOCK_AGENTS,
} from "../../mocks/generator";
import { useFilteredTickets } from "./useFilteredTickets";
import { TicketFilters } from "./TicketFilters";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { getSLAStatus } from "../../utils/ticketHelpers";

export const TicketsPage: React.FC = () => {
  const { tickets, totalItems, totalPages, currentPage, pageSize } =
    useFilteredTickets(MOCK_TICKETS);

  const getCustomerName = (customerId: string) => {
    return (
      MOCK_CUSTOMERS.find((c) => c.id === customerId)?.name ||
      "Unknown Customer"
    );
  };

  const getAssigneeName = (assigneeId?: string) => {
    if (!assigneeId) return "Unassigned";
    return (
      MOCK_AGENTS.find((a) => a.id === assigneeId)?.name || "Unknown Agent"
    );
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "default";
    }
  };

  const getSlaBadge = (ticket: Parameters<typeof getSLAStatus>[0]) => {
    const sla = getSLAStatus(ticket);
    if (sla === "overdue") return <Badge variant="danger">Overdue</Badge>;
    if (sla === "due-soon") return <Badge variant="warning">Due Soon</Badge>;
    if (sla === "completed") return <Badge variant="default">Completed</Badge>;
    return <Badge variant="success">On Track</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 text-sm">
            Manage, search, and monitor operations
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + New Ticket
        </Link>
      </div>

      {/* مكون الفلاتر */}
      <TicketFilters />

      {/* العرض للشاشات الكبيرة (Desktop Table) */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-blue-600">
                    <Link to={`/tickets/${ticket.id}`}>{ticket.id}</Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="hover:underline"
                    >
                      {ticket.subject}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {getCustomerName(ticket.customerId)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getPriorityVariant(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-700 capitalize">
                    {ticket.status.replace("-", " ")}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {getAssigneeName(ticket.assigneeId)}
                  </td>
                  <td className="py-3 px-4">{getSlaBadge(ticket)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No tickets match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* العرض للشاشات الصغيرة (Mobile Cards) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600">
                  {ticket.id}
                </span>
                {getSlaBadge(ticket)}
              </div>
              <Link
                to={`/tickets/${ticket.id}`}
                className="font-semibold text-gray-900 block hover:underline"
              >
                {ticket.subject}
              </Link>
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                <span>{getCustomerName(ticket.customerId)}</span>
                <Badge variant={getPriorityVariant(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-gray-200">
            No tickets match your filters.
          </div>
        )}
      </div>

      {/* التنقل بين الصفحات */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
      />
    </div>
  );
};
