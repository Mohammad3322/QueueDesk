# ADR 001: URL-Driven State for Filters, Search, and Pagination

## Context

Operators need to share specific queue views, refresh pages without losing context, and use browser forward/back buttons seamlessly.

## Options Considered

1. Global React Context State
2. Local Component State
3. Router URL Search Parameters (`useSearchParams`)

## Chosen Approach

Router URL Search Parameters.

## Reasoning

URL state ensures complete view persistence across refreshes, native browser history support, and link shareability between agents and managers.

## Tradeoffs

Slightly higher complexity when parsing URL params into typed filter structures.
