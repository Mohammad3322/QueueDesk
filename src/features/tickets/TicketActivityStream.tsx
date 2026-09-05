import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { useUser } from "../../hooks/useUser";

interface Message {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isInternal: boolean;
}

export const TicketActivityStream: React.FC<{ initialDescription: string }> = ({
  initialDescription,
}) => {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      author: "Customer",
      text: initialDescription,
      timestamp: new Date().toISOString(),
      isInternal: false,
    },
  ]);

  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      author: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
      isInternal,
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Activity & Conversation
      </h3>

      {/* نموذج إضافة تعليق */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"
      >
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isInternal
              ? "Add an internal note (only visible to team)..."
              : "Write a public reply..."
          }
          className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          >
            {isInternal ? "Add Note" : "Send Reply"}
          </Button>
        </div>
      </form>

      {/* عرض الرسائل */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl border ${
              msg.isInternal
                ? "bg-yellow-50 border-yellow-200"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-900">
                {msg.author}{" "}
                {msg.isInternal && (
                  <span className="text-yellow-700 font-normal">
                    (Internal Note)
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {msg.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
