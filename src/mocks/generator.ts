import type { Ticket, Customer, User, TicketStatus, TicketPriority } from "../types";

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Acme Corp", email: "support@acme.com", plan: "enterprise", createdAt: "2024-01-15T00:00:00Z" },
  { id: "cust-2", name: "Starlight Media", email: "hello@starlight.io", plan: "business", createdAt: "2024-02-10T00:00:00Z" },
  { id: "cust-3", name: "Global Logistics", email: "ops@globallog.com", plan: "starter", createdAt: "2024-03-01T00:00:00Z" },
  { id: "cust-4", name: "DevPulse Inc", email: "admin@devpulse.dev", plan: "enterprise", createdAt: "2024-03-12T00:00:00Z" },
  { id: "cust-5", name: "Solo Founder", email: "alex@solostartup.com", plan: "free", createdAt: "2024-04-05T00:00:00Z" },
];

export const MOCK_AGENTS: User[] = [
  { id: "user-agent-1", name: "Alex Agent", email: "alex@queuedesk.com", role: "agent" },
  { id: "user-agent-2", name: "Sarah Smith", email: "sarah@queuedesk.com", role: "agent" },
  { id: "user-agent-3", name: "John Doe", email: "john@queuedesk.com", role: "agent" },
  { id: "user-manager-1", name: "Morgan Manager", email: "morgan@queuedesk.com", role: "manager" },
];

const statuses: TicketStatus[] = ["open", "in-progress", "waiting-on-customer", "resolved", "closed"];
const priorities: TicketPriority[] = ["low", "medium", "high", "critical"];
const categories = ["Billing", "Account Access", "Bug Report", "Feature Question", "Integration"];

export const generateMockTickets = (count = 80): Ticket[] => {
  const tickets: Ticket[] = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const customer = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
    const assignee = i % 5 === 0 ? undefined : MOCK_AGENTS[i % MOCK_AGENTS.length].id;
    
    // حساب مواعيدDueAt و CreatedAt متوازنة لتجربة SLA
    const createdDate = new Date(now.getTime() - (count - i) * 3600000 * 4);
    const dueDate = new Date(createdDate.getTime() + 24 * 3600000);

    tickets.push({
      id: `TICK-${1000 + i}`,
      subject: `Issue regarding ${categories[i % categories.length]} #${i}`,
      description: `Detailed support request description for ticket number ${i}. Needs agent inspection.`,
      customerId: customer.id,
      assigneeId: assignee,
      status: status,
      priority: priority,
      category: categories[i % categories.length],
      tags: ["support", categories[i % categories.length].toLowerCase().replace(" ", "-")],
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      dueAt: dueDate.toISOString(),
      resolvedAt: status === "resolved" || status === "closed" ? new Date().toISOString() : undefined,
    });
  }

  return tickets;
};

export const MOCK_TICKETS = generateMockTickets(85);