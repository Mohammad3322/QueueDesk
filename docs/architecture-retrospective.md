# Architecture Retrospective

## What Worked

- **Service-layer abstraction (ADR-003)**: introducing an async loading boundary early forced the loading/error/retry states to be first-class everywhere. This matched the README's failure-design requirement and made the subsequent error-UI work cheap.
- **URL-backed filters (ADR-001)**: filters, sort, page size, and page surviving refresh/back/forward is a genuinely valuable property for a support tool and produced very little extra code.
- **Derived SLA state (ADR-002)**: keeping `isOverdue`/`getSLAStatus` as pure functions avoided a class of "flipped boolean" bugs and made boundary testing straightforward (25+ SLA assertions in `ticketHelpers.test.ts`).
- **Permission functions outside JSX**: `canAssignTicket`, `canEditTicket`, `canClaimTicket`, `canChangePriority`, `canViewAnalytics` are pure and unit-tested; the Quick Actions component reads them instead of scattering `role === "manager"` through JSX.

## What Did Not Work / Was Incorrectly Assumed

- **Ticket creation via `updateTicket`**: the original `NewTicketPage` called `updateTicket(newId, …)`, which only mapped over existing IDs and silently dropped the new ticket. Caught during QA; fixed by adding a dedicated `createTicket` that prepends and records an activity event.
- **Two competing `MOCK_USERS` modules**: `mocks/users.ts` and `mocks/generator.ts` defined incompatible user IDs, which broke the header's persona dropdown value. Consolidation into a single source of truth fixed it.
- **Headless async load was under-considered**: making the provider load tickets asynchronously breaks the naive assumption that `getTicketById` always returns a ticket; the ticket-detail route needed an explicit loading branch to avoid flashing "Ticket Not Found".

## Premature / Insufficient Abstractions

- **`useTicketUrlParams.ts`** duplicated the parsing already done by `useFilteredTickets`; it remained unused. The simpler read-path hook in `useFilteredTickets` was sufficient.
- **Modal & EmptyState** were built in Phase 1 as reusable primitives but sat unused for most of the session. EmptyState eventually earned its keep for load/error/missing-ticket states, while Modal remains an unused README-listed primitive (§6.5) with focus-trap support — a reminder that primitives should be built to solve a real, current reuse need, and that an unneeded primitive should be wired into a workflow or dropped (README §6.5).

## Component Growth

- `TicketsPage` carries both the desktop table and the mobile card list plus three badge-mapping helpers. At some point the table row and card should move into dedicated components (`TicketTableRow`, `TicketCard`) to keep the page readable and testable in isolation.

## What Would Change at Larger Scale

- **500,000 tickets**: client-side loading is infeasible. Server-side filtering/sorting/pagination, cursor-based pagination, and virtualization for the table (only after evidence; README §5.10).
- **Real backend**: the service layer swaps mock for REST without component changes (ADR-003). Comments/activity events would live server-side; optimistic updates with rollback would be needed.
- **Real-time updates**: WebSocket or SSE events would append to the context alongside the HTTP data source; stale-response protection (AbortController) already accounts for out-of-order responses.
- **Multiple frontend teams**: shared, generated API types would replace hand-rolled `Ticket`/`Comment` interfaces to prevent drift.