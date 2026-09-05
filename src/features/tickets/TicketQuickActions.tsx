import React, { useState } from "react";
import type { Ticket, TicketStatus, TicketPriority } from "../../types";
import { useTickets } from "../../hooks/useTickets";
import { MOCK_AGENTS, MOCK_USERS } from "../../mocks/generator";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useUser } from "../../hooks/useUser";
import {
  canAssignTicket,
  canChangePriority,
  canClaimTicket,
  canEditTicket,
} from "../../utils/permissions";

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in-progress", "closed"],
  "in-progress": ["waiting-on-customer", "resolved", "open"],
  "waiting-on-customer": ["in-progress", "open"],
  resolved: ["closed", "open"],
  closed: ["open"],
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "waiting-on-customer", label: "Waiting on Customer" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const TicketQuickActions: React.FC<{ ticket: Ticket }> = ({
  ticket,
}) => {
  const { updateTicket, addActivityEvent } = useTickets();
  const { currentUser } = useUser();

  const isEditable = canEditTicket(currentUser, ticket);
  const canAssign = canAssignTicket(currentUser);
  const canClaim = canClaimTicket(currentUser, ticket);
  const allowedStatuses = ALLOWED_TRANSITIONS[ticket.status] ?? [];
  const canChangeTo = (s: TicketStatus) => allowedStatuses.includes(s);
  const canChangeCritical = canChangePriority(currentUser, "critical");

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const commitStatusChange = (status: TicketStatus) => {
    const resolvedAt =
      status === "resolved" || status === "closed"
        ? new Date().toISOString()
        : undefined;
    updateTicket(ticket.id, { status, resolvedAt });
    addActivityEvent({
      id: `evt-${Date.now()}`,
      ticketId: ticket.id,
      type: "status-changed",
      actorId: currentUser.id,
      createdAt: new Date().toISOString(),
      metadata: { from: ticket.status, to: status },
    });
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (status === "closed" && status !== ticket.status) {
      setConfirmCloseOpen(true);
      return;
    }
    commitStatusChange(status);
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    updateTicket(ticket.id, { priority });
    addActivityEvent({
      id: `evt-${Date.now()}`,
      ticketId: ticket.id,
      type: "priority-changed",
      actorId: currentUser.id,
      createdAt: new Date().toISOString(),
      metadata: { to: priority },
    });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateTicket(ticket.id, { assigneeId: assigneeId || undefined });
    addActivityEvent({
      id: `evt-${Date.now()}`,
      ticketId: ticket.id,
      type: "assigned",
      actorId: currentUser.id,
      createdAt: new Date().toISOString(),
      metadata: { assigneeId: assigneeId || undefined },
    });
  };

  if (!isEditable) {
    return (
      <Card title="Quick Actions" className="space-y-4">
        <p className="text-sm text-gray-500">
          You can only edit tickets assigned to you.
        </p>
        <div className="text-sm space-y-2">
          <p>
            <span className="text-gray-500">Current Status:</span>{" "}
            <span className="capitalize font-medium text-gray-900">
              {ticket.status.replace("-", " ")}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Priority:</span>{" "}
            <span className="capitalize font-medium text-gray-900">
              {ticket.priority}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Assignee:</span>{" "}
            <span className="font-medium text-gray-900">
              {ticket.assigneeId
                ? MOCK_USERS.find((u) => u.id === ticket.assigneeId)?.name ||
                  "Unknown"
                : "Unassigned"}
            </span>
          </p>
        </div>
      </Card>
    );
  }

  const assigneeDisabled = !canAssign && !canClaim;

  return (
    <Card title="Quick Actions" className="space-y-4">
      <div>
        <Select
          id="status-select"
          label="Status"
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
        >
          {STATUS_OPTIONS.filter(
            (s) =>
              s.value === ticket.status || canChangeTo(s.value as TicketStatus),
          ).map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Select
          id="priority-select"
          label="Priority"
          value={ticket.priority}
          onChange={(e) =>
            handlePriorityChange(e.target.value as TicketPriority)
          }
        >
          {(
            [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ] as { value: TicketPriority; label: string }[]
          )
            .filter(
              (p) =>
                p.value === ticket.priority ||
                p.value !== "critical" ||
                canChangeCritical,
            )
            .map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
        </Select>
        {!canChangeCritical && (
          <p className="mt-1 text-xs text-gray-500">
            Only managers can set Critical priority.
          </p>
        )}
      </div>

      <div>
        <Select
          id="assignee-select"
          label="Assignee"
          value={ticket.assigneeId || ""}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          disabled={assigneeDisabled}
        >
          <option value="">Unassigned</option>
          {canClaim && (
            <option value={currentUser.id}>{currentUser.name} (Claim)</option>
          )}
          {canAssign &&
            MOCK_AGENTS.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.role})
              </option>
            ))}
        </Select>
        {assigneeDisabled && (
          <p className="mt-1 text-xs text-gray-500">
            Only managers can assign tickets.
          </p>
        )}
      </div>

      <Modal
        isOpen={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        title="Close this ticket?"
      >
        <p className="text-sm text-gray-600">
          Closing <span className="font-medium">{ticket.id}</span> marks it as
          closed and records a resolved timestamp. You can reopen it later from
          the Status menu if needed.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmCloseOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setConfirmCloseOpen(false);
              commitStatusChange("closed");
            }}
          >
            Close Ticket
          </Button>
        </div>
      </Modal>
    </Card>
  );
};
