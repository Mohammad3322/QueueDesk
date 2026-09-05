import { createContext } from "react";
import type { Ticket, Comment, ActivityEvent } from "../../types";

export type LoadState = "loading" | "success" | "error";

export interface TicketContextType {
  tickets: Ticket[];
  comments: Comment[];
  activityEvents: ActivityEvent[];
  loadState: LoadState;
  errorMessage: string | null;
  getTicketById: (id: string) => Ticket | undefined;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  createTicket: (ticket: Ticket) => void;
  deleteTicket: (ticketId: string) => void;
  addComment: (comment: Comment) => void;
  addActivityEvent: (event: ActivityEvent) => void;
  refresh: () => Promise<void>;
}

export const TicketContext = createContext<TicketContextType | undefined>(
  undefined,
);
