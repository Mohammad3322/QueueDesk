# QueueDesk — Complete Project Walkthrough

A full explanation of what QueueDesk is, how it works, and why it was written that way — intended for explaining the project (and its code) to another programmer.

---

## 1. What the project is

QueueDesk is a **customer-support operations dashboard** — a frontend-only portfolio project. The business problem it solves: a small SaaS company currently manages tickets via spreadsheets and email, so tickets get missed, urgency is inconsistent, ownership is unclear, SLA deadlines slip, and managers can't see team workload. QueueDesk centralizes this into one browser app.

The project spec (`discription.text`) explicitly scopes this to **frontend engineering**. There is no real backend, no real auth, no real notifications — everything is simulated. The point is to demonstrate: state management, TypeScript domain modeling, reusable UI, forms/validation, URL state, a replaceable service layer, derived data, responsive design, and engineering decision-making.

---

## 2. Tech stack

| Layer   | Choice                                      |
| ------- | ------------------------------------------- |
| Build   | Vite 8 + TypeScript 6 (strict)              |
| UI      | React 19 + Tailwind CSS 4                   |
| Icons   | MUI Icons (`@mui/icons-material`)           |
| Charts  | Recharts (lazy-loaded)                      |
| Routing | React Router 7                              |
| Testing | Vitest (JS DOM), config in `vite.config.ts` |
| Quality | ESLint, Prettier, `tsc -b` in the build     |

Key `package.json` scripts: `dev`, `build` (`tsc -b && vite build`), `lint`, `format`, `test`.

---

## 3. Project structure (`src/`)

```
main.tsx            → React root mount (StrictMode)
App.tsx             → Provider nesting + all routes
components/         → App shell (AppLayout, Header, Sidebar) + ui/ primitives
components/ui/      → Button, Input, Select, Badge, Card, Modal, Spinner, Alert, etc.
features/           → Feature modules: dashboard, tickets, customers, users, account, auth, analytics, notifications
hooks/              → useUser, useUsers, useTickets, useNotifications
mock/               → deterministic mock data generator
services/api/       → userService, ticketService, mockApi (latency/failure sim)
types/index.ts      → all domain types
utils/              → permissions, ticketHelpers, ticketPipeline, metrics, notifications
constants/index.ts  → routes, statuses, priorities, SLA config, roles, categories
pages/NotFoundPage  → 404
```

The structure follows the spec's recommended **feature-folder + ui-primitives** layout. Each feature owns its folder (page component + related pieces); cross-cutting stuff lives in `utils/`, `components/`, `hooks/`, `types/`.

---

## 4. The domain model (`types/index.ts`) — where TypeScript earns its keep

The spec demanded "define the domain before building screens." The types answer the spec's required domain questions:

```ts
type UserRole = "agent" | "manager";
type TicketStatus =
  | "open"
  | "in-progress"
  | "waiting-on-customer"
  | "resolved"
  | "closed";
type TicketPriority = "low" | "medium" | "high" | "critical";
```

**Why unions instead of plain `string`?** Because invalid states become compile errors. You literally cannot set `ticket.status = "banana"` and `switch` statements over status become exhaustive. This is the "TypeScript prevents real bugs" talking point.

Design decisions encoded in the types:

- **`assigneeId?: string` is optional** — a ticket may be unclaimed (a real domain state), and it drives the "claim" permission.
- **Customers are referenced by `customerId`, not embedded.** One customer owns many tickets; duplicating customer data per ticket creates drift, so tickets reference an ID and the UI resolves the name via lookup (see the "Unknown Customer" fallbacks).
- **`isOverdue`/`resolvedAt`/SLA status are NOT stored.** They are _derived_ from `dueAt`/`createdAt`/`status` at render time. The spec explicitly says: "Avoid persisting data that can be deterministically computed from authoritative state." This is the **source vs. derived state** concept.

**The one deviation from the spec's type:** the spec's `User` had no `password`; the project added `password: string` so the simulated login can check credentials.

---

