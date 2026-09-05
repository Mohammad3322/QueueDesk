# QueueDesk QA Manual & Automated Test Suite

## Test Environment

- Browser: Chrome (primary), Firefox, Edge; responsive viewports 360 / 390 / 768 / 1024 / 1440 px
- Build: development (`vite`) and production (`npm run build`)
- Data: seeded mock dataset (75 tickets, 20 customers, 4 users)

## Automated Tests

- `npm test` — 9 test files, 81 assertions across unit, domain, and component tests (includes a 10k-ticket stress/performance harness).
- `npm run test:e2e` — 3 Playwright end-to-end workflows (README §12.5) pass in headless Chromium.
- `npm run lint` — ESLint (typescript-eslint, react-hooks, react-refresh).
- `npm run format:check` — Prettier (README §6.2).
- `npx tsc -b` — TypeScript strict-mode project build.

## Manual Test Cases Traceability Matrix

| Test ID   | Area             | Type          | Scenario                                                            | Expected Result                                            | Status |
| :-------- | :--------------- | :------------ | :------------------------------------------------------------------ | :--------------------------------------------------------- | :----- |
| **TC-01** | Search           | Boundary      | Rapid typing in search bar                                          | Previous pending requests abort; no race conditions         | PASS   |
| **TC-02** | Filter           | Intersection  | Filter Open + Critical + Overdue                                    | Displays exact intersection; resets page to 1               | PASS   |
| **TC-03** | Auth/Role        | Security      | Agent attempts to assign ticket                                     | Assign dropdown disabled or hidden via domain rule          | PASS   |
| **TC-04** | SLA              | Pure Function | Ticket due in 45 mins                                               | Computes status as `due-soon` dynamically                   | PASS   |
| **TC-05** | Form             | Validation    | Submit ticket with subject < 5 chars                                | Inline error visible, submit blocked                        | PASS   |
| **TC-06** | Export           | Data          | Click "Export CSV" with 15 filtered rows                            | Triggers download of CSV containing exact 15 records        | PASS   |
| **TC-07** | Navigation       | Positive      | Sidebar links navigate between Dashboard / Tickets / New Ticket     | Active route is highlighted correctly                       | PASS   |
| **TC-08** | Navigation       | Negative      | Visit an unknown URL like `/nope`                                   | 404 catch-all page renders                                  | PASS   |
| **TC-09** | Browser History  | Positive      | Apply filters, travel Back, then Forward                            | Filters reappear; state preserved via URL params            | PASS   |
| **TC-10** | Refresh          | Positive      | Refresh while `?status=critical&page=2` is in URL                   | Same filtered view loads                                    | PASS   |
| **TC-11** | Ticket List      | Positive      | Open Tickets from sidebar                                           | 75 tickets load after latency with spinner                 | PASS   |
| **TC-12** | Ticket List      | Boundary      | Visit `page=99` with only 3 pages                                   | Page clamped to last valid page                             | PASS   |
| **TC-13** | Search           | Positive      | Search partial subject keyword                                      | Matching rows shown, non-matching hidden                    | PASS   |
| **TC-14** | Search           | Boundary      | Search with leading/trailing whitespace                             | Treated as trimmed; matches found                           | PASS   |
| **TC-15** | Search           | Negative      | Search a string with no matches                                     | Empty-state message with Reset Filters action               | PASS   |
| **TC-16** | Filter           | Positive      | Filter by Status=In Progress                                        | Only in-progress rows visible                              | PASS   |
| **TC-17** | Filter           | Positive      | Filter by Priority=High                                             | Only high priority rows visible                            | PASS   |
| **TC-18** | Filter           | Positive      | Filter by Assignee=Unassigned                                       | Only unassigned rows visible                               | PASS   |
| **TC-19** | Filter           | Boundary      | Combine Status + Priority + Assignee + SLA filters                  | Exact intersection returned                                 | PASS   |
| **TC-20** | Filter           | Positive      | Click Reset Filters                                                  | All URL params cleared, all tickets visible                 | PASS   |
| **TC-21** | Sorting          | Positive      | Sort by Priority High → Low                                         | Business order: critical, high, medium, low                 | PASS   |
| **TC-22** | Sorting          | Boundary      | Sort by Newest First vs Oldest First                                | Date order flips correctly                                  | PASS   |
| **TC-23** | Pagination       | Positive      | Change page size 10 → 20 → 50                                       | Total page count recalculates; page resets to 1            | PASS   |
| **TC-24** | Pagination       | Boundary      | Last page with fewer than page-size rows                             | Renders partial page without errors                        | PASS   |
| **TC-25** | Ticket Detail   | Positive      | Open ticket from list                                                 | Detail page shows SLA banner, description, actions, activity| PASS   |
| **TC-26** | Ticket Detail   | Negative      | Open `/tickets/DOES-NOT-EXIST`                                       | "Ticket not found" empty state with back link              | PASS   |
| **TC-27** | Workflow        | Positive      | Change status Open → In Progress                                     | Status updates; activity event recorded                     | PASS   |
| **TC-28** | Workflow        | Negative      | Try Open → Resolved (invalid transition)                             | Option unavailable in status select                         | PASS   |
| **TC-29** | Workflow        | Positive      | Manager assigns ticket to an agent                                   | Assignee persisted in context and activity timeline         | PASS   |
| **TC-30** | Permission      | Positive      | Agent tries to reassign others' ticket                               | Assignee control disabled; read-only notice shown           | PASS   |
| **TC-31** | Permission      | Positive      | Agent claims an unassigned ticket                                    | "Claim" option appears; can set ticket to in-progress       | PASS   |
| **TC-32** | Permission      | Negative      | Agent sets Priority to Critical                                      | Critical option hidden; hint message shown                  | PASS   |
| **TC-33** | Comments        | Positive      | Submit a public reply                                                | Comment appears in conversation timeline                    | PASS   |
| **TC-34** | Comments        | Negative      | Submit empty/whitespace comment                                      | Inline error, blocked, no empty comment added               | PASS   |
| **TC-35** | Activities      | Positive      | View activity timeline on ticket                                     | System events distinct from user comments                   | PASS   |
| **TC-36** | Create Ticket   | Positive      | Fill valid form and submit                                           | Redirects to new ticket detail; appears in list             | PASS   |
| **TC-37** | Create Ticket   | Negative      | Submit empty required fields                                         | All inline errors shown; no request fired                   | PASS   |
| **TC-38** | Create Ticket   | Boundary      | Subject 119/120/121 chars                                            | 121 blocked, 120 accepted                                   | PASS   |
| **TC-39** | Dashboard       | Positive      | Verify KPI cards                                                      | Total/Open/Overdue/Resolved-Today derive from real data     | PASS   |
| **TC-40** | Dashboard       | Negative      | Verify SLA-risk list for overdue/due-soon tickets                    | Links navigate to the detail page                           | PASS   |
| **TC-41** | Analytics       | Permission    | View `/analytics` as agent                                           | "Analytics Unavailable" notice shown                        | PASS   |
| **TC-42** | Analytics       | Positive      | View `/analytics` as manager                                         | Status/priority bar charts and workload chart render        | PASS   |
| **TC-43** | Customers       | Positive      | Open a customer from the ticket list                                  | Customer detail with ticket history shown                   | PASS   |
| **TC-44** | Customers       | Negative      | Open invalid customer URL                                             | "Customer Not Found" state shown                            | PASS   |
| **TC-45** | Responsive      | Viewport      | Desktop table at 1440 / 1024 px                                      | No horizontal scroll, full columns                          | PASS   |
| **TC-46** | Responsive      | Viewport      | Mobile card list at 390 / 360 px                                     | Cards usable, bottom nav present, no overflow               | PASS   |
| **TC-47** | Accessibility   | Keyboard      | Tab through workflow without mouse                                   | Visible focus, logical order, no traps                      | PASS   |
| **TC-48** | Accessibility   | Labels        | Inspect form controls                                                | Every control has an associated label                       | PASS   |
| **TC-49** | Errors          | Data State    | Force load failure (VITE_FAILURE_RATE>0) and Retry                   | Error state with Retry; retry recovers                       | PASS   |
| **TC-50** | Duplicate Submit| Regression    | Rapidly click Create Ticket twice                                    | Second click disabled while submitting; one ticket created   | PASS   |
| **TC-51** | Filter Tickets  | Positive      | Filter list by Category                                              | Only tickets in the selected category shown                  | PASS   |
| **TC-52** | Search Tickets  | Positive      | Search by customer name and partial name                             | Matching customer tickets returned                            | PASS   |
| **TC-53** | Ticket Workflow | Regression    | Change status to Closed from Quick Actions                           | Confirmation dialog opens; Cancel keeps status, Confirm closes| PASS   |
| **TC-54** | Sorting          | Positive      | Sort by Customer A–Z / Z–A                                          | Rows ordered by customer name (locale-aware)                  | PASS   |
| **TC-55** | Accessibility   | Components    | Verify Alert, Spinner, Select, TextArea primitives                  | Correct roles, labels, `aria-live`, associated errors          | PASS   |
| **TC-56** | Performance     | Stress        | Run with 10k tickets (`npm run dev:stress`)                         | List still paginates 10/page; filters/sort/metrics respond      | PASS   |
| **TC-57** | Account Page    | Positive      | Open My Account, edit name/email                                    | Profile renders; invalid email rejected; changes persist         | PASS   |
| **TC-58** | User Management | Positive      | As Manager, list users, change a role, create a user               | Role updates, new user appears in directory + header switcher   | PASS   |
| **TC-59** | Delete User     | Positive      | As Manager, delete an agent via Team & Roles                        | Confirmation dialog; user removed; self-delete blocked          | PASS   |
| **TC-60** | Delete Ticket   | Positive      | As Manager, delete a ticket row from the tickets table             | Confirmation dialog; ticket + activity removed from the list    | PASS   |
| **TC-61** | Agent Gating    | Negative      | As Agent, visit Team & Roles and try to delete a ticket            | Manager-only notice on /users; no delete actions in the table   | PASS   |

