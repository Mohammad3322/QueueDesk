import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useCustomers } from "../../hooks/useCustomers";
import { MOCK_USERS } from "../../mocks/generator";
import { SLAIndicator } from "./SLAIndicator";
import { TicketQuickActions } from "./TicketQuickActions";
import { TicketActivityStream } from "./TicketActivityStream";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import BackButton from "../../components/ui/BackButton";
import { GoButton } from "../../components/ui/GoButton";

export const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { getTicketById, loadState } = useTickets();
  const { customers } = useCustomers();

  const ticket = ticketId ? getTicketById(ticketId) : undefined;
  const customer = ticket
    ? customers.find((c) => c.id === ticket.customerId)
    : undefined;
  const assignee = ticket?.assigneeId
    ? MOCK_USERS.find((u) => u.id === ticket.assigneeId)
    : undefined;

  if (loadState === "loading" && !ticket) {
    return (
      <Spinner
        label={`Loading ticket ${ticketId}...`}
        className="bg-white border border-gray-200 rounded-xl"
      />
    );
  }

  if (!ticket) {
    return (
      <EmptyState
        title={`Ticket ${ticketId} Not Found`}
        description="The requested ticket does not exist or has been removed."
        actionLabel="Go to tickets"
        onAction={() => navigate("/tickets")}
      />
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <Link to="/tickets">
        <BackButton />
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.id}</h1>
          <span className="capitalize text-sm text-gray-500">
            {ticket.category}
          </span>
        </div>
        {customer && (
          <Link
            to={`/customers/${customer.id}`}
            className="text-xs font-medium text-blue-600"
          >
            <GoButton child="Go" />
          </Link>
        )}
      </div>

      <SLAIndicator ticket={ticket} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={ticket.subject}>
            <p className="text-gray-700 text-sm leading-relaxed">
              {ticket.description}
            </p>
            {ticket.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {ticket.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <TicketActivityStream ticketId={ticket.id} />
        </div>

        <div className="space-y-6">
          <TicketQuickActions ticket={ticket} />

          <Card title="Customer Overview">
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                <Link
                  to={`/customers/${customer?.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {customer?.name || "N/A"}
                </Link>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                <span className="text-gray-700">
                  {customer?.email || "N/A"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Plan:</span>{" "}
                <span className="capitalize font-medium text-blue-600">
                  {customer?.plan || "N/A"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Assignee:</span>{" "}
                <span className="text-gray-700">
                  {assignee?.name || "Unassigned"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Created:</span>{" "}
                <span className="text-gray-700">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Updated:</span>{" "}
                <span className="text-gray-700">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
