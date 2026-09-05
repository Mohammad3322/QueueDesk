import { useSearchParams } from "react-router-dom";
import type { Ticket } from "../../types";
import { applyTicketPipeline } from "../../utils/ticketPipeline";
import { MOCK_CUSTOMERS } from "../../mocks/generator";

const customerNameById = (id: string): string => {
  return MOCK_CUSTOMERS.find((c) => c.id === id)?.name ?? "";
};

export const useFilteredTickets = (tickets: Ticket[]) => {
  const [searchParams] = useSearchParams();

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