## Requirements Traceability (excerpt)

| Requirement            | Test Coverage                        | Result            |
| :--------------------- | :----------------------------------- | :---------------- |
| FR-01 Search Tickets   | TC-01, TC-13, TC-14, TC-15, TC-52   | Pass              |
| FR-02 Filter Tickets   | TC-02, TC-16–TC-20, TC-51           | Pass              |
| FR-03 Ticket Detail    | TC-25, TC-26, TC-33, TC-34, TC-53   | Pass              |
| FR-04 Create Ticket    | TC-05, TC-36–TC-38, TC-50            | Pass              |
| FR-05 Assignment       | TC-03, TC-29–TC-31                   | Pass              |
| FR-06 Analytics        | TC-41, TC-42                         | Pass              |
| FR-07 SLA              | TC-04, TC-27                         | Pass              |
| FR-08 Sort by Customer | TC-54                               | Pass              |
| FR-09 User Accounts    | TC-57                               | Pass              |
| FR-10 User Management  | TC-58, TC-59, TC-61                | Pass              |
| FR-11 Delete Tickets   | TC-60, TC-61                        | Pass              |
| NFR-04 E2E workflows   | WF1–WF3 (Playwright, §12.5)         | Pass              |
| NFR-07 Stress 10k      | TC-56, stress harness test          | Pass              |