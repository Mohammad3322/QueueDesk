# ADR 006: Context for the Simulated Current User

## Context

The application uses a simulated role system (Agent / Manager) with no real authentication. The current user is needed application-wide: the header shows the avatar/name, the sidebar gates Analytics, and ticket work is permission-checked against the current user (`canAssignTicket`, `canEditTicket`, `canChangePriority`, `canViewAnalytics`).

## Options Considered

1. Prop-drill the current user through every component tree.
2. A global React Context (`UserProvider`) with `currentUser` and `setCurrentUser`.
3. Module-level global mutable state.

## Chosen Approach

A `UserProvider` context exposing `{ currentUser, setCurrentUser }`. `useUser()` throws if used outside the provider, making misuse a loud failure.

## Reasoning

The current user changes rarely (only when the persona is switched) but is read widely across independent feature trees. Context provides a single source of truth without prop-drilling, and the "throw outside provider" guard prevents silent `undefined` bugs. Centralized permission functions in `src/utils/permissions.ts` keep business rules out of JSX per the README requirement.

## Tradeoffs

- Context value changes rerender every consumer, even if only the avatar changed.
- The provider must wrap the router, coupling concern of providers and routes in `App.tsx`.
- No persistence: a refresh resets the persona to the default manager.

## Reconsider When

- Real authentication arrives; the user should be fetched from an auth provider, stored server-side, and this simulated switcher removed.
- The app grows enough that a state library with selectors (Zustand/Redux) is justified to limit rerenders.