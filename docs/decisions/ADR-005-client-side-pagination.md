# ADR 005: Client-Side Pagination for the Portfolio Scale

## Context

The README defines working-scale assumptions of 100–300 tickets per day and ~2,000 active tickets, with 100,000+ historical tickets as a production-scale discussion only. The portfolio dataset is 75 tickets, stress-tested to 10,000 for performance QA. Loading all records, then searching/filtering/sorting/paginating on the client, is reasonable at these sizes.

## Options Considered

1. Server-side filtering, sorting, and pagination via query parameters.
2. Client-side derived-state pipeline (`tickets → search → filters → sorting → pagination`).
3. A hybrid: client-side filtering with a fixed initial cap.

## Chosen Approach

Client-side derived-state pipeline. `useFilteredTickets` derives the visible page from the full ticket array using URL parameters, and `useFilteredTickets` clamps invalid page numbers after filtering.

## Reasoning

At the portfolio scale, a pure function is simple, instant, and trivially testable (the pipeline has dedicated unit tests). It avoids per-keystroke network round trips, which keeps the search box responsive. The README explicitly permits client-side implementation while requiring the design to acknowledge when this would change.

## Tradeoffs

- Whole dataset is held in memory and transferred to the browser.
- Initial load cost grows linearly with ticket count.
- No shared server authority on what "page 2" means.

## Reconsider When

- Total records exceed a client-reasonable threshold (evidence: the 10,000-ticket performance test). Beyond ~10–20k records, server-side pagination with `?status=open&page=2&sort=dueAt` becomes necessary, and the service layer (ADR-003) is the right boundary for that change.