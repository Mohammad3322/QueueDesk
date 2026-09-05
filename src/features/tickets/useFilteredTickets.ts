import { useSearchParams } from "react-router-dom";
import type { Ticket } from "../../types";
import { PRIORITY_WEIGHTS, getSLAStatus } from "../../utils/ticketHelpers";

export const useFilteredTickets = (tickets: Ticket[]) => {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assignee = searchParams.get("assignee");
  const sla = searchParams.get("sla");
  const sortBy = searchParams.get("sort") || "createdAt";
  const sortOrder = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // 1. الفلترة والبحث
  const filtered = tickets.filter((ticket) => {
    if (search && !ticket.subject.toLowerCase().includes(search) && !ticket.id.toLowerCase().includes(search)) {
      return false;
    }
    if (status && status !== "all" && ticket.status !== status) {
      return false;
    }
    if (priority && priority !== "all" && ticket.priority !== priority) {
      return false;
    }
    if (assignee && assignee !== "all") {
      if (assignee === "unassigned" && ticket.assigneeId) return false;
      if (assignee !== "unassigned" && ticket.assigneeId !== assignee) return false;
    }
    if (sla && sla !== "all") {
      const currentSla = getSLAStatus(ticket);
      if (currentSla !== sla) return false;
    }
    return true;
  });

  // 2. الترتيب (Sorting) بدون متغير غير مستخدم
  const sorted = [...filtered].sort((a, b) => {
    let comparison: number;

    if (sortBy === "priority") {
      comparison = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
    } else if (sortBy === "dueAt") {
      comparison = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  // 3. التقسيم لصفحات (Pagination)
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
};