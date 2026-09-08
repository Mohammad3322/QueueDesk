import React, { useState, useEffect, useCallback, type ReactNode } from "react";
import type { Ticket, Comment, ActivityEvent } from "../../types";
import { MOCK_COMMENTS, MOCK_ACTIVITY_EVENTS } from "../../mocks/generator";
import { ticketService } from "../../services/api/ticketService";
import { TicketContext } from "./context";

const TICKETS_KEY = "queuedesk_tickets";
const COMMENTS_KEY = "queuedesk_comments";
const ACTIVITY_KEY = "queuedesk_activity";

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveJson(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota exceeded */
  }
}

export const TicketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    return loadJson<Ticket[]>(TICKETS_KEY) ?? [];
  });
  const [comments, setComments] = useState<Comment[]>(() => {
    return loadJson<Comment[]>(COMMENTS_KEY) ?? MOCK_COMMENTS;
  });
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(() => {
    return loadJson<ActivityEvent[]>(ACTIVITY_KEY) ?? MOCK_ACTIVITY_EVENTS;
  });
  const [loadState, setLoadState] = useState<"loading" | "success" | "error">(
    loadJson<Ticket[]>(TICKETS_KEY) ? "success" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    saveJson(TICKETS_KEY, tickets);
  }, [tickets]);

  useEffect(() => {
    saveJson(COMMENTS_KEY, comments);
  }, [comments]);

  useEffect(() => {
    saveJson(ACTIVITY_KEY, activityEvents);
  }, [activityEvents]);

  const refresh = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await ticketService.getTickets();
      setTickets(data);
      setLoadState("success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setLoadState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load tickets",
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await ticketService.getTickets();
        if (cancelled) return;
        setTickets(data);
        setLoadState("success");
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load tickets",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t,
      ),
    );
  };

  const createTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    setActivityEvents((prev) => [
      ...prev,
      {
        id: `evt-${ticket.id}-created`,
        ticketId: ticket.id,
        type: "ticket-created",
        actorId: "system",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const deleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    setComments((prev) => prev.filter((c) => c.ticketId !== ticketId));
    setActivityEvents((prev) => prev.filter((e) => e.ticketId !== ticketId));
  };

  const addComment = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
    setActivityEvents((prev) => [
      ...prev,
      {
        id: `evt-${comment.id}`,
        ticketId: comment.ticketId,
        type: "comment-added",
        actorId: comment.authorId,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const addActivityEvent = (event: ActivityEvent) => {
    setActivityEvents((prev) => [...prev, event]);
  };

  const getTicketById = (id: string) => {
    return tickets.find((t) => t.id === id);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        comments,
        activityEvents,
        loadState,
        errorMessage,
        getTicketById,
        updateTicket,
        createTicket,
        deleteTicket,
        addComment,
        addActivityEvent,
        refresh,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
