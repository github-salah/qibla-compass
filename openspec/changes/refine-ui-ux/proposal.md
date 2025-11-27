# Change: Refine UI and UX

## Why
User feedback indicates issues with the Compass interaction (sluggishness, confusing pulse/toast behavior), visual design (missing outer ring, font choice), and specific screen elements (About Us button/screen).

## What Changes
- **Fonts**: Integrate a custom font (e.g., Inter) for a more elegant look.
- **Compass Logic**:
    - Make "Facing Qibla" toast persist while aligned.
    - Ensure pulse animation only activates when aligned.
    - Tune rotation animation for better responsiveness.
    - Add a detailed outer ring with ticks.
- **Home Screen**: Restyle "About Us" button.
- **About Screen**: Redesign layout and back button.

## Impact
- **Dependencies**: Add `expo-font` and `@expo-google-fonts/inter` (or similar).
- **Code**: `CompassView.tsx`, `HomeScreen.tsx`, `AboutScreen.tsx`, `theme.ts`, `App.tsx`.
