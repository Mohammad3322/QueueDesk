import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useUser } from "../../hooks/useUser";
import { useUsers } from "../../hooks/useUsers";
import { useNotifications } from "../../hooks/useNotifications";
import { useCustomers } from "../../hooks/useCustomers";
import { canManageUsers } from "../../utils/permissions";
import {
  buildNewTicketNotification,
  buildTicketAssignedNotification,
} from "../../utils/notifications";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { TextArea } from "../../components/ui/TextArea";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import type { CustomerPlan, TicketPriority } from "../../types";
import {
  DEFAULT_TAG,
  DEFAULT_TICKET_CATEGORY,
  DEFAULT_TICKET_PRIORITY,
  DESCRIPTION_MIN_LENGTH,
  SUBJECT_MAX_LENGTH,
  SUBJECT_MIN_LENGTH,
  TICKET_CATEGORIES,
} from "../../constants";
import BackButton from "../../components/ui/BackButton";

interface FormErrors {
  customerId?: string;
  subject?: string;
  description?: string;
  category?: string;
  newCustomerName?: string;
  newCustomerEmail?: string;
}

const NEW_CUSTOMER_OPTION = "__new__";
const CUSTOMER_PLANS: CustomerPlan[] = [
  "free",
  "starter",
  "business",
  "enterprise",
];

export const NewTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tickets, createTicket } = useTickets();
  const { currentUser } = useUser();
  const { users } = useUsers();
  const { customers, createCustomer } = useCustomers();
  const { addNotification } = useNotifications();

  // Pre-select a customer when arriving from a "new customer request"
  // notification (e.g. /tickets/new?customer=customer-42).
  const prefillCustomerId = customers.some(
    (c) => c.id === searchParams.get("customer"),
  )
    ? (searchParams.get("customer") as string)
    : "";

  const [customerId, setCustomerId] = useState(prefillCustomerId);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerPlan, setNewCustomerPlan] =
    useState<CustomerPlan>("starter");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(DEFAULT_TICKET_CATEGORY);
  const [priority, setPriority] = useState<TicketPriority>(
    DEFAULT_TICKET_PRIORITY,
  );
  const [assigneeId, setAssigneeId] = useState("");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isNewCustomer = customerId === NEW_CUSTOMER_OPTION;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerId) {
      newErrors.customerId = "Please select a customer";
    }
    if (isNewCustomer) {
      if (!newCustomerName.trim()) {
        newErrors.newCustomerName = "Customer name is required";
      }
      if (!newCustomerEmail.trim()) {
        newErrors.newCustomerEmail = "Customer email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomerEmail.trim())) {
        newErrors.newCustomerEmail = "Enter a valid email address";
      } else if (
        customers.some(
          (c) =>
            c.email.toLowerCase() === newCustomerEmail.trim().toLowerCase(),
        )
      ) {
        newErrors.newCustomerEmail =
          "A customer with this email already exists. Select them from the list above.";
      }
    }
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (subject.trim().length < SUBJECT_MIN_LENGTH) {
      newErrors.subject = `Subject must be at least ${SUBJECT_MIN_LENGTH} characters`;
    } else if (subject.trim().length > SUBJECT_MAX_LENGTH) {
      newErrors.subject = `Subject must be at most ${SUBJECT_MAX_LENGTH} characters`;
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < DESCRIPTION_MIN_LENGTH) {
      newErrors.description = `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`;
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

    let resolvedCustomerId = customerId;
    if (isNewCustomer) {
      resolvedCustomerId = createCustomer({
        name: newCustomerName,
        email: newCustomerEmail,
        phone: newCustomerPhone,
        company: newCustomerCompany,
        plan: newCustomerPlan,
      }).id;
    }

    const newTicket = {
      id: newId,
      subject: subject.trim(),
      description: description.trim(),
      customerId: resolvedCustomerId,
      assigneeId: assigneeId || undefined,
      status: "open" as const,
      priority,
      category,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [DEFAULT_TAG],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueAt,
    };

    createTicket(newTicket);

    const customer = customers.find((c) => c.id === resolvedCustomerId);
    const assignee = assigneeId
      ? users.find((u) => u.id === assigneeId)
      : undefined;

    users.filter(canManageUsers).forEach((manager) =>
      addNotification(
        buildNewTicketNotification({
          ticket: newTicket,
          manager,
          customerName: customer?.name ?? "A customer",
        }),
      ),
    );

    if (assignee && assigneeId !== currentUser.id) {
      addNotification(
        buildTicketAssignedNotification({
          ticket: newTicket,
          assignee,
          actorName: currentUser.name,
        }),
      );
    }

    navigate(`/tickets/${newId}`);
  };

  return (
    <>
      <Link to="/tickets">
        <BackButton />
      </Link>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Ticket
          </h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
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
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.plan})
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 sm:mt-6"
                  onClick={() =>
                    setCustomerId(
                      isNewCustomer ? "" : NEW_CUSTOMER_OPTION,
                    )
                  }
                >
                  {isNewCustomer ? "Cancel New Customer" : "Add New Customer"}
                </Button>
              </div>
            </div>

            {isNewCustomer && (
              <div className="space-y-4 p-4 border border-dashed border-blue-300 bg-blue-50/40 rounded-xl">
                <p className="text-sm font-semibold text-blue-800">
                  New Customer Details
                </p>
                <Input
                  id="new-customer-name"
                  label="Customer Name *"
                  placeholder="e.g. Acme Corp"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  error={errors.newCustomerName}
                />
                <Input
                  id="new-customer-email"
                  label="Customer Email *"
                  placeholder="e.g. contact@acme.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  error={errors.newCustomerEmail}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="new-customer-company"
                    label="Company (Optional)"
                    placeholder="e.g. Acme Corporation"
                    value={newCustomerCompany}
                    onChange={(e) => setNewCustomerCompany(e.target.value)}
                  />
                  <Input
                    id="new-customer-phone"
                    label="Phone (Optional)"
                    placeholder="e.g. +1 555 000 1234"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                  />
                </div>
                <Select
                  id="new-customer-plan"
                  label="Plan"
                  value={newCustomerPlan}
                  onChange={(e) =>
                    setNewCustomerPlan(e.target.value as CustomerPlan)
                  }
                >
                  {CUSTOMER_PLANS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan[0].toUpperCase() + plan.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <Input
              label="Subject"
              placeholder="Brief description of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={errors.subject}
              id="subject"
              maxLength={SUBJECT_MAX_LENGTH}
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
                {TICKET_CATEGORIES.map((cat) => (
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
              {users
                .filter((u) => u.role === "agent")
                .map((u) => (
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
    </>
  );
};
