import React from "react";
import { useParams, Link } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useCustomers } from "../../hooks/useCustomers";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import BackButton from "../../components/ui/BackButton";
import { GoButton } from "../../components/ui/GoButton";

const PLAN_VARIANTS: Record<
  string,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  free: "default",
  starter: "info",
  business: "warning",
  enterprise: "success",
};

export const CustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { tickets } = useTickets();
  const { customers } = useCustomers();

  const customer = customers.find((c) => c.id === customerId);
  const customerTickets = customer
    ? tickets.filter((t) => t.customerId === customer.id)
    : [];

  if (!customer) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Customer Not Found</h2>
        <p className="text-gray-500 text-sm">
          The requested customer does not exist in this dataset.
        </p>
        <Link to="/tickets">
          <BackButton />
        </Link>
      </div>
    );
  }

  const openCount = customerTickets.filter(
    (t) => t.status === "open" || t.status === "in-progress",
  ).length;
  const resolvedCount = customerTickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/tickets"
          className="text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          <BackButton />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        <Badge variant={PLAN_VARIANTS[customer.plan]}>{customer.plan}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Customer Overview" className="lg:col-span-1">
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{customer.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{customer.phone || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Company</dt>
              <dd className="text-gray-900">{customer.company || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Customer Since</dt>
              <dd className="text-gray-900">
                {new Date(customer.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Plan</dt>
              <dd className="capitalize text-blue-600">{customer.plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Active Tickets</dt>
              <dd className="text-gray-900">{openCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Resolved</dt>
              <dd className="text-gray-900">{resolvedCount}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Ticket History" className="lg:col-span-2">
          {customerTickets.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No tickets found for this customer.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {customerTickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-mono text-xs font-bold text-blue-600 hover:underline"
                      >
                        {ticket.id}
                      </Link>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()} ·{" "}
                      <span className="capitalize">
                        {ticket.status.replace("-", " ")}
                      </span>{" "}
                      · <span className="capitalize">{ticket.priority}</span>
                    </p>
                  </div>
                  <Link to={`/tickets/${ticket.id}`} className="shrink-0">
                    <GoButton child="View" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
