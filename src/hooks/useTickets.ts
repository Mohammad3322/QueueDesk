import { useContext } from "react";
import { TicketContext, type TicketContextType } from "../features/tickets/context";

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};