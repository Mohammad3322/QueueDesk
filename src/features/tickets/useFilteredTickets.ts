import { useSearchParams } from "react-router-dom";
import type { Ticket } from "../../types";
import { applyTicketPipeline } from "../../utils/ticketPipeline";
import { useCustomers } from "../../hooks/useCustomers";

export const useFilteredTickets = (tickets: Ticket[]) => {
  const [searchParams] = useSearchParams();
  const { customers } = useCustomers();

  const customerNameById = (id: string): string => {
    return customers.find((c) => c.id === id)?.name ?? "";
  };

  return applyTicketPipeline(
    tickets,
    {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      category: searchParams.get("category") || undefined,
      assignee: searchParams.get("assignee") || undefined,
      sla: searchParams.get("sla") || undefined,
      sortBy: searchParams.get("sort") || undefined,
      sortOrder:
        searchParams.get("order") === "asc" ? "asc" : ("desc" as const),
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
    },
    customerNameById,
  );
};
