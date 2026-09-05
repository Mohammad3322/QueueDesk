import type { Ticket } from "../types";
import { PRIORITY_WEIGHTS, getSLAStatus } from "./ticketHelpers";

export interface TicketQueryOptions {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignee?: string;
  sla?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Filter, sort, and paginate a ticket list. Extracted from the
 * useFilteredTickets hook so the exact same pipeline can be exercised
 * in isolation (unit tests and the 10k stress/performance harness).
 */
export function applyTicketPipeline(
  tickets: Ticket[],
  options: TicketQueryOptions,
  customerNameById: (id: string) => string = () => "",
) {
  const search = (options.search ?? "").trim().toLowerCase();
  const status = options.status;
  const priority = options.priority;
  const category = options.category;
  const assignee = options.assignee;
  const sla = options.sla;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  const page = options.page && options.page > 0 ? options.page : 1;
  const pageSize =
    options.pageSize && options.pageSize > 0 ? options.pageSize : 10;

  const filtered = tickets.filter((ticket) => {
    if (
      search &&
      !ticket.subject.toLowerCase().includes(search) &&
      !ticket.id.toLowerCase().includes(search) &&
      !customerNameById(ticket.customerId).toLowerCase().includes(search)
    ) {
      return false;
    }
    if (status && status !== "all" && ticket.status !== status) {
      return false;
    }
    if (priority && priority !== "all" && ticket.priority !== priority) {
      return false;
    }
    if (category && category !== "all" && ticket.category !== category) {
      return false;
    }
    if (assignee && assignee !== "all") {
      if (assignee === "unassigned" && ticket.assigneeId) return false;
      if (assignee !== "unassigned" && ticket.assigneeId !== assignee)
        return false;
    }
    if (sla && sla !== "all") {
      const currentSla = getSLAStatus(ticket);
      if (currentSla !== sla) return false;
    }
    return true;
  });

  const createdAtMs = new Map<string, number>();
  const dueAtMs = new Map<string, number>();
  const customerNameMs = new Map<string, string>();
  filtered.forEach((t) => {
    if (sortBy === "createdAt" || sortBy === "dueAt") {
      createdAtMs.set(t.id, new Date(t.createdAt).getTime());
      dueAtMs.set(t.id, new Date(t.dueAt).getTime());
    }
    if (sortBy === "customerName") {
      customerNameMs.set(t.id, customerNameById(t.customerId));
    }
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison: number;

    if (sortBy === "priority") {
      comparison = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
    } else if (sortBy === "dueAt") {
      comparison = dueAtMs.get(a.id)! - dueAtMs.get(b.id)!;
    } else if (sortBy === "customerName") {
      comparison = customerNameMs
        .get(a.id)!
        .localeCompare(customerNameMs.get(b.id)!);
    } else {
      comparison = createdAtMs.get(a.id)! - createdAtMs.get(b.id)!;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTickets = sorted.slice(startIndex, startIndex + pageSize);

  return {
    tickets: paginatedTickets,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
  };
}
