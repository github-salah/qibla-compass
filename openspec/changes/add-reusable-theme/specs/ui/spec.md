## ADDED Requirements

### Requirement: Elegant Reusable Theme
The system SHALL provide a reusable, accessible, and minimal theme package named `elegant-theme` which exposes design tokens, a `ThemeProvider`, and a `useTheme` hook for components to consume.

#### Scenario: Theme tokens available
- **WHEN** an app imports the theme tokens
- **THEN** it can access `colors`, `spacing`, `typography`, and `shadows` objects

#### Scenario: ThemeProvider wraps app
- **WHEN** `ThemeProvider` is used at the root of the app
- **THEN** child components receive theme values and `useTheme()` returns the current theme object

#### Scenario: Light and dark modes
- **WHEN** system prefers dark mode or user selects dark theme
- **THEN** `ThemeProvider` supplies dark token variants and components adapt accordingly

#### Scenario: Accessibility
- **WHEN** user enables large fonts
- **THEN** typography tokens scale and components layout adjusts without overlap


## MODIFIED Requirements

### Requirement: CompassView theming
The `CompassView` component SHALL consume the `elegant-theme` tokens for colors, spacing, typography, and adapt to theme changes.

#### Scenario: Compass uses theme colors
- **WHEN** theme changes from light to dark
- **THEN** `CompassView` updates its colors and contrast immediately

*** End of spec delta
