import React, { useState, type ReactNode } from "react";
import type { Ticket } from "../../types";
import { MOCK_TICKETS } from "../../mocks/generator";
import { TicketContext } from "./context";

export const TicketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t,
      ),
    );
  };

  const getTicketById = (id: string) => {
    return tickets.find((t) => t.id === id);
  };

  return (
    <TicketContext.Provider value={{ tickets, updateTicket, getTicketById }}>
      {children}
    </TicketContext.Provider>
  );
};