## 5. Architecture layering (the big picture)

```
Browser
└─ React Application
   ├─ Routing (BrowserRouter)            → /login, /, /tickets, /tickets/:id, ...
   ├─ UI Components  (components/, features/*)
   ├─ Feature Logic  (pages orchestrate data + child components)
   ├─ Application State (Context providers)
   └─ Service/Data Layer (userService, ticketService, mockApi)
      └─ Mock HTTP API / Mock Data Store (generator.ts, in-memory + localStorage)
```

`App.tsx` is the composition root — the exact provider nesting and why:

```tsx
<UserProvider>                      // 1. current user + auth (outside everything)
  <UsersProvider>                   // 2. full user directory
    <TicketProvider>                // 3. tickets/comments/activity
      <NotificationsProvider>       // 4. notifications (needs users + tickets)
        <BrowserRouter>
          <Routes>
            <Route path="/login" …/>           // public
            <Route element={<ProtectedRoute/>}> // auth gate
              <Route path="/" element={<AppLayout/>}> …all pages…
```

**Why this order matters:** `UserProvider` is outermost because _everything_ needs the logged-in user. `NotificationsProvider` is innermost because it derives the manager's daily summary from `useUsers()` and `useTickets()` — so those providers must already be mounted.

---

## 6. Application state — Context, and the "state ownership" philosophy

The project follows the spec's **state ownership matrix**:

| State                            | Where it lives               | Why                                    |
| -------------------------------- | ---------------------------- | -------------------------------------- |
| Current user                     | `UserContext` (global)       | Needed app-wide                        |
| Tickets/comments/activity        | `TicketProvider` (global)    | Shared data, modified in several pages |
| Notifications                    | `NotificationsProvider`      | Generated by many event sites          |
| Search term, filters, sort, page | **URL search params**        | Shareable, survives refresh/back       |
| Create-ticket form fields        | Local `useState` in the form | Temporary user input                   |
| Modal open/closed                | Local state in component     | Ephemeral UI                           |
| Overdue counts, filtered lists   | Derived (computed)           | Never stored separately                |

This is the answer to "why are filters not context state?": filters live in the **URL**, not Context, because they define "the current resource view" — they should be bookmarkable/shareable and survive back/forward. That's also why `TicketFilters.tsx` reads/writes `useSearchParams`.

### The hooks

`src/hooks/useUser.ts`, `useUsers.ts`, `useTickets.ts`, `useNotifications.ts` are thin wrappers that `useContext(...)` and **throw if the provider is missing** (`useUser must be used within a UserProvider`). That turns a silent `undefined` crash into a clear one, and it gives components a typed, tidy API.

### localStorage persistence (recently added)

- `UserProvider` reads `queuedesk_user_id` on mount → if present, restores that user and sets `isAuthenticated = true`. `login()` validates email/password case-insensitively against `MOCK_USERS` and writes the ID; `logout()` removes it.
- `TicketProvider` seeds from `queuedesk_tickets/comments/activity`, falls back to fetching, and **persists on every mutation via `useEffect`**.
- `NotificationsProvider` seeds from `queuedesk_notifications`.

So user session, tickets, and notifications all survive a refresh.

---

## 7. The service/data layer — "make infrastructure replaceable"

`src/services/api/` is the abstraction between UI and wherever data comes from:

```ts
// mockApi.ts
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
export const API_URL = import.meta.env.VITE_API_BASE_URL;
// simulates 300–1200ms latency, optional random failures, AbortError on cancelled requests
```

`ticketService.ts` and `userService.ts` have **dual mode**: if `USE_MOCK`, they operate on an in-memory array with simulated latency; otherwise they hit `fetch(`${API_URL}/...`)`. The interfaces stay identical.

**Why this exists (spec §10.3):** "UI components should not care whether data ultimately comes from localStorage, JSON, a REST API, a mock server, or Supabase." If this app ever got a real backend, you'd change the service files — **zero page components would change**. This is a top interview talking point.

