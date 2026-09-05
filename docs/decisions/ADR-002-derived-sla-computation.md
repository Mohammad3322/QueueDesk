# ADR 002: Derived SLA and Overdue Computations

## Context

Determining whether a ticket is overdue or due-soon can change continuously based on time.

## Options Considered

1. Store `isOverdue` as a boolean flag in the ticket database/state.
2. Dynamically calculate SLA status on-the-fly during rendering/selectors.

## Chosen Approach

Dynamically derived state computed via pure functions (`getSLAStatus(ticket)`).

## Reasoning

Persisting `isOverdue` creates state synchronization bugs and requires polling background workers to flip database flags. Pure functions eliminate state duplication.
