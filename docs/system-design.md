# QueueDesk System Design

## 1. Problem Statement

QueueDesk is a browser-based customer-support operations application for a small SaaS company.
The company currently manages customer issues using spreadsheets, email, and informal communication between support agents.This causes:
• Tickets are missed or forgotten.
• Urgent requests are not consistently prioritized.
• Ownership is unclear.
• SLA deadlines are missed.
• Managers cannot quickly understand team workload.
• Historical tickets are difficult to search.
• Support metrics are weak or unavailable.
• Workflow rules are inconsistently applied.
QueueDesk replaces that fragmented workflow with a centralized operational interface.

**Out of scope**: real OAuth, a full production backend, email ingestion, customer chat, payments, AI, microservices, and elaborate notification infrastructure.

## 2. Functional Requirements

- View, search, filter, sort, paginate tickets.
- View ticket details with SLA, description, customer, assignment, comments, and activity.
- Update status (valid transitions), change priority (permission-gated), assign (manager) / claim (agent).
- Add public replies and internal notes.
- Create tickets through a validated form.
- Dashboard KPIs and analytics charts (manager-only).
- Customer profiles with ticket history.
- Role simulation between Agent and Manager personas.

## 3. Non-Functional Requirements

- Type-safe domain model (TypeScript strict, no unexplained `any`).
- Responsive at 360–1440 px with a dedicated mobile layout.
- Keyboard and screen-reader accessibility.
- Loading, empty, error, retry states for every async operation.
- Deterministic mock data; service layer swappable for a real backend.
- Acceptable performance with several thousand client-side records (README §5.2).

## 4. Scale Assumptions

| Dimension       | Assumption                 |
| :-------------- | :------------------------- |
| Support staff   | ~20                        |
| Customers       | ~2,000                     |
| Tickets / day   | 100–300                    |
| Active tickets  | ~2,000                     |
| Historical      | 100,000+ (discussion only) |
| Comments/ticket | 1–20                       |

Portfolio dataset: 75 tickets, 20 customers, 4 users.

## 5. Core Entities

- `User` (role: agent | manager)
- `Customer` (plan: free | starter | business | enterprise)
- `Ticket` (status union, priority union, derived SLA, optional assigneeId, optional resolvedAt)
- `Comment` (authorId, body, createdAt)
- `ActivityEvent` (type union, actorId, metadata)

Relationships: Ticket → Customer (by `customerId`), Ticket → User (assignee, optional), Comment → Ticket, ActivityEvent → Ticket.

## 6. State Ownership

| State            | Owner          | Persisted | Notes                                  |
| :--------------- | :------------- | :-------- | :------------------------------------- |
| Current user     | UserContext    | No        | App-wide; simulated persona            |
| Tickets data     | TicketContext  | Session   | Loaded from `ticketService`            |
| Comments/events  | TicketContext  | Session   | Vended to activity stream              |
| Search/filters   | URL state      | Yes       | Shareable, refresh-safe (ADR-001)      |
| Sort & page size | URL state      | Yes       | Shareable                              |
| Form input       | Form component | No        | Ephemeral                              |
| Derived (SLA…)   | Computation    | No        | `getSLAStatus()` / `isTicketOverdue()` |
| Load state       | TicketContext  | No        | loading/success/error                  |

## 7. Architecture

```
Browser
└─ React Application (Vite + React 19 + Tailwind v4)
   ├─ Router (React Router)              → routes, URL state
   ├─ UI Components (src/components)      → layout, primitives
   ├─ Feature logic (src/features)       → dashboard, tickets, analytics, customers
   ├─ Application State (contexts)       → UserProvider, TicketProvider
   └─ Service/Data layer (src/services)  → ticketService
      └─ Mock latency/failure gate (`VITE_USE_MOCK`) → fetch(API) otherwise
```

## 8. Data-Flow Diagrams

**Read (load tickets)**: mount → `TicketProvider` effect → `ticketService.getTickets()` → latency → resolve array → setState → providers rerender → `useFilteredTickets` derives page → rows render.

**Write (change status)**: select status → `handleStatusChange` → validate transition → `updateTicket` context → map over tickets (immutable) → `addActivityEvent` → rerender list/detail.

**Write (create ticket)**: submit → validate → build `Ticket` → `createTicket` prepends + records activity → navigate to `/tickets/:id` → list reflects it.

**Failure paths**: each write has a documented failure trace — form shows inline error and stays put; comment input re-enables; no rollback needed because state is only mutated on success.

## 9. Component Boundaries

- `TicketDetailPage` → `TicketHeader`-ish (inline), `SLAIndicator`, description `Card`, `TicketActivityStream`, `TicketQuickActions`, Customer `Card`.
- `TicketsPage` → `TicketFilters`, table/cards, `Pagination`, `EmptyState`.
- Boundaries are responsibility-based (per README §5.7), not file-size-based.

