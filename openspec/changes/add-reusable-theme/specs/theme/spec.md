## ADDED Requirements
### Requirement: Dynamic Theming
The system MUST provide a dynamic theming mechanism that allows the application to switch between visual themes (e.g., Light and Dark) at runtime.

#### Scenario: Default Theme
- **WHEN** the app launches for the first time
- **THEN** it should use the system preference or default to Light theme

#### Scenario: Theme Switching
- **WHEN** the user toggles the theme preference
- **THEN** the UI should immediately update to reflect the new theme colors
