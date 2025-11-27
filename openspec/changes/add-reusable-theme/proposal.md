# Change: Add Reusable Theme

## Why
The current theme implementation is a static object, which makes it difficult to support dynamic theming (e.g., dark mode) or context-aware styling. A reusable theme system is needed to ensure consistency and support modern UI/UX best practices.

## What Changes
- Implement a `ThemeContext` and `ThemeProvider`.
- Update `theme.ts` to support light and dark modes.
- Create a `useTheme` hook for consuming theme values.
- Refactor existing components to use the new theme system.

## Impact
- **Specs**: Adds `theme` capability.
- **Code**: `src/styles/theme.ts`, new `src/context/ThemeContext.tsx`.