## 10. Data/API Boundary

`ticketService` exposes `getTickets`, `getTicket`, `createTicket`, `updateTicket`. UI never touches `fetch` or mock internals, so swapping from mock to REST (or restricting to `VITE_USE_MOCK=false`) requires no component changes (ADR-003).

## 11. Client vs Server Responsibility

Client (portfolio scale): search, filters, sorting, pagination — a pure derived-state pipeline. **When this changes**: beyond roughly 10–20k tickets, server-side pagination with `?status=open&page=2&sort=dueAt` becomes necessary; the service layer is the change boundary (ADR-005).

## 12. Failure Modes

| Failure              | User sees                    | Retry?                      |
| :------------------- | :--------------------------- | :-------------------------- |
| Tickets fail to load | Error EmptyState             | Manual "Retry" → refresh    |
| Ticket update fails  | Optimistic-in-place state    | Reopen edit / manual reload |
| Missing customer     | "N/A" placeholders           | No                          |
| Comment submit fails | Inline error; input retained | Re-submit                   |
| Timeout              | Error state                  | Manual retry                |
| Invalid ticket ID    | "Ticket Not Found" + back    | Navigate back to list       |
| Stale async response | Aborted via AbortController  | N/A                         |

## 13. Performance Hypotheses (validate with profiling)

1. Sorting 10,000 tickets on every render may cause input lag → mitigate with derived-state pipeline + `useMemo`-style derivation only if profiling confirms.
2. Loading the chart library on initial route inflates the bundle → **validated**: bundle was 701 kB; code-split Analytics to 95 kB main + lazy 113 kB chunk.

## 14. Accessibility Considerations

- Semantic landmarks (header, nav, main), real labels, `aria-describedby` on errors.
- Keyboard: all critical actions are native controls (`<select>`, `<button>`, `<a>`).
- Focus: visible `focus:ring`; Modal locks body scroll and closes on `Esc`.
- Color is never the only status signal (text badges accompany colors).

## 15. Security / Trust Boundaries

- UI hiding of manager controls is **not** authorization (README §5.11). A production backend must enforce permissions independently.
- No secrets or credentials are stored client-side; `.env` holds only non-sensitive feature flags (`VITE_USE_MOCK`, `VITE_API_BASE_URL`, `VITE_FAILURE_RATE`).

## 16. Customer Intake — How Customers Submit Requests

Customers do not log into QueueDesk; they contact the help desk through channels **outside** this application. The app models the *result* of that contact: a customer request is **converted into a `Ticket`** by an agent or manager. Intake sources that map to the `Ticket` domain are:

| Channel (external)            | How it becomes a ticket here                         |
| :---------------------------- | :--------------------------------------------------- |
| Email to the support inbox    | A support member creates a ticket and links the customer   |
| Support web form / widget     | Inbound webhook or form handler calls `createTicket`      |
| Phone / chat                 | Agent logs the conversation as a new ticket               |
| CRM / API integration         | `ticketService.createTicket` from the integration layer    |

The end-user UI provided to customers is the **/tickets/new form** — a support member selects the reporting customer (`customerId`), subject, category, priority, optional assignee, and description. On submit the ticket is created at `open` with a 24-hour SLA deadline, and notifications fire (assignment to an agent, new-request alert to managers).

**System-design notes**
- The customer is modeled by `customerId` reference (not embedded) so one customer can span many tickets (§5).
- `createTicket` is the single write boundary for intake; notifications are emitted from it (see §17), so any future intake channel (email ingestion, REST POST) gets the same behavior for free.
- *Explicitly out of scope* (per assignment §14.3): real email ingestion, customer chat server, payments, and AI chatbot.

## 17. Notifications

Replaces the "tickets are missed" business problem with an in-app inbox.

- **Store**: `NotificationsProvider` holds an in-memory `AppNotification[]` (newest first), exposed via `useNotifications`. Dedup by `id`; the daily-summary seed is guarded per manager and per local day.
- **Assignment** → `ticket-assigned`: emitted in `TicketQuickActions` when a manager assigns a ticket (self-claims are skipped).
- **New request** → `new-ticket`: emitted in `NewTicketPage` for every manager when a customer request is converted into a ticket; the assignee (if any) also gets `ticket-assigned`.
- **Daily summary** → `daily-summary`: seeded once per day on app load for each manager from `computeDailySummaryStats` (completed today, new today, active, overdue, critical open, avg resolution).
- **UI**: `/notifications` page (mark-as-read, mark-all, unread dot), header bell with unread count, sidebar + mobile "Alerts" nav.
- **Trust boundary**: client-side notification recipients are informational only; server-side enforcement would be required in production (§15).
