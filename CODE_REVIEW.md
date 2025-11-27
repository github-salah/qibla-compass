# Code Review Report

Date: 2025-12-01
Scope: Full review of current source files under `src/` focusing on relevance, quality, performance, coding standards, accessibility, privacy.

## Executive Summary
The codebase is structurally clean with separation of concerns (services, components, screens, context). Primary improvement opportunities:
- Performance: `CompassView` recreates tick elements every render; can memoize and reduce animation overhead + cleanup loops.
- Robustness: Animation loops (pulse/glow) lack guaranteed teardown; potential memory leak on rapid mount/unmount.
- Preferences & types: Generic update function not strictly typed; AsyncStorage import workaround can be simplified with a declaration file.
- Accessibility & UX: Settings sliders lack accessible labels; some components (Toast) lack role and screen-reader announcements; use of emoji for icons could have accessible labels.
- Haptics: Fires on each alignment update causing rapid triggers due to sensor jitter; should be debounced.
- Location privacy: Recent change improves minimal prompting, but constants still suggest re-prompt messaging; unify consistent messaging.
- Services: `HeadingService` fallback re-start logic could be clearer; maintain explicit reference to fallback listener.
- Error handling: Prefer returning structured error objects rather than generic strings; adopt discriminated union pattern for service responses.
- Magic numbers: Several hard-coded layout constants in `CompassView` replaced with responsive scalars; continue eliminating remaining fixed offsets.

## Detailed Review By File

### `services/HeadingService.ts`
Strengths: Clear primary vs fallback approach; normalized heading computation. Improvement: unify interval change logic, track fallback listener separately, guard exceptions. Provide explicit `isFallback()` method. Consider optional smoothing (moving average) to reduce jitter.

### `services/LocationService.ts`
Minimal and focused. Improvement: avoid throwing generic errors; return `Result` type: `{ ok: true, value: LocationResult } | { ok: false, code: 'PERMISSION_DENIED' | 'UNAVAILABLE' }`. Remove dependency on external constants inside service or map them at UI layer.

### `services/CitySearchService.ts`
Solid. Improvement: add abort controller for rapid successive queries; expose network error separately. Add small in-memory LRU cache for repeated city searches.

### `services/QiblaService.ts`
Concise. Improvement: rename `getRotationAngle` -> `getShortestRotationDelta` for clarity; consider memoizing frequent calculations if heading updates high frequency.

### `components/CompassView.tsx`
Most performance-sensitive. Improvements: memoize tick arrays, cleanup animation loops on unmount, debounce haptics, reduce re-computation by extracting calculations to `useMemo`. Optionally transition tick rendering to SVG for lower view count.

### `components/SearchCityModal.tsx`
Accessible and responsive. Improvement: convert results rendering to `React.memo` row; add abort controller; include network status changes accessible announcement guarded by preference.

### `components/Toast.tsx`
Simple transient UI. Improvement: ensure timeout cleanup with separate `useEffect`; add accessibility label and `role="alert"` semantics using announcements when variant is error/success.

### `components/HeaderBar.tsx`
Flexible. Improvement: optional left/right hidden semantics instead of rendering empty views; add safe area inset handling on Android if needed.

### `context/PreferencesContext.tsx`
Functional. Improvement: stronger typing for `update`; remove `any`; provide batch update function; clarify storage failure fallback.

### `context/ThemeContext.tsx`
Integrates accessibility scaling. Improvement: Avoid recomputing scaled typography on every preference change unrelated to typography by isolating dependencies; expose derived scaling factor.

### `screens/HomeScreen.tsx`
Logic cohesive. Improvement: use `useCallback` for `setupLocationAndCompass`; separate state concerns (location vs UI error) into a reducer for clearer transitions.

### `screens/SettingsScreen.tsx`
Feature-rich. Improvement: slider accessible labels; dynamic help text; possible grouping into sections with collapsible containers for long lists.

### `utils/constants.ts`
Centralized. Improvement: add type for `ERROR_MESSAGES`; ensure messages not used where user rejected location permanently.

### `utils/calculations.ts`, `declination.ts`, `platform.ts`
(Not reviewed—should be validated for algorithmic efficiency; consider tree-shaking by exporting only needed functions.)

## Prioritized Action Items (Implementation Plan)
1. CompassView performance & cleanup (high impact).
2. Haptic debounce to improve UX (high).
3. Preferences typing improvement (medium-high).
4. Add slider accessibility improvements (medium).
5. HeadingService interval & fallback reference refinement (medium).
6. Type declarations stub for slider for build cleanliness (low-medium).
7. Toast accessibility improvement (low-medium).
8. Optional: Result-type pattern for LocationService (medium) – deferred.

## Non-Goals (For future phases)
- Full migration to SVG/Canvas for compass – larger refactor.
- Internationalization of all strings – separate feature track.
- Smoothing heading values (sensor fusion) – needs testing.

## Coding Standards Alignment
- Separation of concerns: good.
- Naming: mostly clear; some improvement for rotation delta naming.
- Error handling: basic; structured errors recommended.
- Accessibility: improved recently; further enhancements needed for dynamic announcements & role semantics.
- Performance: Acceptable for typical devices; can reduce view count & re-renders further.

## Implementation Notes
Changes will be minimal and surgical, focused on high-impact areas without altering public APIs or user-visible flows beyond improvements.

---
End of Report.
