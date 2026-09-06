import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { MOCK_CUSTOMERS, MOCK_AGENTS } from "../../mocks/generator";
import { useFilteredTickets } from "./useFilteredTickets";
import { TicketFilters } from "./TicketFilters";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Alert } from "../../components/ui/Alert";
import { ticketService } from "../../services/api/ticketService";
import { getSLAStatus } from "../../utils/ticketHelpers";
import { useUser } from "../../hooks/useUser";
import { canDeleteTickets } from "../../utils/permissions";
import { TicketCard } from "../../components/ui/MuiMCard";

export const TicketsPage: React.FC = () => {
  const { currentUser } = useUser();
  const {
    tickets: allTickets,
    loadState,
    errorMessage,
    refresh,
    deleteTicket,
  } = useTickets();
  const [, setSearchParams] = useSearchParams();
  const { tickets, totalItems, totalPages, currentPage, pageSize } =
    useFilteredTickets(allTickets);
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const canDelete = canDeleteTickets(currentUser);

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

  const handleExport = () => {
    ticketService.exportToCSV(tickets);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    try {
      deleteTicket(pendingDelete);
      setPendingDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete ticket",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 text-sm">
            Manage, search, and monitor operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Export CSV
          </button>
          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + New Ticket
          </Link>
        </div>
      </div>

      <TicketFilters />

      {loadState === "loading" && allTickets.length === 0 ? (
        <Spinner
          label="Loading tickets..."
          className="bg-white border border-gray-200 rounded-xl"
        />
      ) : loadState === "error" && allTickets.length === 0 ? (
        <EmptyState
          title="Could not load tickets"
          description={errorMessage || "Something went wrong. Try again."}
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description={
            allTickets.length === 0
              ? "There are no tickets in the system yet."
              : "No tickets match your current filters. Try adjusting or resetting them."
          }
          actionLabel={allTickets.length > 0 ? "Reset Filters" : undefined}
          onAction={
            allTickets.length > 0
              ? () => setSearchParams(new URLSearchParams())
              : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 w-full border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">SLA</th>
                  {canDelete && <th className="py-3 px-4">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {tickets.map((ticket) => (
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
                    <td className="py-3 px-4">
                      <Link
                        to={`/customers/${ticket.customerId}`}
                        className="text-gray-600 hover:text-blue-600 hover:underline"
                      >
                        {getCustomerName(ticket.customerId)}
                      </Link>
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
                    {canDelete && (
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          title={`Delete ${ticket.id}`}
                          aria-label={`Delete ${ticket.id}`}
                          onClick={() => {
                            setPendingDelete(ticket.id);
                            setDeleteError(null);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {tickets.map((ticket) => (
              // <div
              //   key={ticket.id}
              //   className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"
              // >
              //   <div className="flex items-center justify-between">
              //     <span className="font-mono text-xs font-bold text-blue-600">
              //       {ticket.id}
              //     </span>
              //     {getSlaBadge(ticket)}
              //   </div>
              //   <Link
              //     to={`/tickets/${ticket.id}`}
              //     className="font-semibold text-gray-900 block hover:underline"
              //   >
              //     {ticket.subject}
              //   </Link>
              //   <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
              //     <Link
              //       to={`/customers/${ticket.customerId}`}
              //       className="hover:text-blue-600 hover:underline"
              //     >
              //       {getCustomerName(ticket.customerId)}
              //     </Link>
              //     <div className="flex items-center gap-2">
              //       <Badge variant={getPriorityVariant(ticket.priority)}>
              //         {ticket.priority}
              //       </Badge>
              //       {canDelete && (
              //         <Button
              //           variant="outline"
              //           size="sm"
              //           aria-label={`Delete ${ticket.id}`}
              //           onClick={() => {
              //             setPendingDelete(ticket.id);
              //             setDeleteError(null);
              //           }}
              //         >
              //           Delete
              //         </Button>
              //       )}
              //     </div>
              //   </div>
              // </div>
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                customerName={getCustomerName(ticket.customerId)}
                slaBadge={getSlaBadge(ticket)}
                priorityBadge={getPriorityVariant(ticket.priority)}
                canDelete
                onDeleteRequest={setPendingDelete}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </>
      )}

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete ticket?"
      >
        <p className="text-sm text-gray-600">
          This permanently removes{" "}
          <span className="font-mono text-gray-900 font-medium">
            {pendingDelete}
          </span>{" "}
          and its activity history. This action cannot be undone.
        </p>
        {deleteError && (
          <div className="mt-3">
            <Alert variant="danger" title="Delete failed">
              {deleteError}
            </Alert>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingDelete(null)}
          >
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
            Delete Ticket
          </Button>
        </div>
      </Modal>
    </div>
  );
};
