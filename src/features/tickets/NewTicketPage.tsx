import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import {
  MOCK_CUSTOMERS,
  CATEGORIES_LIST,
  MOCK_AGENTS,
} from "../../mocks/generator";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { TextArea } from "../../components/ui/TextArea";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import type { TicketPriority } from "../../types";

interface FormErrors {
  customerId?: string;
  subject?: string;
  description?: string;
  category?: string;
}

const SUBJECT_MIN = 5;
const SUBJECT_MAX = 120;
const DESCRIPTION_MIN = 20;

export const NewTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, createTicket } = useTickets();

  const [customerId, setCustomerId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bug Report");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerId) {
      newErrors.customerId = "Please select a customer";
    }
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (subject.trim().length < SUBJECT_MIN) {
      newErrors.subject = `Subject must be at least ${SUBJECT_MIN} characters`;
    } else if (subject.trim().length > SUBJECT_MAX) {
      newErrors.subject = `Subject must be at most ${SUBJECT_MAX} characters`;
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < DESCRIPTION_MIN) {
      newErrors.description = `Description must be at least ${DESCRIPTION_MIN} characters`;
    }
    if (!category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date();
    const newId = `TICK-${1000 + tickets.length + 1}`;
    const dueAt = new Date(now.getTime() + 24 * 3600000).toISOString();

    const newTicket = {
      id: newId,
      subject: subject.trim(),
      description: description.trim(),
      customerId,
      assigneeId: assigneeId || undefined,
      status: "open" as const,
      priority,
      category,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : ["support"],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueAt,
    };

    createTicket(newTicket);
    navigate(`/tickets/${newId}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/tickets"
          className="text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <Select
              id="customer"
              label={
                <>
                  Customer <span className="text-red-500">*</span>
                </>
              }
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              error={errors.customerId}
            >
              <option value="">Select a customer...</option>
              {MOCK_CUSTOMERS.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.plan})
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Subject"
            placeholder="Brief description of the issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
            id="subject"
            maxLength={SUBJECT_MAX}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="category"
              label={
                <>
                  Category <span className="text-red-500">*</span>
                </>
              }
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Select
              id="priority"
              label={
                <>
                  Priority <span className="text-red-500">*</span>
                </>
              }
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </div>

          <Select
            id="assignee"
            label={
              <>
                Assignee <span className="text-gray-400">(Optional)</span>
              </>
            }
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {MOCK_AGENTS.filter((u) => u.role === "agent").map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>

          <TextArea
            id="description"
            label={
              <>
                Description <span className="text-red-500">*</span>
              </>
            }
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed information about the issue..."
            error={errors.description}
          />

          <Input
            label="Tags (Optional, comma-separated)"
            placeholder="e.g. billing, urgent, api"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            id="tags"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link to="/tickets">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary">
              Create Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
