import React from "react";
import type { Ticket, TicketStatus, TicketPriority } from "../../types";
import { useTickets } from "../../hooks/useTickets";
import { MOCK_AGENTS } from "../../mocks/generator";
import { Card } from "../../components/ui/Card";

export const TicketQuickActions: React.FC<{ ticket: Ticket }> = ({
  ticket,
}) => {
  const { updateTicket } = useTickets();

  const handleStatusChange = (status: TicketStatus) => {
    const resolvedAt =
      status === "resolved" || status === "closed"
        ? new Date().toISOString()
        : undefined;
    updateTicket(ticket.id, { status, resolvedAt });
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    updateTicket(ticket.id, { priority });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateTicket(ticket.id, { assigneeId: assigneeId || undefined });
  };

  return (
    <Card title="Quick Actions" className="space-y-4">
      {/* تغيير الحالة */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
          Status
        </label>
        <select
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
          className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="waiting-on-customer">Waiting on Customer</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* تغيير الأولوية */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
          Priority
        </label>
        <select
          value={ticket.priority}
          onChange={(e) =>
            handlePriorityChange(e.target.value as TicketPriority)
          }
          className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* تغيير المسؤول */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
          Assignee
        </label>
        <select
          value={ticket.assigneeId || ""}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Unassigned</option>
          {MOCK_AGENTS.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agent.role})
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
};
