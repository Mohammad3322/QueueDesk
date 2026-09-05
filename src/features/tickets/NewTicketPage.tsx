import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { MOCK_CUSTOMERS } from "../../mocks/generator";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { TicketPriority } from "../../types";

interface FormErrors {
  customerId?: string;
  subject?: string;
  description?: string;
  category?: string;
}

export const NewTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, updateTicket } = useTickets();

  const [customerId, setCustomerId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bug Report");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerId) {
      newErrors.customerId = "Please select a customer";
    }
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newTicketId = `TICK-${1000 + tickets.length + 1}`;
    const now = new Date();
    const dueAt = new Date(now.getTime() + 24 * 3600000).toISOString();

    const newTicket = {
      id: newTicketId,
      subject,
      description,
      customerId,
      status: "open" as const,
      priority,
      category,
      tags: ["support", category.toLowerCase().replace(" ", "-")],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueAt,
    };

    // إضافة التذكرة القائمة
    updateTicket(newTicketId, newTicket);

    // التوجيه إلى قائمة التذاكر
    navigate("/tickets");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اختيار العميل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 ${
                errors.customerId
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            >
              <option value="">Select a customer...</option>
              {MOCK_CUSTOMERS.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.plan})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>
            )}
          </div>

          {/* العنوان */}
          <Input
            label="Subject"
            placeholder="Brief description of the issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
          />

          {/* الفئة والأولوية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="Billing">Billing</option>
                <option value="Account Access">Account Access</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Question">Feature Question</option>
                <option value="Integration">Integration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* التفاصيل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the issue..."
              className={`w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* أزرار الإجراءات */}
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