The spec also mandated failure simulation: `delay(randomLatency())` for the 300–1200ms latency, and `maybeFail()` for intermittent failures (enabled via `VITE_FAILURE_RATE`). That's why pages all render **loading / error / empty / retry** states.

**Race-condition handling:** services accept an optional `AbortSignal` and call `throwIfAborted()`, and provider `useEffect`s use a `cancelled` flag — so a stale slower response can't overwrite newer state.

---

## 8. Mock data generation (`mocks/generator.ts`) — deterministic by design

The spec demanded ≥2000 tickets with varied status/priority/dates/categories/assignees, and said "prefer programmatic generation over writing dozens of near-identical objects."

Two clever decisions here:

- **A seeded PRNG (`mulberry32(42)`)** — same seed → same data every reload. Reload-stable mock data makes QA, screenshots, and demos consistent.
- **A stress hook** — `VITE_STRESS_TICKETS` env var controls count (default **2133** tickets, 20 customers, 4 users). The spec's Phase 6 performance exercise generates 10k tickets by setting that env var. This is also why `applyTicketPipeline` is a pure function — exactly the same code can be unit-tested and perf-tested without React.

Mock data relationships: `MOCK_TICKETS = generateMockTickets(...)`, then comments and activity events are generated _from_ the tickets, so IDs/customerId/assigneeId always cross-reference consistently. ~20% of tickets are overdue; resolved/closed tickets get a `resolvedAt`. `MOCK_AGENTS` aliases `MOCK_USERS` for backward compatibility.

Note: passwords are plain-text `"11111111"` for all 4 users — fine, because this is a simulation and auth is explicitly out of scope.

---

## 9. Routing & navigation

Routes (from `App.tsx` + `constants/index.ts` `APP_ROUTES`):

- `/login` (public)
- `/` dashboard
- `/tickets`
- `/tickets/new`
- `/tickets/:ticketId`
- `/notifications`
- `/account`
- `/users`
- `/analytics`
- `/customers/:customerId`
- `*` → NotFound

**Layout pattern:** a single `AppLayout` (responsive shell: fixed `Header`, fixed desktop `Sidebar`, `main` with padding, mobile bottom-nav) renders children via `<Outlet />`. The header/sidebar/bottom-nav are role-aware — e.g. "Analytics" and "Team & Roles" only render when `canViewAnalytics`/`canManageUsers`.

**ProtectedRoute** (recently added): wraps all app routes; if `!isAuthenticated`, redirects to `/login`; else renders `<Outlet />`. So every page except login is gated.

**NotFoundPage** handles bad URLs inside the layout; `TicketDetailPage` also handles an invalid ticket ID with a friendly "Ticket not found" empty state instead of crashing.

---

## 10. The ticket pipeline — the core algorithm (`utils/ticketPipeline.ts`)

This is the single most important function in the app. It implements the spec's derived-state pipeline:

```
tickets → search → filters → sorting → pagination → visible rows
```

`applyTicketPipeline(tickets, options)` is a **pure function** (no React, no state mutation — it clones via `[...filtered]`). That purity is deliberate: it's unit-testable in isolation and reusable in the 10k stress harness.

How each stage works:

- **Search:** lowercases both sides, matches ticket `id`, `subject`, or customer name (customer name resolved by a `customerNameById` callback, so the pipeline stays decoupled from the customer store).
- **Filters:** status, priority, category, assignee (incl. special `"unassigned"`), and SLA status — all compared to `"all"` sentinels.
- **Sort:** precomputes parsed timestamps into `Map`s (avoids re-parsing dates on every comparator call), then sorts. **Priority uses business weights**, not alphabetical: `PRIORITY_WEIGHTS = {low:1, medium:2, high:3, critical:4}`. Descending is default.
- **Pagination:** `totalPages = max(1, ceil(total/size))`, then **clamps the page** (`Math.min(Math.max(1, page), totalPages)`) so a URL like `/tickets?page=50` never shows an empty page.

