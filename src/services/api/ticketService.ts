import type { Ticket } from "../../types";
import { MOCK_TICKETS } from "../../mocks/generator";
import {
  USE_MOCK,
  API_URL,
  maybeFail,
  randomLatency,
  delay,
  throwIfAborted,
} from "./mockApi";

let memoryTickets: Ticket[] = [...MOCK_TICKETS];

export const ticketService = {
  async getTickets(
    searchQuery?: string,
    signal?: AbortSignal,
  ): Promise<Ticket[]> {
    if (USE_MOCK) {
      await delay(randomLatency());
      throwIfAborted(signal);
      maybeFail();

      let results = [...memoryTickets];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = results.filter(
          (t) =>
            t.subject.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            t.customerId.toLowerCase().includes(q),
        );
      }
      return results;
    }

    const res = await fetch(
      `${API_URL}/tickets?q=${encodeURIComponent(searchQuery || "")}`,
      { signal },
    );
    if (!res.ok) throw new Error("Failed to fetch tickets");
    return res.json();
  },

  async getTicket(id: string, signal?: AbortSignal): Promise<Ticket> {
    if (USE_MOCK) {
      await delay(randomLatency());
      throwIfAborted(signal);
      const ticket = memoryTickets.find((t) => t.id === id);
      if (!ticket) throw new Error(`Ticket ${id} not found`);
      return ticket;
    }
    const res = await fetch(`${API_URL}/tickets/${id}`, { signal });
    if (!res.ok) throw new Error("Failed to fetch ticket");
    return res.json();
  },

  async createTicket(input: Ticket): Promise<Ticket> {
    if (USE_MOCK) {
      await delay(randomLatency());
      memoryTickets = [input, ...memoryTickets];
      return input;
    }
    const res = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to create ticket");
    return res.json();
  },

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    if (USE_MOCK) {
      await delay(randomLatency());
      memoryTickets = memoryTickets.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t,
      );
      const updated = memoryTickets.find((t) => t.id === id);
      if (!updated) throw new Error(`Ticket ${id} not found`);
      return updated;
    }
    const res = await fetch(`${API_URL}/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update ticket");
    return res.json();
  },

  async deleteTicket(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(randomLatency());
      const exists = memoryTickets.some((t) => t.id === id);
      if (!exists) throw new Error(`Ticket ${id} not found`);
      memoryTickets = memoryTickets.filter((t) => t.id !== id);
      return;
    }
    const res = await fetch(`${API_URL}/tickets/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete ticket");
  },

  exportToCSV(tickets: Ticket[]) {
    const headers = [
      "ID",
      "Subject",
      "Status",
      "Priority",
      "Assignee",
      "Created At",
      "Due At",
    ];
    const rows = tickets.map((t) => [
      t.id,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.assigneeId || "Unassigned",
      t.createdAt,
      t.dueAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `queuedesk_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
