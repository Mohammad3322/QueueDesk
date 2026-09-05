import React from "react";
import { useParams, Link } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { MOCK_CUSTOMERS } from "../../mocks/generator";
import { SLAIndicator } from "./SLAIndicator";
import { TicketQuickActions } from "./TicketQuickActions";
import { TicketActivityStream } from "./TicketActivityStream";
import { Card } from "../../components/ui/Card";

export const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { getTicketById } = useTickets();

  const ticket = ticketId ? getTicketById(ticketId) : undefined;
  const customer = ticket
    ? MOCK_CUSTOMERS.find((c) => c.id === ticket.customerId)
    : undefined;

  if (!ticket) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Ticket Not Found</h2>
        <p className="text-gray-500 text-sm">
          The requested ticket {ticketId} does not exist or has been removed.
        </p>
        <Link
          to="/tickets"
          className="inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/tickets"
            className="text-xs font-semibold text-gray-500 hover:text-gray-900"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{ticket.id}</h1>
        </div>
      </div>

      <SLAIndicator ticket={ticket} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={ticket.subject}>
            <p className="text-gray-700 text-sm leading-relaxed">
              {ticket.description}
            </p>
          </Card>

          <TicketActivityStream initialDescription={ticket.description} />
        </div>

        <div className="space-y-6">
          <TicketQuickActions ticket={ticket} />

          <Card title="Customer Overview">
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                <strong className="text-gray-900">
                  {customer?.name || "N/A"}
                </strong>
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