**Consumers:** `useFilteredTickets.ts` reads `useSearchParams` and calls the pipeline — so the URL is the single source of filter truth. `TicketFilters.tsx` writes params and always resets `page=1` on filter change (the "pagination-not-reset-after-filter" bug class). `Pagination.tsx` navigates between clamped pages.

**Mobile vs desktop:** same data, different presentation — a full `<table>` on `md+`, compact `<TicketCard>` grid below `md` (the spec says never force a desktop table into a 360px viewport).

---

## 11. Permissions — centralized, not scattered (`utils/permissions.ts`)

The spec's explicit instruction (§3.3): _"Do not scatter role checks throughout JSX. Prefer centralized permission functions."_ So every rule is a function:

```ts
canAssignTicket(user); // manager only
canClaimTicket(user, ticket); // agent + unassigned
canChangePriority(user, p); // critical → manager only
canViewAnalytics(user); // manager only
canManageUsers(user); // manager only
canDeleteTickets(user); // manager only
canEditTicket(user, ticket); // manager always; agent only on own/unassigned
```

Components consume these (`const isEditable = canEditTicket(currentUser, ticket)`), so business rules live in one testable place and JSX stays clean.

**Security caveat the spec demands you know:** "hiding a button is not authorization." Cutting agents' UI is a UX decision; a real backend must enforce all rules. The trust boundary between browser and server is documented, not enforced.

---

## 12. SLA & derived dates (`utils/ticketHelpers.ts`)

```ts
isTicketOverdue(t); // false for resolved/closed regardless of dueAt
getSLAStatus(t); // "on-track" | "due-soon" | "overdue" | "completed"
```

- Resolved/closed → `completed` (and not overdue) — the "resolved ticket shouldn't keep accruing overdue state" edge case.
- `diffMinutes < 0` → overdue; `<= 60` (`SLA_DUE_SOON_MINUTES`) → due-soon; else on-track.
- All computed from `dueAt` vs. `Date.now()` at render; nothing stored.

This feeds `SLAIndicator` (detail page), the SLA filter, and the overdue metrics.

---

## 13. Notification system (`utils/notifications.ts` + `NotificationsProvider`)

Three notification types: `ticket-assigned`, `new-ticket`, `daily-summary`.

- `buildTicketAssignedNotification` / `buildNewTicketNotification` are **builder functions** — pure, deterministic (given an optional `id`) so they're unit-testable.
- `computeDailySummaryStats` derives KPI text for the manager's daily summary (completed/new/active/overdue/critical/avg resolution).
- The provider seeds **one daily-summary per manager per day**, keyed by `localDateKey` in a `Set`, once users+tickets finish loading — a client-side mock of a scheduled job.
- `formatRelativeTime` gives "5m ago" etc.
- Event emission sites call `addNotification(...)`: `TicketQuickActions` on assignment, `NewTicketPage` on creation.
- Read/unread badge counts flow into `Header` and `Sidebar`.

---

## 14. Dashboard & analytics (derived data, lazy loaded)

`utils/metrics.ts` exports `computeMetrics(tickets)` — a pure function producing: total, open, critical, overdue, resolved-today, avg resolution time, and grouped counts by status/priority/assignee/category. **All derived from ticket data, nothing hard-coded** (spec §10.1).

`formatDuration(ms)` renders "2h 5m" / "3d 2h".

`AnalyticsPage` is **lazy-loaded** (`React.lazy` + `<Suspense>` in `App.tsx`) because it pulls in Recharts (~394KB chunk) — so the chart library is only downloaded when a manager visits `/analytics`. This is a concrete, defensible performance decision. `DashboardPage`/`AssignedTicketsCard` consume `computeMetrics`.

---

## 15. Key workflows (how the pieces combine)

**Ticket detail** (`TicketDetailPage`): resolves ticket/customer/assignee by ID → renders SLA indicator, description card, activity stream, quick-actions card, customer card.

