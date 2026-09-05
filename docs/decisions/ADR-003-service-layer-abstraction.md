# ADR 003: Service-Layer Abstraction over Mock Data

## Context

UI components must not care whether data ultimately comes from localStorage, JSON, a REST API, a mock HTTP server, or Supabase. The mock-data backend and the eventual real API need to be swappable without touching components or state management.

## Options Considered

1. Components call the data source directly (fetch or mock module imports).
2. A `TicketContext` reads mock data synchronously via `useState(MOCK_TICKETS)`.
3. A dedicated `ticketService` module exposing an async, Promise-based interface, consumed by the shared context.

## Chosen Approach

A dedicated `ticketService` module (`src/services/api/ticketService.ts`) exposing `getTickets`, `getTicket`, `createTicket`, `updateTicket`, and `exportToCSV`. The service is gated by `VITE_USE_MOCK`; when `false`, it uses `fetch` against `VITE_API_BASE_URL`. The `TicketProvider` consumes the service and exposes loaded tickets plus loading/error/retry state through context.

## Reasoning

Matching the README requirement that "the service layer exists to make that infrastructure replaceable," this centralizes latency simulation, error handling, and the switch point between mocked and real infrastructure. Components depend only on the context contract (functional requirements), not on storage details.

## Tradeoffs

- Adds a first asynchronous boundary: tickets arrive after latency, so loading and error states are mandatory everywhere.
- The in-memory mock store is not a real durable backend; page refreshes reset created tickets.

## Reconsider When

- A real backend ships with pagination/server-side search. At that point the service interface gains query parameters (page, filters) and the context must stop loading the full dataset.
- Multiple frontend teams coordinate on an OpenAPI contract; the service could be generated instead of handwritten.