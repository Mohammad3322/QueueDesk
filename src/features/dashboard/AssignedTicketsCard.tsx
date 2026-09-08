import React from "react";
import MuiCard from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useUser } from "../../hooks/useUser";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  ACTIVE_TICKET_STATUSES,
  APP_ROUTES,
  PRIORITY_WEIGHTS,
} from "../../constants";
import { isTicketOverdue, getSLAStatus } from "../../utils/ticketHelpers";
import type { Ticket, TicketPriority } from "../../types";

/**
 * Tickets assigned to the current user that still need their attention
 * (anything not resolved or closed). Sorted by priority weight, then by SLA
 * deadline so urgent work surfaces first.
 */
const myAttentionTickets = (tickets: Ticket[], userId: string): Ticket[] => {
  return tickets
    .filter(
      (t) =>
        t.assigneeId === userId && ACTIVE_TICKET_STATUSES.includes(t.status),
    )
    .sort(
      (a, b) =>
        PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority] ||
        new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );
};

const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const PRIORITY_CHIP_COLOR: Record<
  TicketPriority,
  "default" | "info" | "warning" | "error"
> = {
  low: "default",
  medium: "info",
  high: "warning",
  critical: "error",
};

interface Props {
  className?: string;
}

export const AssignedTicketsCard: React.FC<Props> = ({ className }) => {
  const { tickets } = useTickets();
  const { currentUser } = useUser();

  const assigned = myAttentionTickets(tickets, currentUser.id);
  const shown = assigned.slice(0, 5);

  return (
    <Card
      title={`My Tickets (${assigned.length} need${assigned.length === 1 ? "s" : ""} attention)`}
      titleStyle={`text-white`}
      className={`space-y-4  ${className}`}
    >
      {shown.length > 0 ? (
        <ul className="space-y-3">
          {shown.map((ticket) => {
            const isOverdue = isTicketOverdue(ticket);
            const sla = getSLAStatus(ticket);
            return (
              <li key={ticket.id}>
                <MuiCard
                  variant="outlined"
                  sx={{
                    width: "100%",
                    borderRadius: 3,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                    transition:
                      "box-shadow 160ms ease, transform 160ms ease",
                    "&:hover": {
                      boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardActionArea
                    component={RouterLink}
                    to={`${APP_ROUTES.tickets}/${ticket.id}`}
                    sx={{ "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <CardContent
                      sx={{
                        px: 2.25,
                        py: 2,
                        "&:last-child": { pb: 2 },
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          mb: 0.75,
                          gap: 1,
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="overline"
                          sx={{
                            color: "primary.main",
                            fontFamily: MONO_FONT,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            lineHeight: 1,
                          }}
                        >
                          {ticket.id}
                        </Typography>
                        {isOverdue ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : sla === "due-soon" ? (
                          <Badge variant="warning">Due Soon</Badge>
                        ) : null}
                      </Stack>

                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          lineHeight: 1.35,
                          color: "text.primary",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {ticket.subject}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          mt: 1.5,
                          flexWrap: "wrap",
                          rowGap: 0.5,
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={ticket.priority}
                          size="small"
                          color={PRIORITY_CHIP_COLOR[ticket.priority]}
                          sx={{
                            textTransform: "capitalize",
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Due{" "}
                          {new Date(ticket.dueAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </MuiCard>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 py-4 text-center">
          You have no open tickets assigned to you. Claim an unassigned ticket
          or wait for a new assignment.
        </p>
      )}
    </Card>
  );
};