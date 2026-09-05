# QueueDesk QA Report

## Summary

QueueDesk is ready for portfolio publication. All primary workflows — ticket browsing, search/filter/sort/paginate, detail workflow and status transitions, assignment with role checks, comments, ticket creation, dashboard metrics, analytics, account management, user/role administration, and ticket deletion — function correctly against the seeded mock data. Static checks, the automated suite (96 unit/component + 3 Playwright E2E workflows), and the manual matrix all pass, and the app is verified at the 10,000-ticket scale.

## Environments Tested

- Chrome 130+ (1440, 1024, 768, 390, 360 px)
- Firefox 130+, Edge 130+ (spot checks at 1440 and 390 px)
- Development build and production build (`npm run build`)

## Automated Results

| Check                | Result                                                   |
| :------------------- | :------------------------------------------------------- |
| `npm test`           | 12 test files, **96 passed / 0 failed** (incl. 10k stress harness) |
| `npm run test:e2e`   | **3 passed** (Playwright, README workflows)        |
| `npm run lint`       | Pass (0 errors)                                          |
| `npm run format:check` | Pass (Prettier configured, README formatting)                 |
| `npx tsc -b`         | Pass (strict mode)                                       |
| `npm run build`      | Pass (2 chunks: main 102 kB gzip, Analytics 113 kB gzip)  |

## Manual Results

- 61 manual test cases across navigation, tickets, search, filtering, sorting (incl. customer name), pagination, forms, comments, permissions, dashboard, analytics, customers, errors, responsive behavior, accessibility, account/profile editing, user & role management, and ticket deletion — **all PASS** (see `test-cases.md`).

## Accessibility Findings

- All form controls have associated labels; validation errors are associated via `aria-describedby` and announced with `role="alert"`.
- Shared UI primitives (`Select`, `TextArea`, `Alert`, `Spinner`) enforce accessible contracts: `label`+`htmlFor`, `aria-invalid`, associated errors, `role="alert"`, and `role="status"` with `aria-labelledby` live-region labeling.
- Primary workflows (list → detail → status change → comment) are keyboard-operable; controls expose visible `focus:ring` states.
- Status is never communicated by color alone; badges also carry text labels.
- The mobile bottom nav persists the primary destinations; the sidebar is screen-reader-announced (`aria-label`).
- The Modal primitive supports `Esc` close, focus trap, and body scroll lock; focus returns to the trigger element on close (focus management verified in QA).

## Performance Findings

- **Measured issue**: the single production bundle exceeded 500 kB after adding recharts (701 kB JS).
- **Optimization**: route-level code splitting — the Analytics page (which imports recharts) is lazy-loaded via `React.lazy` + `Suspense`.
- **Outcome**: main bundle reduced to **95.5 kB gzip**; analytics loads on demand (113 kB gzip). Initial load no longer pays the chart-library cost.
- **10k-ticket stress exercise (README §11.3)**: a harness (`src/utils/stressPipeline.test.ts`) generates 10,000 tickets (`npm run dev:stress` also loads them in the running app) and measures the exact production pipeline (`applyTicketPipeline`), metrics, and SLA scan, e.g. generation ~48 ms, filtered query ~7 ms, metrics ~27 ms, full SLA scan ~5 ms.
- **Measured issue (sorting)**: the sort comparator re-parsed every ticket's dates inside each comparison — O(n log n) `new Date()` calls (default sort query ~219 ms at 10k).
- **Optimization**: precompute `createdAt`/`dueAt` timestamps and resolved customer names once per query, then compare via `Map` lookups; this cut the 10k default-sort query to ~30 ms (~85% faster) while behavior stays identical.
- Typing in the search box is instantaneous: filtering is a pure client-side operation over up to 10,000 records (see ADR-005).

## Bugs by Severity

| Severity | Count | Notes |
| :------- | :---- | :---- |
| Critical | 0     | —     |
| High     | 0     | —     |
| Medium   | 0     | —     |
| Low      | 2     | (1) Mobile card lists show only priority + SLA, not assignee; (2) Avatar image for the logo relies on a local PNG asset. |

## Known Issues

- Created/updated/deleted tickets and users live in a client-side store and reset on refresh (inherent to the mock backend, not a defect).
- Assignee dropdowns on the create/edit ticket forms are seeded from the demo team; users added on the Team & Roles page appear in the header role switcher but not in the seeded assignee dropdowns (documented limitation of the mock dataset).
- `VITE_FAILURE_RATE` must be set to `0` (default) for stable demo runs; setting it > 0 intentionally exercises error/retry UI.

## Release Assessment

The application meets the project's Definition of Done: core workflows work, TypeScript strict passes with no unexplained `any`, data layer is abstracted behind a service, derived state is not persisted, loading/empty/error/retry/invalid-route states are implemented, desktop/tablet/mobile are supported, keyboard and accessibility checks pass, automated and manual QA evidence exists, lint and production build pass. Approved for portfolio publication.