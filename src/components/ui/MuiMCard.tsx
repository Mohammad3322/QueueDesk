import type { ReactNode } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Button as MyButton } from "../../components/ui/Button";

import Box from "@mui/material/Box";
import { Link as RouterLink } from "react-router-dom";
// import { Badge } from "./Badge";

export type TicketCardTicket = {
  id: string;
  subject: string;
  customerId: string;
};

export type TicketCardProps = {
  ticket: TicketCardTicket;
  customerName?: string;
  slaBadge?: ReactNode;
  priorityBadge?: "default" | "success" | "warning" | "danger" | "info";
  canDelete?: boolean;
  onDeleteRequest: (ticketId: string) => void;
};

export function TicketCard({
  ticket,
  customerName,
  slaBadge,
  // priorityBadge,
  canDelete,
  onDeleteRequest,
}: TicketCardProps) {
  return (
    <Card
      component="article"
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: 3,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        transition: "box-shadow 160ms ease, transform 160ms ease",
        "&:hover": {
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2,
          pt: 2,
        }}
      >
        <RouterLink
          to={`/tickets/${ticket.id}`}
          className="font-mono text-xs font-bold text-blue-600 hover:underline"
        >
          <Typography
            component="span"
            variant="overline"
            sx={{
              color: "primary.main",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            {ticket.id}
          </Typography>
        </RouterLink>
        {slaBadge}
      </Box>

      <CardContent sx={{ px: 2, py: 1.5 }}>
        <Link
          component={RouterLink}
          to={`/tickets/${ticket.id}`}
          color="text.primary"
          underline="hover"
          sx={{
            display: "block",
            fontSize: "1.05rem",
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {ticket.subject}
        </Link>
      </CardContent>

      <CardActions
        disableSpacing
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          borderTop: 1,
          borderColor: "grey.100",
          px: 2,
          py: 1.5,
        }}
      >
        <Link
          component={RouterLink}
          to={`/customers/${ticket.customerId}`}
          color="text.secondary"
          underline="hover"
          sx={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.8rem",
          }}
        >
          {customerName}
        </Link>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {canDelete && (
            <>
              {/* <Button
                variant="outlined"
                color="inherit"
                size="small"
                aria-label={`Delete ${ticket.id}`}
                onClick={() => onDeleteRequest(ticket.id)}
                sx={{
                  minWidth: "auto",
                  color: "text.secondary",
                  borderColor: "divider",
                  textTransform: "none",
                  "&:hover": {
                    color: "error.main",
                    borderColor: "error.light",
                    bgcolor: "error.50",
                  },
                }}
              >
                Delete
              </Button> */}
              <MyButton
                variant="dangerOutline"
                size="sm"
                title={`Delete ${ticket.id}`}
                aria-label={`Delete ${ticket.id}`}
                onClick={() => onDeleteRequest(ticket.id)}
              >
                <DeleteOutlinedIcon />
              </MyButton>
            </>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
