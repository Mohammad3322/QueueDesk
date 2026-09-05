# ADR 004: Mobile Ticket Card Layout Instead of Compressed Table

## Context

The desktop ticket list is a dense table with seven columns. Compressing that table into a 360px viewport produces clipped text, unreadable type, and controls too small to operate. Support agents commonly triage from tablets and phones, so the mobile experience must preserve the most operationally important fields: ticket ID, subject, priority/status, customer, assignee, and deadline.

## Options Considered

1. Horizontal scroll on the desktop table for mobile.
2. A responsive "compressed" table with fewer, hidden columns.
3. A separate card-based layout (`md:hidden`) that renders each ticket as a card.

## Chosen Approach

A dedicated mobile card layout. The desktop table is rendered with `hidden md:block` and a card grid with `grid grid-cols-1 md:hidden`. Each card prioritizes the operational fields and embeds a clickable ticket link and SLA badge.

## Reasoning

A card layout lets each field take its natural space, keeps touch targets comfortable, and communicates SLA/priority status at a glance. It avoids the "pinch and squint" interaction of horizontal scrolling and avoids hiding context that agents need while triaging.

## Tradeoffs

- Two visual representations of the same data must be maintained (risk of divergence).
- Cards are taller than table rows, so more scrolling on mobile.
- Column-specific comparisons (e.g., scanning all due-soon rows) are harder on mobile.

## Reconsider When

- The table's column set stabilizes and gets redrawn often; a single responsive table abstraction becomes cheaper with CSS container queries.
- The team adopts a data-grid library (TanStack Table) with native responsive helpers.