# QueueDesk

QueueDesk is a small help-desk app for support teams to track and solve customer tickets. I built it as my frontend portfolio project.

It's a single-page app that lets agents and managers see tickets, search and filter them, update their status, assign them, add comments, and check SLA deadlines. There's also a dashboard with some charts for managers.

**No backend is needed.** Everything runs in the browser with fake (mock) data that simulates a real API.

---

## Table of Contents

- [Features](#features)
- [How to log in](#how-to-log-in)
- [Roles & permissions](#roles--permissions)
- [Tech stack](#tech-stack)
- [How to run it](#how-to-run-it)
- [Project structure](#project-structure)
- [Where does the data come from?](#where-does-the-data-come-from)
- [The login feature](#the-login-feature)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)

---

## Features

- **Tickets list** — view all tickets as a table (desktop) or cards (mobile)
- **Search & filters** — filter by status, priority, category, assignee, and SLA
- **Sorting** — newest first, oldest first, priority, due date, customer name
- **Pagination** — pages you can click through (10 / 20 / 50 per page)
- **Ticket detail page** — see the description, customer info, SLA status, and activity history
- **Quick actions** — change status, change priority, assign a ticket (only if allowed)
- **Create ticket** — a form with real validation (subject 5–120 chars, description at least 20)
- **Comments & activity** — a timeline of everything that happened to a ticket
- **Dashboard** — KPI cards showing open/critical/overdue tickets and average resolution time
- **Analytics page** (manager only) — charts powered by Recharts
- **Notifications** — you get notified when a ticket is assigned to you, when a new ticket comes in, and managers get a daily summary
- **Export to CSV** — download the currently filtered ticket view
- **Login / Logout** — you must sign in to use the app
- **Data saved in localStorage** — your session, tickets, and notifications survive a page refresh

---

## How to log in

When you open the app you'll see a **login page**. Use one of the demo accounts below.

**Password for all accounts:** `11111111`

| Email | Role |
| ----- | ---- |
| `Admin@queuedesk.com` | Manager |
| `Agent@queuedesk.com` | Agent |
| `elena@queuedesk.com` | Agent |
| `david@queuedesk.com` | Agent |

After you log in, your session is saved in `localStorage`, so if you refresh the page you stay logged in. Use the **Logout** button in the header to sign out.

There's also a **role switcher** in the header (mainly for demo purposes) that lets you jump between users without logging out.

---

## Roles & permissions

There are two roles: **Agent** and **Manager** (the manager is basically the admin).

| What you can do | Agent | Manager |
| --------------- | :---: | :-----: |
| Create tickets | ✔ | ✔ |
| Work on tickets assigned to me | ✔ | ✔ |
| Claim an unassigned ticket | ✔ | ✘ |
| Edit any ticket | ✘ | ✔ |
| Set `critical` priority | ✘ | ✔ |
| Assign tickets to anyone | ✘ | ✔ |
| Delete tickets | ✘ | ✔ |
| View analytics | ✘ | ✔ |
| Manage users | ✘ | ✔ |

The permission rules live in one place — `src/utils/permissions.ts` — so they're easy to read and test, instead of being scattered around the UI.

---

## Tech stack

- **React 19** + **TypeScript** — the app itself
- **Vite** — the dev server and build tool
- **React Router** — navigation between pages
- **Tailwind CSS** — styling
- **Recharts** — the analytics charts
- **Vitest + Testing Library** — unit and component tests
- **Playwright** — end-to-end tests

---

## How to run it

### Prerequisites

- **Node.js 20.19+ or 22.12+**
- npm (comes with Node.js)

### Install and start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open http://localhost:5173, log in with one of the demo accounts above, and have a look around.

### Build for production

```bash
npm run build      # type-checks then builds into dist/
npm run preview    # serves the production build
```

---

## Project structure

The code is organized by feature — each feature (like tickets, users, dashboard) gets its own folder.

```
src/
├── main.tsx              # where the app starts
├── App.tsx               # all the providers and routes
├── components/           # Header, Sidebar, layout + reusable UI pieces
│   └── ui/               # Button, Input, Badge, Card, Modal, Spinner, etc.
├── features/             # one folder per feature
│   ├── auth/             # login page
│   ├── tickets/          # ticket list, detail, create, filters
│   ├── users/            # login/user context + Team & Roles page
│   ├── dashboard/        # dashboard page
│   ├── analytics/        # manager-only charts
│   ├── account/          # "My Account" page
│   └── notifications/    # notifications state + page
├── hooks/                # useUser, useUsers, useTickets, useNotifications
├── mocks/                # fake data generator (seeded, so it's the same every time)
├── services/api/         # the "API" layer (mock + real API + latency simulation)
├── types/                # all the TypeScript types (Ticket, User, etc.)
└── utils/                # permissions, filters/pipeline, SLA, metrics, notifications
```

---

## Where does the data come from?

There's no real backend. Instead:

1. **`src/mocks/generator.ts`** creates ~2,000 fake tickets, 20 customers, and 4 users. It uses a **seeded random generator**, so the data always comes out the same — this keeps screenshots and demos consistent.
2. **`src/services/api/`** pretends to be a server. It adds a fake 300–1200ms delay (so you can see loading states) and can randomly fail if you turn that on.
3. When you do things (create a ticket, change its status, etc.), the app updates the data in memory and then **saves it to `localStorage`**, so your changes stick around after a refresh.

If you ever want to hook up a real API, you'd only need to change the files in `services/api/` — the UI wouldn't have to change at all.

---

## The login feature

The app used to just pick a default user. Now it has a real login flow:

- **`src/features/auth/LoginPage.tsx`** — the login form. Checks the email/password against the mock users.
- **`src/features/users/UserContext.tsx`** — holds the "am I logged in?" state, plus `login` and `logout` functions. It stores the current user's ID in `localStorage` under `queuedesk_user_id`.
- **`src/components/ProtectedRoute.tsx`** — wraps all the app pages. If you're not logged in, it sends you to `/login`.

So the flow is: open the site → you see the login page → sign in → you can use the app → refresh → still logged in → click Logout → back to the login page.

---

## Environment variables

The app reads these from a `.env` file (copy `.env.example` to `.env` if you want to change them):

| Variable | Default | What it does |
| -------- | ------- | ------------ |
| `VITE_USE_MOCK` | `true` | Set to `false` to use a real API instead of mock data |
| `VITE_API_BASE_URL` | — | The real API URL (only used when mock mode is off) |
| `VITE_FAILURE_RATE` | `0` | e.g. `0.1` makes ~10% of mock requests fail, to test error states |
| `VITE_STRESS_TICKETS` | — | Generates this many tickets (for the 10k performance test) |

---

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run dev:stress` | Dev server with 10,000 tickets (performance test) |
| `npm run lint` | Check for lint errors |
| `npm run format` | Auto-format the code |
| `npm run format:check` | Check formatting without changing anything |
| `npm test` | Run the unit/component tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run the end-to-end tests |

---

## Notes for reviewers

- The filters/sort/pagination live in the **URL** (e.g. `/tickets?status=open&sort=dueAt&page=2`), so you can bookmark or share a filtered view.
- All the tricky business logic (filtering, sorting, SLA, permissions, metrics) is written as plain functions in `src/utils/`, so it's easy to test without a browser.
- The analytics page is loaded lazily — the chart library is only downloaded when a manager actually visits it.