import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { TextArea } from "../../components/ui/TextArea";
import { useUser } from "../../hooks/useUser";
import { useTickets } from "../../hooks/useTickets";
import { MOCK_CUSTOMERS, MOCK_USERS } from "../../mocks/generator";

interface ActivityItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isInternal: boolean;
}

export const TicketActivityStream: React.FC<{ ticketId: string }> = ({
  ticketId,
}) => {
  const { currentUser } = useUser();
  const { comments, activityEvents, addComment } = useTickets();

  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ticketComments = comments
    .filter((c) => c.ticketId === ticketId)
    .map((c) => ({
      id: c.id,
      author: MOCK_USERS.find((u) => u.id === c.authorId)?.name || "Unknown",
      text: c.body,
      timestamp: c.createdAt,
      isInternal: false,
    }));

  const ticketEvents = activityEvents
    .filter((e) => e.ticketId === ticketId)
    .map((e) => {
      const meta = e.metadata;
      const text = describeEvent(e.type, meta);
      return {
        id: e.id,
        author:
          MOCK_USERS.find((u) => u.id === e.actorId)?.name ||
          MOCK_CUSTOMERS.find((c) => c.id === e.actorId)?.name ||
          "System",
        text,
        timestamp: e.createdAt,
        isInternal: true,
      };
    });

  const items: ActivityItem[] = [...ticketComments, ...ticketEvents].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!text.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    setSubmitting(true);
    // Simulate modest network latency for the submit (per API simulation spec).
    await new Promise((r) => setTimeout(r, 200));
    addComment({
      id: `cmt-${Date.now()}`,
      ticketId,
      authorId: currentUser.id,
      body: text.trim(),
      createdAt: new Date().toISOString(),
    });
    setText("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Activity & Conversation
      </h3>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"
      >
        <TextArea
          id="comment-textarea"
          label={isInternal ? "Internal Note" : "Public Reply"}
          rows={3}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          placeholder={
            isInternal
              ? "Add an internal note (only visible to team)..."
              : "Write a public reply..."
          }
          error={error ?? undefined}
          disabled={submitting}
        />

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span>Internal Note (Private)</span>
          </label>

          <Button
            type="submit"
            size="sm"
            variant={isInternal ? "secondary" : "primary"}
            disabled={submitting || !text.trim()}
          >
            {submitting
              ? "Submitting..."
              : isInternal
                ? "Add Note"
                : "Send Reply"}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No activity yet for this ticket.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${
                item.isInternal
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <span className="text-xs font-bold text-gray-900">
                  {item.author}{" "}
                  {item.isInternal && (
                    <span className="text-yellow-700 font-normal">
                      (Activity)
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function describeEvent(
  type: string,
  metadata?: Record<string, unknown>,
): string {
  switch (type) {
    case "ticket-created":
      return "Ticket was created.";
    case "status-changed":
      return `Status changed to "${String(metadata?.to ?? "unknown")}".`;
    case "priority-changed":
      return `Priority changed to "${String(metadata?.to ?? "unknown")}".`;
    case "assigned":
      return metadata?.assigneeId
        ? `Ticket assigned to ${
            MOCK_USERS.find((u) => u.id === metadata.assigneeId)?.name ||
            "an agent"
          }.`
        : "Ticket unassigned.";
    case "comment-added":
      return "A comment was added.";
    case "ticket-resolved":
      return "Ticket was resolved.";
    default:
      return "Event recorded.";
  }
}
