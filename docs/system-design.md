# QueueDesk — System Design

This document explains how QueueDesk is designed and why. I wrote it as my "design doc" — the thing I look back at to remember what I decided and what the tradeoffs were. I tried to write it simply, like I'd explain it to a teammate.

---

## 1. Problem statement

A small SaaS company manages customer support with spreadsheets and email. That causes real problems:

- Tickets get missed or forgotten.
- Urgent requests aren't prioritized consistently.
- Nobody knows who owns a ticket.
- SLA deadlines slip because nothing tracks them.
- Managers can't quickly see how busy their team is.
- There are no support metrics.

**The solution:** QueueDesk, a browser app where agents and managers track, triage, and resolve tickets in one place.

### What's explicitly out of scope

This is a frontend portfolio project, so these things are **not** included (they're listed in the project description too):

- Real authentication / OAuth (login is simulated)
- A real backend / production API
- Email ingestion
- A customer chat server
- Payments
- An AI chatbot
- Microservices / Kubernetes
- Real (server-side) notification infrastructure

Anything in that list is done with mocks and simulations here.

---

## 2. Functional requirements

What the app actually lets you do:

| Area | Requirement |
| ---- | ----------- |
| Tickets | View a list of all tickets |
| Search | Search by ticket ID, subject, or customer name |
| Filter | Filter by status, priority, category, assignee, SLA |
| Sort | Sort by created date, due date, priority, customer name |
| Pagination | Page through results (10 / 20 / 50 per page) |
| Ticket detail | View description, customer, SLA, activity history |
| Update ticket | Change status, priority, and assignee (if you're allowed) |
| Create ticket | Form with validation for customer, subject, description, etc. |
| Comments | Add internal comments to a ticket |
| SLA | Show whether a ticket is on track, due soon, overdue, or done |
| Dashboard | KPI cards: open, critical, overdue, resolved today, avg resolution time |
| Analytics | Manager-only charts of tickets by status / priority (and more) |
| Roles | Agent and Manager with different permissions |
| Login / Logout | User must sign in to use the app |
| Persistence | Session + data survive a page refresh (localStorage) |
| Notifications | Alert when assigned, when new request, daily summary for managers; clicking a new-request notification opens the Add Ticket form with that customer pre-selected |
| Customers | View basic customer info from a ticket; create customers inline from the Add Ticket form (persisted in localStorage) |
| Users (manager) | Manager can view, create, edit, and delete users |

---

## 3. Non-functional requirements

Not "what it does" but "how it should behave":

- **Responsive** — works on phones (360px) up to large desktops (1440px).
- **Keyboard accessible** — you can complete workflows without a mouse.
- **Type safe** — strict TypeScript; invalid states should be compile errors.
- **Maintainable** — a clear separation between UI, logic, and data.
- **Replaceable data layer** — the UI shouldn't care if data comes from a mock or a real API.
- **Performance** — still smooth with ~2,000 tickets; filter/sort/search stress-tested with 10,000.
- **Reliable under failure** — loading, error, empty, and retry states everywhere.

---

## 4. Scale assumptions

These are the assumptions the design is based on (from the project description):

| Thing | Assumption |
| ----- | ---------- |
| Support employees | ~20 |
| Customers | ~2,000 |
| Tickets per day | 100–300 |
| Active tickets | ~2,000 |
| Historical tickets | 100,000+ (in a real production discussion) |
| Comments per ticket | 1–20 |

The design works fine for thousands of tickets **in the browser**. If the real dataset got huge, some decisions (client-side filtering, loading everything into memory) would need to change — see section 11.

---

## 5. Core entities and relationships

The main types live in `src/types/index.ts`.

### User

- `id`, `name`, `email`, `password`, `role`
- `role` is `"agent" | "manager"`
- A user can own tickets (as assignee), comment, and do actions depending on role.

### Customer

- `id`, `name`, `company`, `email`, `phone`, `plan`, `createdAt`
- **A customer has many tickets.** Tickets store `customerId` (a reference), not the whole customer. That way, customer data isn't copied into every ticket, and we look the customer up when we need it.
- **Owned by `CustomersProvider`** (a global store like tickets). It seeds from `queuedesk_customers` merged with the 20 `MOCK_CUSTOMERS` (deduped by ID), and `createCustomer` **dedupes by email case-insensitively** — re-entering an existing email returns the existing customer instead of creating a duplicate.

### Ticket

- `id`, `subject`, `description`, `customerId`, `assigneeId?`, `status`, `priority`, `category`, `tags`, `createdAt`, `updatedAt`, `dueAt`, `resolvedAt?`
- `status` is a union type: `open | in-progress | waiting-on-customer | resolved | closed`
- `priority` is a union type: `low | medium | high | critical`

### Comment

- `id`, `ticketId`, `authorId`, `body`, `createdAt`
- A comment belongs to one ticket.

### ActivityEvent

- `id`, `ticketId`, `type`, `actorId`, `createdAt`, `metadata?`
- Types: created, status-changed, priority-changed, assigned, comment-added, ticket-resolved
- This is the "what happened" timeline under a ticket.

### Relationships

```
User 1───* Ticket      (a ticket has one assignee, a user can own many)
Customer 1───* Ticket  (a ticket belongs to one customer)
Ticket 1───* Comment   (a ticket has 0–many comments)
Ticket 1───* ActivityEvent
```

### What is derived (not stored)?

Some values are always **computed**, because storing them would just create duplicate data that can drift:

- `isOverdue` → computed from `dueAt`
- SLA status → computed from `dueAt` and `status`
- Ticket age → computed from `createdAt`
- Filtered/sorted/paginated lists → computed from the ticket array
- Dashboard counts → computed from the ticket array

The rule: **authoritative state lives in one place; everything else is derived.**

---

## 6. Application state inventory and ownership

The state ownership matrix from the project description (this is exactly what's implemented).

| State | Where it lives | Why | Survives refresh? |
| ----- | -------------- | --- | ----------------- |
| Current user + login | `UserContext` (global) | Needed by almost everything | Yes (localStorage) |
| Tickets / comments / activity | `TicketProvider` (global) | Shared and edited from many pages | Yes (localStorage) |
| Customers | `CustomersProvider` (global) | Resolved by ticket pages; created inline from the ticket form | Yes (localStorage) |
| Notifications | `NotificationsProvider` | Generated all over the app | Yes (localStorage) |
| Search term, filters, sort, page | **URL search params** | Shareable, survives back/forward | Yes (it's the URL) |
| Create-ticket form fields | Local `useState` in the form | Just temporary input | No |
| Modal open / closed | Local component state | Ephemeral UI | No |
| Overdue counts, visible rows | Derived (computed) | Don't store what you can compute | N/A |

### Why filters live in the URL, not in Context

If a manager filters tickets and wants to send the view to a coworker, or refresh the page and keep the same view, that only works if the filters are in the URL:

```
/tickets?status=open&priority=critical&sort=dueAt&order=asc&page=2
```

If filters were React state, they'd be lost on refresh and not shareable. So the ticket page reads everything from `useSearchParams()`.

### The provider stacking (in `App.tsx`)

```
UserProvider
  └─ UsersProvider
      └─ CustomersProvider
          └─ TicketProvider
              └─ NotificationsProvider
                  └─ Router + Routes
```

Order matters:

- `UserProvider` is outermost because everything needs the logged-in user.
- `CustomersProvider` sits above `TicketProvider` because ticket pages resolve customer names from the store.
- `NotificationsProvider` is innermost because it **needs** the users and tickets lists to build the daily summary.

---

## 7. High-level architecture diagram

```
┌─────────────────────────── Browser ───────────────────────────┐
│                                                               │
│  React Application                                            │
│  ┌────────────┐  ┌──────────────┐  ┌────────────┐            │
│  │  Routing   │  │  UI          │  │  Feature   │            │
│  │  (Router)  │→ │  Components  │→ │  Logic     │            │
│  └────────────┘  └──────────────┘  └────────────┘            │
│         │                                 │                   │
│         │                             ┌───────────┐          │
│         │                             │  App      │          │
│         ▼                             │  State    │          │
│  ┌────────────────────┐               │  (Context)│          │
│  │  Service / Data    │◄──────────────└───────────┘          │
│  │  Layer             │                                       │
│  └────────────────────┘                                       │
│         │                                                       │
│  ┌──────▼────────────────────────────┐                         │
│  │ Mock API / Mock Data Store        │                         │
│  │ (seeded generator + localStorage) │                         │
│  └───────────────────────────────────┘                         │
└───────────────────────────────────────────────────────────────┘
```

Each layer has one job:

- **Routing** — maps URLs to pages.
- **UI Components** — render stuff; no business rules inside JSX.
- **Feature Logic** — page components that wire data + UI together.
- **App State** — Context providers hold global state.
- **Service/Data Layer** — the only place that "talks to the server" (or mock).
- **Mock store** — generates fake data and persists to localStorage.

---

## 8. Data-flow diagrams

### Read path — loading the ticket list

```
User opens /tickets
        │
        ▼
TicketProvider mounts → ticketService.getTickets()
        │                     │
        │               (mock: 300–1200ms delay,
        │                maybe a random failure)
        │                     │
        ◄─────────────────────┘
        │
        ▼
tickets stored in Context state
        │
        ▼
Page reads URL params (search/filter/sort/page)
        │
        ▼
applyTicketPipeline(tickets, params)  →  search → filter → sort → paginate
        │
        ▼
rows render (table on desktop, cards on mobile)
```

### Write path — changing a ticket's status

```
User picks a new status in Quick Actions
        │
        ▼
validate: is this a legal transition?  (ALLOWED_TRANSITIONS)
        │  no → option not even shown
        ▼  yes
updateTicket(ticketId, { status, resolvedAt? })
        │
        ├─► update Context state → UI re-renders
        ├─► save to localStorage
        └─► append an ActivityEvent → timeline updates
```

**Failure path for writes:** if the mock API fails, the user sees an error message and the previous UI stays on screen (we don't wipe state on error).

---

## 9. Component-boundary plan

### Ticket detail page — broken into small pieces

```
TicketDetailPage
  ├─ BackButton
  ├─ SLAIndicator          → shows on-track / due-soon / overdue / completed
  ├─ Card (subject + description + tags)
  ├─ TicketActivityStream  → comments + events timeline
  ├─ TicketQuickActions    → status / priority / assignee controls
  └─ Card (Customer Overview)
```

The idea (from the project description): split components by **responsibility**, not by file size. A component earns its place if splitting it makes the code clearer, reusable, or easier to test.

### Reusable UI primitives (`src/components/ui/`)

- `Button`, `Input`, `Select`, `TextArea`
- `Badge`, `Card`, `Alert`, `EmptyState`, `Spinner`
- `Modal`, `Pagination`, `BackButton`, `GoButton`

**Most form/display primitives are MUI-backed:** `Input`, `TextArea`, and `LoginInput` wrap MUI `TextField`; `Select` wraps a `NativeSelect`; dashboard cards and the tickets table use MUI `Card`/`Table`. Labels are plain block `<label>` elements rendered above the field (with consistent 6px bottom spacing and a flush helper/error line below) rather than MUI's floating label — that keeps spacing/overlap predictable across stacked and grid layouts. Tailwind is used for layout spacing around the MUI widgets.

A shared convention: **back actions use `BackButton`, forward/primary row actions use `GoButton`** (a "Go" affordance instead of "View").

### One layout for the whole app

`AppLayout` provides the header, sidebar, and mobile bottom-nav, and renders the current page via `<Outlet />`. So every page automatically has the shell and the role-aware menu.

---

## 10. Data/API boundary

The UI never talks to "the server" directly. All data access goes through a service layer:

- `userService` — get/create/update/delete users
- `ticketService` — get/create/update/delete tickets, plus CSV export
- `mockApi` — shared helpers: simulated latency, random failure, abort handling

**One deliberate exception:** customers have **no service layer** — `CustomersProvider` is a pure Context + localStorage store (`queuedesk_customers`). Customers are only ever created inside the browser and consumed by the UI, so a mock HTTP service would add ceremony without a use case. If a real backend later owns customers, it would slot in behind the same `useCustomers()` hook.

Both services have **two modes**:

| Mode | What happens |
| ---- | ------------ |
| Mock (`USE_MOCK = true`) | Work on an in-memory array + localStorage, with fake latency |
| Real API (`USE_MOCK = false`) | `fetch()` against `VITE_API_BASE_URL` |

The service methods look almost identical in both modes, so the rest of the app doesn't know (or care) which one is running.

**Why this layer exists:** if QueueDesk ever gets a real backend, I only change the files in `services/api/`. No page component changes. That's the whole point of the abstraction.

---

## 11. Client-side vs. server-side responsibility

**Today, everything is client-side:**

- Loading all tickets into the browser
- Searching, filtering, sorting
- Pagination on the already-filtered array

This is fine at "~2,000 tickets in the browser" scale. The project description says the decision should be revisited for large datasets.

**When would this move to the backend?**

- When the volume gets so big that downloading all records is slow (say 10k+ or 100k).
- When filtering/sorting needs to run against a database.
- When multiple clients need the same server-computed view.

Then the URL becomes:

```
GET /tickets?status=open&page=2&sort=dueAt
```

...and the server filters, sorts, and paginates before sending a small response. The frontend URL-state approach would survive that change nicely, because the params are already in the URL.

---

## 12. Failure-mode analysis

What can go wrong, and what the user sees.

| Failure | What happens | Can the user recover? |
| ------- | ------------ | --------------------- |
| Tickets fail to load | Error empty-state with a Retry button | Yes — click Retry |
| No tickets at all | Empty-state "No tickets found" | N/A |
| No search results | Empty-state "No tickets match your filters" + Reset Filters | Yes — reset filters |
| Ticket update fails | Error message shown; old data stays on screen | Yes — try again |
| Invalid ticket ID | "Ticket not found" page with a back-to-list action | Yes |
| Missing customer | Ticket still renders, shows "Unknown Customer" | N/A |
| Comment submit fails | Composer shows an error, doesn't lose the text | Yes — resubmit |
| Request is cancelled | `AbortError` is caught and ignored, so a stale response can't overwrite new state | N/A |
| Not logged in | `ProtectedRoute` redirects to `/login` | Yes — sign in |
| Wrong login | Login page shows "Invalid email or password" | Yes — try again |

The rule I followed: **never let a failure leave the user staring at a blank or broken screen** — always show a message, keep old data visible, and offer a retry where it makes sense.

---

## 13. Performance hypotheses

Before optimizing, I wrote down guesses (the project description asked for "performance hypotheses" first):

1. *Parsing every `createdAt`/`dueAt` string on every comparison during sort is wasteful.* → **Hypothesis:** precomputing timestamps once into a `Map` makes sorting faster. (Confirmed: sorting dropped from ~219ms to ~30ms in the 10k-ticket test.)
2. *Filtering thousands of tickets is fine.* → Only measuring proved it; the pipeline stays fast at 10k.
3. *The chart library is huge.* → **So I lazy-load the analytics page.** Recharts is only downloaded when a manager visits `/analytics`.
4. *The React Compiler handles memoization.* → I rely on `@babel/plugin-react-compiler` rather than sprinkling `React.memo` everywhere.
5. *Adopting MUI is cheap for bundle size.* → **It wasn't.** Using MUI `TextField`/`Select`/`Card`/`Table` app-wide pushed the main chunk to ~575 kB (Vite now warns above 500 kB). Tradeoff accepted: the a11y/focus/error wiring is worth it for a forms-heavy app; `/analytics` stays split out as its own lazy chunk.

**What I deliberately did NOT do:** I didn't add debouncing, virtualization, or memoization just because they're "known techniques" — the spec warned against that. I only did things that solved a measured problem.

---

## 14. Accessibility considerations

- The whole app is **keyboard-operable**: focus rings are visible, dialogs trap focus and close on `Escape`.
- Form fields have real `<label>`s and inline validation messages.
- Status is **not communicated by color alone** — badges include text (e.g. "Overdue", "Critical").
- Dynamic regions use `role="status"` / `aria-live` so screen readers announce loading changes.
- Tables are semantic; navigation uses landmarks (`nav`, `aside`, `header`).
- The layout is responsive: sidebar on desktop, bottom tab bar on mobile, with no horizontal scroll at 360px.

---

## 15. Security / trust-boundary notes

This is the important honesty part from the project description:

> Hiding a button is not authorization.

- In this app, hiding "Analytics" or "Delete" for agents is a **UI-level** convenience.
- A real production app must **enforce permissions on the backend** — the UI rules can be bypassed by calling the API directly.
- `password` is stored as plain text in mock data. That's OK here (simulated auth) but would be unacceptable in production (hash + salt + real auth provider).
- `localStorage` is not a secure vault. Anyone can read it in devtools. It's fine for a demo session, but real auth needs HttpOnly cookies / tokens with proper storage.

**The trust boundary:** the browser is considered "untrusted." Anything the app shows is a hint, not security.

---

## Appendix — decisions I'm glad I wrote down

Even a junior can make good calls if they write down the "why":

1. **URL state for filters** — shareable, refresh-safe. Cost: noisier URLs, need page clamping.
2. **Context for global state** — right size for this app. Revisit with a real backend (move to a query library).
3. **Service-layer abstraction** — swap mock → real API without touching UI (customers aside — see §10).
4. **Seeded random mock data** — consistent dev/QA data.
5. **Derived SLA/metrics** — never persist what you can compute.
6. **Mobile cards instead of a squeezed table** — usable at 360px.
7. **localStorage persistence** — session/tickets/customers/notifications survive refresh; not a real backend.
8. **Lazy-loaded analytics** — don't pay for Recharts until a manager visits.
9. **Notification → Add Ticket deep-links** — new-request notifications stamp `customerId`, and the notifications page resolves the customer (stored → linked ticket → name parsed from the message) so even pre-existing notifications prefill the form. Cost: a best-effort name-parsing fallback.
10. **MUI over hand-rolled controls** — production focus/a11y/error states; cost: ~575 kB main chunk and version-9 quirks (`slotProps.htmlInput`, `Stack` alignment in `sx`).
11. **Plain block labels above MUI fields** — predictable spacing with no floating-label overlap, at the cost of a tiny bit more markup per field.

I also recorded this in a retrospective whenever a design assumption turned out wrong — so the doc reflects reality, not just the original plan.