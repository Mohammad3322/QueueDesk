import React from "react";
import type { Ticket } from "../../types";
import { getSLAStatus } from "../../utils/ticketHelpers";
import { Badge } from "../../components/ui/Badge";

export const SLAIndicator: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const slaStatus = getSLAStatus(ticket);

  const getSlaInfo = () => {
    if (slaStatus === "completed") {
      return {
        title: "SLA Completed",
        color: "bg-gray-100 border-gray-200 text-gray-700",
        badge: <Badge variant="default">Completed</Badge>,
      };
    }
    if (slaStatus === "overdue") {
      return {
        title: "SLA Overdue",
        color: "bg-red-50 border-red-200 text-red-700",
        badge: <Badge variant="danger">Overdue</Badge>,
      };
    }
    if (slaStatus === "due-soon") {
      return {
        title: "SLA Due Soon",
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        badge: <Badge variant="warning">Due Soon</Badge>,
      };
    }
    return {
      title: "SLA On Track",
      color: "bg-green-50 border-green-200 text-green-800",
      badge: <Badge variant="success">On Track</Badge>,
    };
  };

  const info = getSlaInfo();
  const dueDateFormatted = new Date(ticket.dueAt).toLocaleString();

  return (
    <div
      className={`p-4 rounded-xl border ${info.color} flex items-center justify-between`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{info.title}</span>
          {info.badge}
        </div>
        <p className="text-xs opacity-80">
          Due Date: <span className="font-medium">{dueDateFormatted}</span>
        </p>
      </div>
    </div>
  );
};
