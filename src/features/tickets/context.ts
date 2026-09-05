import { createContext } from "react";
import type { Ticket } from "../../types";

export interface TicketContextType {
  tickets: Ticket[];
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  getTicketById: (id: string) => Ticket | undefined;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);