# QueueDesk

A responsive help-desk / support-ticket management application built with React 19, TypeScript, Vite, and Tailwind CSS.

QueueDesk gives a support team a single place to track, triage, and resolve customer tickets — with role-based permissions, live mock-data mode, SLA tracking, analytics, and a complete automated test suite.

---

## Table of Contents

- [Features](#features)
- [Roles & Permissions](#roles--permissions)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Performance & Stress](#performance--stress)
- [Accessibility](#accessibility)
- [Documentation](#documentation)

---

## Features

### Ticket Management
- Create, view, search, filter, and sort tickets (status, priority, customer, assignee, SLA)
- Edit status, priority, and assignee inline on the ticket detail page
- Activity stream showing every lifecycle event and comment
- **Administrators can delete tickets** directly from the tickets table (desktop) or mobile cards, with a confirmation dialog
- Export the current filtered view to CSV

### User & Account Management
- **My Account** page to view your profile and update your name or email
- **Team & Roles** page (manager-only) to:
  - Browse the user directory
  - Assign roles (`agent` / `manager`)
  - Create and delete users
- The header role-switcher reflects the live user directory, so new users appear and deleted users are removed automatically

### Operations
- Dashboard with SLA overview, priority/status distribution, and workload summary
- Analytics dashboard (manager-only) with charts powered by Recharts
- Customer detail pages linking from ticket records

### Developer Experience
- Deterministic mock-data mode with simulated network latency (no backend required)
- 10,000-ticket stress mode to validate filtering and sorting performance
- Prettier formatting, ESLint, TypeScript type-checking, unit/component tests and Playwright E2E workflows — all green in CI-style runs

---

## Roles & Permissions

QueueDesk uses two roles. The **manager** role acts as the *administrator*.

| Capability                                       | Agent | Manager (administrator) |
| ------------------------------------------------ | :---: | :---------------------: |
| Create tickets                                   |  ✓   |           ✓             |
| Work tickets assigned to me                      |  ✓   |           ✓             |
| Claim unassigned tickets                         |  ✓   |           ✗             |
| Edit tickets assigned to me                      |  ✓   |           ✓             |
| Edit any ticket (status, priority, assignee)     |  ✗   |           ✓             |
| Set `critical` priority                          |  ✗   |           ✓             |
| Assign tickets to any agent                      |  ✗   |           ✓             |
| **Delete tickets**                               |  ✗   |           ✓             |
| View analytics                                   |  ✗   |           ✓             |
| **Manage users & assign roles**                  |  ✗   |           ✓             |
| View / edit own account                          |  ✓   |           ✓             |

The seeded demo team:

| ID      | Name           | Role    |
| ------- | -------------- | ------- |
| usr-1   | Sarah Connor   | manager |
| usr-2   | Alex Mercer    | agent   |
| usr-3   | Elena Fisher   | agent   |
| usr-4   | David Miller   | agent   |

---

## Tech Stack

- **React 19** + **TypeScript** — application core
- **Vite 8** — build tool and dev server
- **React Router 7** — routing
- **Tailwind CSS 4** — styling
- **Recharts** — analytics charts
- **Vitest + Testing Library** — unit & component tests
- **Playwright** — end-to-end tests
- **Prettier / ESLint** — code quality

---

## Getting Started

### Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8)
- npm (bundled with Node.js)

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev
```

Open http://localhost:5173. The app runs in **mock mode** by default — no backend or API key is needed. Use the role selector in the header to switch between Sarah Connor (manager) and the agents.

### Build for Production

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

---

## Environment Variables

Environment variables are read from `.env` files at build/run time. Copy `.env.example` to `.env` to customize.

| Variable            | Default | Description                                                        |
| ------------------- | ------- | ------------------------------------------------------------------ |
| `VITE_USE_MOCK`     | `true`  | `false` switches the data layer to the real API at `VITE_API_BASE_URL` |
| `VITE_API_BASE_URL` | —       | Base URL of the backend API (used when `VITE_USE_MOCK=false`)      |
| `VITE_FAILURE_RATE` | `0`     | `> 0` (e.g. `0.1`) simulates occasional request failures to exercise error/retry states |
| `VITE_STRESS_TICKETS` | —    | Generates N tickets at startup for the performance exercise        |

### Stress Mode

```bash
npm run dev:stress      # runs vite --mode stress -> loads .env.stress (10,000 tickets)
```

The stress dataset verifies that filtering, sorting, and searching remain interactive with 10k tickets.

---

## Available Scripts

| Script                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                                |
| `npm run build`        | Type-check (`tsc -b`) then build for production          |
| `npm run preview`      | Preview the production build                             |
| `npm run dev:stress`   | Dev server with the 10k-ticket stress dataset            |
| `npm run lint`         | ESLint over the project                                  |
| `npm run format`       | Format source files with Prettier                        |
| `npm run format:check` | Verify formatting without writing                        |
| `npm test`             | Run the Vitest unit/component suite once                 |
| `npm run test:watch`   | Run Vitest in watch mode                                 |
| `npm run test:e2e`     | Run the Playwright E2E workflows                         |

---

## Project Structure

```
src/
├── components/          # Layout (Header, Sidebar, AppLayout) + reusable UI primitives
│   └── ui/              # Alert, Badge, Button, Card, EmptyState, Input, Modal,
│                        # Pagination, Select, Spinner, TextArea
├── features/            # Feature modules
│   ├── account/         # My Account page
│   ├── analytics/       # Manager-only analytics dashboard (lazy-loaded)
│   ├── customers/       # Customer detail page
│   ├── dashboard/       # SLA/workload overview
│   ├── tickets/         # List, detail, create, filters, quick actions, context store
│   └── users/           # User context + Team & Roles page + users store
├── hooks/               # useUser, useUsers, useTickets
├── mocks/               # Deterministic mock data generator (seeded RNG)
├── pages/               # NotFoundPage
├── services/api/        # ticketService, userService, shared mockApi helpers
├── types/               # Shared TypeScript domain types
└── utils/               # permissions, ticketHelpers, ticketPipeline, metrics
e2e/                     # Playwright end-to-end workflows
docs/                    # Requirements, design, test plan, QA reports
```

---

## Testing

The repository ships three layers of automated verification:

1. **Unit & component tests (Vitest + Testing Library)** — currently **96 tests across 12 suites**, covering filtering/sorting/searching pipelines, SLA logic, permissions, ticket lifecycle (create/update/claim/close), primitives accessibility, and the new user-management and ticket-deletion features.
2. **End-to-end workflows (Playwright)** — **3 workflows** exercising the core user journeys against a real dev server:
   - WF1: filter critical tickets → open one → change status → verify the activity stream
   - WF2: create a ticket → confirm it appears in the ticket list
   - WF3: switch to the manager persona → assign an unassigned ticket → verify the timeline
3. **Performance stress checks (Vitest)** — a 10k-ticket pipeline suite that asserts filtering, sorting, and search stay well within interactive budgets.

Run everything:

```bash
npm test
npm run test:e2e
```

See [`docs/test-plan.md`](docs/test-plan.md) and [`docs/qa-report.md`](docs/qa-report.md) for the full test plan, case traceability, and QA results.

---

## Performance & Stress

The ticket pipeline (`src/utils/ticketPipeline.ts`) was profiled with a 10,000-ticket dataset. Measured results after the optimization pass:

| Operation            | Before  | After   |
| -------------------- | ------- | ------- |
| Default query (open tickets, page 1) | ~219 ms | ~30 ms  |
| Customer-name sort (A–Z)             | ~153 ms | ~84 ms  |

Sorting uses precomputed lookup maps instead of re-parsing dates per comparison. Run the benchmark yourself:

```bash
npx vitest run src/utils/stressPipeline.test.ts --disable-console-intercept
```

---

## Accessibility

- Keyboard-friendly focus management with visible focus rings
- Dialogs implement focus trapping, `Escape` to close, and focus restoration
- Form fields have explicit labels and inline validation messages
- Dynamic regions use `role="status"` / `aria-live`; spinners expose `aria-labelledby`
- Semantic tables, landmarks, and navigation landmarks throughout
- The UI is responsive: sidebar navigation on desktop, bottom tab bar on mobile

---

## Documentation

| Document | Purpose |
| -------- | ------- |
| [`docs/system-design.md`](docs/system-design.md) | Architecture and system design |
| [`docs/test-cases.md`](docs/test-cases.md) | Test case catalogue with requirement traceability |
| [`docs/test-plan.md`](docs/test-plan.md) | Test strategy, environment, and exit criteria |
| [`docs/qa-report.md`](docs/qa-report.md) | QA summary, results, and known notes |
| [`docs/decisions`](docs/decisions) | Architecture decision records |