**Quick actions** (`TicketQuickActions`): the **status state-machine**. `ALLOWED_TRANSITIONS` explicitly enumerates valid moves (e.g. `open → ["in-progress","closed"]`) and the status dropdown _filters out_ illegal transitions — the spec's "state-transition thinking." Closing requires a confirmation modal. Priority select hides "Critical" for agents. Assignee select offers "Claim" to agents on unassigned tickets. Every action also appends an `ActivityEvent` and fires notifications.

**Create ticket** (`NewTicketPage`): local form state with **field-level validation** (subject 5–120 chars, description ≥20, required customer/category). It generates ID `TICK-1000+n`, sets a 24h SLA due date, calls `createTicket`, builds new-ticket + assignment notifications, then **redirects to the new ticket's detail page** (spec §9.5 prefers redirect-to-detail over staying on the form, so the result is verifiable).

**Account** (`AccountPage`): edit name/email/password (with regex email validation, success alert), pushes the change into `UsersProvider` and `UserContext`.

**Users** (`UsersPage`): manager-only directory CRUD.

**Search/filter/shareable state** (`TicketsPage` + `TicketFilters`): URL-driven, paginated, with export-to-CSV via `ticketService.exportToCSV`.

---

## 16. Design decisions to be able to defend (mini-ADRs)

1. **URL state for filters** — shareable, refresh-safe; costs: noisier URLs, needs page clamping. Would move server-side at scale.
2. **Context for global state** — right size for this app (small, single-purpose stores). Reconsider with a real backend → all data fetching moves into a query layer (React Query etc.).
3. **Service-layer abstraction** — clean swap to REST; tradeoff: more boilerplate for a mock.
4. **Deterministic seeded mock data** — stable dev/QA; tradeoff: data is contrived.
5. **Client-side pipeline/pagination** — fine for 2k records; the spec asks "when would this move to the backend?" → once volume makes loading all records unreasonable (10k+) → server-side `?status=&page=&sort=` filtering becomes mandatory.
6. **Mobile card layout vs desktop table** — usability over visual consistency at 360px.
7. **Derived SLA/overdue/metrics** — never persisted duplicates; single source of truth.
8. **Lazy-loaded analytics** — Recharts only fetched for managers on `/analytics`.
9. **Role permissions as pure functions** — testable, not scattered through JSX; still not real authorization.
10. **localStorage persistence** — user session, tickets, notifications survive refresh; clear tradeoff: localStorage is not secure storage nor a real backend, and there's no cross-tab invalidation.

---

## 17. Build / type / lint story

- `npm run build` runs `tsc -b` (strict TypeScript across project references) then `vite build`. It currently succeeds (that's the verification bar for the auth changes).
- `npm run lint` → ESLint (flat config era), passes.
- Prettier is enforced (`npm run format:check`) — note a handful of pre-existing files (e.g. `LoginInput.tsx`, `BackButton.tsx`) still fail it; the auth changes did not touch those.
- `vite.config.ts` uses the **React Compiler preset** (`@babel/plugin-react-compiler`) — meaning the app relies on the compiler doing memoization automatically rather than hand-tuning `React.memo`.

---

## 18. Where to find things (cheat sheet for talking a programmer through it)

| Question                              | File                                                               |
| ------------------------------------- | ------------------------------------------------------------------ |
| "How do filters work?"                | `utils/ticketPipeline.ts` + `useFilteredTickets.ts`                |
| "Why is this union typed?"            | `types/index.ts`                                                   |
| "How do we swap to a real backend?"   | `services/api/*`                                                   |
| "Where's the auth gate?"              | `components/ProtectedRoute.tsx` + `features/users/UserContext.tsx` |
| "Where's mock data?"                  | `mocks/generator.ts`                                               |
| "How do permissions work?"            | `utils/permissions.ts`                                             |
| "How is state owned?"                 | `App.tsx` nesting + each provider                                  |
| "How is the status machine enforced?" | `TicketQuickActions.tsx` (ALLOWED_TRANSITIONS)                     |
| "How do notifications fire?"          | `utils/notifications.ts` + provider + event sites                  |
