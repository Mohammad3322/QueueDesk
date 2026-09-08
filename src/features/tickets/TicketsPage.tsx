import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { MOCK_AGENTS } from "../../mocks/generator";
import { useCustomers } from "../../hooks/useCustomers";
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
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

type TicketTableCol =
  | "id"
  | "subject"
  | "customer"
  | "priority"
  | "status"
  | "assignee"
  | "sla"
  | "actions";

const DEFAULT_COL_WIDTHS: Record<TicketTableCol, number> = {
  id: 130,
  subject: 320,
  customer: 220,
  priority: 110,
  status: 140,
  assignee: 160,
  sla: 110,
  actions: 90,
};

const MIN_COL_WIDTH = 80;

const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function useColumnResize(defaultWidths: Record<TicketTableCol, number>) {
  const [widths, setWidths] = React.useState(defaultWidths);

  const startResize = (
    col: TicketTableCol,
    startX: number,
    startWidth: number,
  ) => {
    const onMove = (e: PointerEvent) => {
      setWidths((prev) => ({
        ...prev,
        [col]: Math.max(MIN_COL_WIDTH, startWidth + e.clientX - startX),
      }));
    };
    const onUp = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return { widths, startResize };
}

function ResizableTh({
  col,
  width,
  onResize,
  children,
}: {
  col: TicketTableCol;
  width: number;
  onResize: (col: TicketTableCol, startX: number, width: number) => void;
  children: React.ReactNode;
}) {
  return (
    <TableCell
      style={{ width }}
      sx={{
        position: "relative",
        fontWeight: 700,
        fontSize: "0.72rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "text.secondary",
        whiteSpace: "nowrap",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {children}
      <span
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${col} column`}
        title="Drag to resize"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onResize(col, e.clientX, width);
        }}
        className="absolute top-1 right-0 -bottom-1 z-10 w-1.5 cursor-col-resize touch-none bg-transparent hover:bg-blue-400/60 hover:shadow-[0_0_4px_rgba(59,130,246,0.6)] active:bg-blue-500/80"
      />
    </TableCell>
  );
}

export const TicketsPage: React.FC = () => {
  const { currentUser } = useUser();
  const { customers } = useCustomers();
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
  const { widths, startResize } = useColumnResize(DEFAULT_COL_WIDTHS);

  const getCustomerName = (customerId: string) => {
    return (
      customers.find((c) => c.id === customerId)?.name || "Unknown Customer"
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
            className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 bg-primary text-white hover:bg-primary transition-colors"
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
          <TableContainer
            className="hidden md:block"
            sx={{
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 3,
              boxShadow:
                "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.06)",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                minWidth: "100%",
                borderCollapse: "collapse",
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid",
                  borderColor: "grey.100",
                },
                "& .MuiTableHead-root .MuiTableCell-root": {
                  paddingY: "12px",
                },
                "& .MuiTableBody-root .MuiTableCell-root": {
                  paddingY: "11px",
                  verticalAlign: "middle",
                },
                "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                  borderBottom: 0,
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <ResizableTh
                    col="id"
                    width={widths.id}
                    onResize={startResize}
                  >
                    ID
                  </ResizableTh>
                  <ResizableTh
                    col="subject"
                    width={widths.subject}
                    onResize={startResize}
                  >
                    Subject
                  </ResizableTh>
                  <ResizableTh
                    col="customer"
                    width={widths.customer}
                    onResize={startResize}
                  >
                    Customer
                  </ResizableTh>
                  <ResizableTh
                    col="priority"
                    width={widths.priority}
                    onResize={startResize}
                  >
                    Priority
                  </ResizableTh>
                  <ResizableTh
                    col="status"
                    width={widths.status}
                    onResize={startResize}
                  >
                    Status
                  </ResizableTh>
                  <ResizableTh
                    col="assignee"
                    width={widths.assignee}
                    onResize={startResize}
                  >
                    Assignee
                  </ResizableTh>
                  <ResizableTh
                    col="sla"
                    width={widths.sla}
                    onResize={startResize}
                  >
                    SLA
                  </ResizableTh>
                  {canDelete && (
                    <ResizableTh
                      col="actions"
                      width={widths.actions}
                      onResize={startResize}
                    >
                      Actions
                    </ResizableTh>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    hover
                  >
                    <TableCell sx={{ fontFamily: MONO_FONT, fontWeight: 600, color: "primary.main", whiteSpace: "nowrap" }}>
                      <Link to={`/tickets/${ticket.id}`}>{ticket.id}</Link>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "text.primary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 0,
                      }}
                    >
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="hover:underline"
                      >
                        {ticket.subject}
                      </Link>
                    </TableCell>
                    <TableCell
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 0,
                      }}
                    >
                      <Link
                        to={`/customers/${ticket.customerId}`}
                        className="text-gray-600 hover:text-blue-600 hover:underline"
                      >
                        {getCustomerName(ticket.customerId)}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Badge variant={getPriorityVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.primary",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.status.replace("-", " ")}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.secondary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 0,
                      }}
                    >
                      {getAssigneeName(ticket.assigneeId)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {getSlaBadge(ticket)}
                    </TableCell>
                    {canDelete && (
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          variant="dangerOutline"
                          size="sm"
                          title={`Delete ${ticket.id}`}
                          aria-label={`Delete ${ticket.id}`}
                          onClick={() => {
                            setPendingDelete(ticket.id);
                            setDeleteError(null);
                          }}
                        >
                          <DeleteOutlinedIcon />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
