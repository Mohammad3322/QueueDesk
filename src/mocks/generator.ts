import type {
  Ticket,
  User,
  Customer,
  TicketStatus,
  Comment,
  ActivityEvent,
} from "../types";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../constants";

export const MOCK_USERS: User[] = [
  {
    id: "usr-1",
    name: "Sarah Connor",
    email: "sarah@queuedesk.com",
    role: "manager",
    avatarUrl: "https://i.pravatar.cc/150?u=usr-1",
  },
  {
    id: "usr-2",
    name: "Alex Mercer",
    email: "alex@queuedesk.com",
    role: "agent",
    avatarUrl: "https://i.pravatar.cc/150?u=usr-2",
  },
  {
    id: "usr-3",
    name: "Elena Fisher",
    email: "elena@queuedesk.com",
    role: "agent",
    avatarUrl: "https://i.pravatar.cc/150?u=usr-3",
  },
  {
    id: "usr-4",
    name: "David Miller",
    email: "david@queuedesk.com",
    role: "agent",
    avatarUrl: "https://i.pravatar.cc/150?u=usr-4",
  },
];

const CUSTOMER_NAMES = [
  "Northwind Traders",
  "Acme Corporation",
  "Globex Inc.",
  "Initech",
  "Umbrella Corp",
  "Stark Industries",
  "Wayne Enterprises",
  "Hooli",
  "Pied Piper",
  "Vandelay Industries",
  "Cyberdyne Systems",
  "Massive Dynamic",
  "Tyrell Corporation",
  "Wonka Industries",
  "Soylent Corp",
  "Gringotts Bank",
  "Rekall Inc.",
  "Bluth Company",
  "Dunder Mifflin",
  "Prestige Worldwide",
];

export const MOCK_CUSTOMERS: Customer[] = CUSTOMER_NAMES.map((name, i) => ({
  id: `customer-${i + 1}`,
  name,
  email: `contact@${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`,
  company: name,
  plan: (["free", "starter", "business", "enterprise"] as const)[i % 4],
  createdAt: new Date(Date.now() - (i + 1) * 86400000 * 5).toISOString(),
}));

const STATUSES: TicketStatus[] = [...TICKET_STATUSES];
const PRIORITIES = TICKET_PRIORITIES;
const SUBJECT_KEYWORDS = [
  "cannot log in",
  "invoice mismatch",
  "API returns 500",
  "slow page load",
  "syncing failed",
  "permissions error",
  "billing overcharge",
  "data export broken",
  "webhook not firing",
  "dashboard blank",
];

// Deterministic PRNG so mock data is stable across reloads
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateMockTickets(count: number = 75): Ticket[] {
  const tickets: Ticket[] = [];
  const rand = mulberry32(42);
  const now = Date.now();

  for (let i = 1; i <= count; i++) {
    const createdAtTime = now - Math.floor(rand() * 10 * 86400000);
    const isOverdue = rand() < 0.2;
    const dueHours = Math.floor(rand() * 47) + 1;
    const dueAtTime = isOverdue
      ? createdAtTime - Math.floor(rand() * 6 + 1) * 3600000
      : createdAtTime + dueHours * 3600000;

    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const priority = PRIORITIES[Math.floor(rand() * PRIORITIES.length)];
    const customer = MOCK_CUSTOMERS[Math.floor(rand() * MOCK_CUSTOMERS.length)];
    const assignee =
      rand() > 0.25
        ? MOCK_USERS[Math.floor(rand() * MOCK_USERS.length)].id
        : undefined;
    const category = TICKET_CATEGORIES[i % TICKET_CATEGORIES.length];
    const created = new Date(createdAtTime);

    tickets.push({
      id: `TICK-${1000 + i}`,
      subject: `${SUBJECT_KEYWORDS[i % SUBJECT_KEYWORDS.length]} - ${category}`,
      description: `Detailed problem description for ticket TICK-${1000 + i}. ${customer.name} reports ${SUBJECT_KEYWORDS[i % SUBJECT_KEYWORDS.length]} occurring during normal workflow execution. Steps to reproduce and expected behavior are documented for the support team to investigate.`,
      customerId: customer.id,
      assigneeId: assignee,
      status,
      priority,
      category,
      tags: [`tag-${i % 5}`, priority],
      createdAt: created.toISOString(),
      updatedAt: new Date(createdAtTime + 1800000).toISOString(),
      dueAt: new Date(dueAtTime).toISOString(),
      resolvedAt:
        status === "resolved" || status === "closed"
          ? new Date().toISOString()
          : undefined,
    });
  }

  return tickets;
}

export function generateMockComments(tickets: Ticket[]): Comment[] {
  const comments: Comment[] = [];
  const rand = mulberry32(7);
  const sampleBodies = [
    "Customer confirmed the steps; issue reproducible on their end.",
    "Investigation in progress. Likely related to the recent release.",
    "Escalated to the engineering team for a fix.",
    "Provided a workaround to the customer while we work on a permanent fix.",
    "Customer followed up — still seeing the same behavior.",
    "Found the root cause. A fix is being prepared for the next deploy.",
  ];

  tickets.forEach((ticket) => {
    const count = Math.floor(rand() * 4); // 0-3 comments per ticket
    for (let c = 0; c < count; c++) {
      const author = MOCK_USERS[Math.floor(rand() * MOCK_USERS.length)];
      comments.push({
        id: `cmt-${ticket.id}-${c}`,
        ticketId: ticket.id,
        authorId: author.id,
        body: sampleBodies[Math.floor(rand() * sampleBodies.length)],
        createdAt: ticket.createdAt,
      });
    }
  });

  return comments;
}

export function generateMockActivityEvents(tickets: Ticket[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  tickets.forEach((ticket) => {
    events.push({
      id: `evt-${ticket.id}-created`,
      ticketId: ticket.id,
      type: "ticket-created",
      actorId: ticket.customerId,
      createdAt: ticket.createdAt,
    });
    if (ticket.assigneeId) {
      events.push({
        id: `evt-${ticket.id}-assigned`,
        ticketId: ticket.id,
        type: "assigned",
        actorId: ticket.assigneeId,
        createdAt: ticket.updatedAt,
        metadata: { assigneeId: ticket.assigneeId },
      });
    }
    if (ticket.status === "resolved" || ticket.status === "closed") {
      events.push({
        id: `evt-${ticket.id}-resolved`,
        ticketId: ticket.id,
        type: "ticket-resolved",
        actorId: ticket.assigneeId || "system",
        createdAt: ticket.resolvedAt || ticket.updatedAt,
      });
    }
  });
  return events;
}

const envStressCount = Number(import.meta.env.VITE_STRESS_TICKETS);
const MOCK_TICKET_COUNT =
  Number.isFinite(envStressCount) && envStressCount > 0
    ? Math.floor(envStressCount)
    : 75;

export const MOCK_TICKETS = generateMockTickets(MOCK_TICKET_COUNT);
export const MOCK_COMMENTS = generateMockComments(MOCK_TICKETS);
export const MOCK_ACTIVITY_EVENTS = generateMockActivityEvents(MOCK_TICKETS);
export const MOCK_AGENTS: User[] = MOCK_USERS;
// Kept for backward compatibility; the canonical list lives in src/constants.
export { TICKET_CATEGORIES as CATEGORIES_LIST } from "../constants";
