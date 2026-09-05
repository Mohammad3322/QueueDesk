# QueueDesk Test Plan

## 1. Scope

This plan covers the QueueDesk customer-support dashboard: ticket browsing, search, filters, sorting, pagination, ticket detail workflow, ticket creation, comments/activity, customer profiles, dashboard KPIs, analytics charts, role permissions, and responsive/accessible behavior. It does **not** cover real authentication, backend persistence, or email/chat integrations (out of scope per README §14.3).

## 2. Test Environment

- **OS**: Windows 11 (x64)
- **Browsers**: Chrome 130+, Firefox 130+, Edge 130+ (Safari recommended when available); headless Chromium for Playwright E2E
- **Viewports**: 360 / 390 / 768 / 1024 / 1440 px
- **Builds**: development (`npm run dev`), stress (`npm run dev:stress`), and production (`npm run build && npm run preview`)
- **Data**: deterministic seeded mock dataset (75 tickets, 20 customers, 4 users); 10,000-ticket dataset via `VITE_STRESS_TICKETS`

## 3. Feature Areas

| Area             | Key Behaviors                                             |
| :--------------- | :-------------------------------------------------------- |
| Navigation       | Routes, active state, 404, history, mobile bottom nav     |
| Tickets          | List, detail, empty/loading/error states                  |
| Search & Filter  | URL-backed search, filters, reset, combinations           |
| Sorting          | Date, priority (business order), direction                |
| Pagination       | Page numbers, page sizes, clamping, last-page behavior    |
| Workflow         | Status transitions, assignment, SLA derived states        |
| Permissions      | Agent vs Manager gating (assign, critical, analytics)     |
| Comments         | Public replies / internal notes, validation               |
| Create Ticket    | Required fields, field & business validation, redirect    |
| Dashboard        | KPI derivation from real data, SLA-risk list              |
| Analytics        | Charts (status / priority / workload), agent gating       |
| Customers        | Customer profile and ticket history                       |

## 4. Test Types

- Static checks: TypeScript strict build, ESLint, Prettier (`format:check`), production build.
- Unit: SLA/overdue math, priority sorting weights, pagination, permissions, metrics derivation, filter/sort/pagination pipeline.
- Component: form validation, SLA badge, permission controls, list pipeline, UI primitives (Alert, Badge, Button, Card, EmptyState, Input, Modal, Pagination, Select, Spinner, TextArea).
- End-to-end (Playwright, README §12.5): filter critical → status change with activity; create ticket → appears in list; switch to Manager → assign unassigned ticket → timeline.
- Performance: 10,000-ticket harness (`stressPipeline.test.ts`) measures generation, query pipeline (filter/sort/page), search, metrics, and SLA scan.
- Manual (per `test-cases.md`, 61 cases): navigation, search matrix, filter combinations, sorting/pagination boundaries, workflow transitions, role matrix, account/profile editing, user & role management, ticket deletion, data-state (loading/success/empty/failure/retry), responsive, keyboard accessibility.
- Exploratory: rapid navigation, double-clicks, fast filter changes, resize during interaction, unusual pasted text, disconnect network simulation.

## 5. Risk-Based Prioritization

| Feature            | Business Impact | Likelihood | Attention |
| :----------------- | :-------------- | :--------- | :-------- |
| Create + assign    | High            | Medium     | High      |
| Permissions        | Critical        | Medium     | High      |
| Filters + paginate | High            | High       | High      |
| SLA calculations   | High            | Medium     | High      |
| Search race/state  | Medium          | Medium     | Medium    |
| Charts / styling   | Low             | Low        | Low       |

## 6. Entry Criteria

- `npm run lint`, `npx tsc -b`, and `npm test` pass.
- Dev server launches without console errors.

## 7. Exit Criteria

- 0 known Critical or High bugs in primary workflows.
- All automated tests pass (96 unit/component assertions + 3 end-to-end workflows).
- 61-case manual matrix executed; all PASS.
- Production build succeeds with no major console warnings.
- Known Medium/Low issues, if any, documented in `qa-report.md`.

## 8. Known Risks

- Random `VITE_FAILURE_RATE` simulation needs to be disabled (unset) for stable demo runs.
- Mock store resets on refresh; created tickets are ephemeral (expected for this project).
- recharts bundle is lazy-loaded; offline analytics page shows the Suspense fallback.