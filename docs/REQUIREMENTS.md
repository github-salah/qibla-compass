# QiblaApp — Requirements & Design

Version: 1.0
Date: 2025-11-30

This document describes functional requirements, non-functional requirements, UX/UI guidelines, architecture and development patterns, testing and release checklist for the Qibla Finder app. The goal is a minimal, elegant, and production-ready Android app (can be extended to iOS) that accurately shows Qibla direction and works reliably on-device.

---

## 1. Purpose

- Provide users with an accurate, easy-to-use Qibla direction finder.
- Keep UI minimal and elegant — one screen to view heading and Qibla bearing, with quick access to settings and an about page.
- Work offline (no network dependency for core functionality) and handle permissions, calibration, and device sensor differences gracefully.

## 2. Scope

- Core features: heading display, Qibla bearing calculation, alignment guidance, location acquisition, calibration hints, permission/error handling.
- Non-core features: history/logs, analytics, theming (light/dark), optional haptic feedback and toast messages.

---

## 3. Functional Requirements

### 3.1 Location
- R3.1.1: App requests location permission at runtime with clear rationale.
- R3.1.2: If permission granted, obtain a best-effort location using fused location API (GPS + network) and fallback to last-known location.
- R3.1.3: If permission denied, allow manual location entry (latitude/longitude) with an easy UI path.

### 3.2 Heading
- R3.2.1: Use the best available heading source on the device: prefer a fused native heading provider; if not available, use sensor fusion (magnetometer + accelerometer with tilt compensation) or platform fused heading service.
- R3.2.2: Convert magnetic heading to true heading using geomagnetic declination when possible.
- R3.2.3: Smooth noisy readings (low-latency smoothing filter) but still respond quickly to turns.

### 3.3 Qibla Calculation and Guidance
- R3.3.1: Compute great-circle bearing from user location to Kaaba (21.422487° N, 39.826206° E) using haversine/bearing formula.
- R3.3.2: Display the Qibla bearing visually as an overlay arrow on the compass and numerically with degree value.
- R3.3.3: Provide an alignment mode that highlights when user is within a configurable tolerance (e.g., ±5°).

### 3.4 UX Interactions
- R3.4.1: Provide immediate visual feedback when the device is not calibrated or sensors are unreliable (show calibration animation/hint).
- R3.4.2: Provide a manual retry button for location and heading acquisition.
- R3.4.3: Provide a small settings screen for units, alignment tolerance, and optional haptics.

### 3.5 Error Handling
- R3.5.1: Gracefully handle permission denial, sensor unavailability, and exceptions — present actionable messages.
- R3.5.2: Cache the last known-good location and heading and use them to show a degraded but functional UI.

---

## 4. Non-Functional Requirements

- NFR1: Offline-first: the app must work without network for core functions.
- NFR2: Latency: heading updates should feel smooth; aim for update rate ≤ 200ms and visibly smooth transitions.
- NFR3: Battery: avoid high-frequency sensor polling when app is backgrounded or screen off.
- NFR4: Security: don't store secrets in repository; keystores and credentials must be kept outside VCS.
- NFR5: Accessibility: support TalkBack and dynamic font sizes.
- NFR6: Compatibility: support Android 9 (API 28) and above; prefer API 24+ where necessary.

---

## 5. UX / UI Guidelines (Minimal & Elegant)

Principles
- Keep single-screen focus: main screen shows current heading and Qibla arrow. Secondary actions (settings/about) reachable via subtle controls.
- Use a restrained color palette: one primary color, black/white neutral backgrounds, and one accent color for alignment/confirmation.
- Use large, legible typography for heading values and a high-contrast pointer.
- Avoid visual clutter: keep auxiliary information small and optional.

Layout
- Top: small status row (permission status, location accuracy indicator)
- Middle: large circular compass with heading ticks and Qibla arrow
- Bottom: numeric heading and degree indicator, small action row with `Retry`, `Settings`, `About`.

Micro-interactions
- Smooth animated rotation of compass elements using short easing curves.
- Subtle pulse/haptic when alignment achieved.
- Calibration hint uses a simple bouncing icon and brief instruction.

Theming
- Provide light and dark themes; default to follow system setting.

Accessibility
- All primary controls have accessible labels.
- Contrast ratios meet WCAG AA for primary elements.

Example Colors (suggested)
- Primary: #0A84FF (blue) — used for active elements and alignment highlight
- Background: #FFFFFF / #0A0A0A
- Accent: #34C759 (success)

Fonts
- Use system UI fonts for performance and native look (Roboto on Android).

---

## 6. Architecture & Patterns

High-Level
- Use a componentized architecture: UI components (`CompassView`, `StatusBar`, `SettingsModal`) separate from services (`HeadingService`, `LocationService`, `DeclinationService`).
- Keep sensor and platform integration isolated behind an interface so implementations can be swapped (native compass module, expo-location, sensor fusion fallback).

Patterns
- Dependency Injection (lightweight): pass services via props or simple factory functions.
- Observer/Subscribe model for sensor updates (e.g., event emitter or RxJS-like observable) to decouple UI animation from raw sensor data.
- Command/Action pattern for user actions like `Retry`, `StartCalibration`, `OpenSettings`.

Data Flow
- Unidirectional data flow: sensor -> service -> normalized state -> UI.

Storage
- Use simple local storage (AsyncStorage) for settings and last-known location; encrypt sensitive items if any.

Testing
- Unit tests for math (bearing/declination), tilt compensation, and utilities.
- Integration tests for permission flows and location fallbacks.

---

## 7. Sensor & Heading Strategy (Recommended)

Priority
1. Native fused heading provider (`react-native-compass-heading` or platform fused API)
2. Platform fused heading (e.g., `Location.getHeadingAsync()` on expo-location)
3. Sensor fusion using magnetometer + accelerometer with tilt compensation

Compensation & Correction
- Apply geomagnetic declination correction using a library or NOAA geomag model; fallback to regional average when model not available.
- Smooth heading using a circular low-pass filter (account for wraparound at 360°).

Calibration
- Detect sensor instability; show calibration UI and recommend device rotation when necessary.

---

## 8. Privacy and Permissions

- Only request `ACCESS_FINE_LOCATION` when needed; show an in-app explanation for why location improves Qibla accuracy.
- Do not transmit raw sensor data or location to external servers by default. If telemetry is added, make it opt-in.
- Provide a privacy policy link in `About` and ensure compliance with Play Store requirements.

---

## 9. Testing & QA

- Unit tests: math utilities, declination, heading smoothing.
- Device tests: verify on multiple Android vendors (Samsung, Pixel, OnePlus) for sensor variations.
- Accessibility tests: TalkBack walkthrough, large font sizes.
- Edge cases: Permission denial, sensor missing, airplane mode, battery saver.

CI
- Run TypeScript type checks and test suite on push.

Manual QA checklist
- Location permission flows
- Heading accuracy vs known directions
- Qibla alignment within tolerance at several world cities
- App behavior after backgrounding/foregrounding

---

## 10. Release & Distribution

- Prepare signed AAB for Play Store (secure keystore, update versionCode/versionName).
- Prepare privacy policy and store listing assets (screenshots demonstrating compass UI).
- Staged rollout recommended for first release (e.g., 5-10% percent) to detect device-specific issues.

---

## 11. Developer Workflow & Recommended Tooling

- Node.js (LTS), Yarn or npm, TypeScript
- Expo CLI for development; use `expo prebuild` and local Gradle for native builds when using native modules
- EAS for cloud builds (optional)
- CI: GitHub Actions or similar to run tests and TypeScript checks

---

## 12. Deliverables

- `docs/REQUIREMENTS.md` — this document
- `src/components/CompassView.tsx` — presentational component
- `src/components/QiblaCompass.tsx` — sensor + location orchestration
- `src/utils/declination.ts` — declination utilities
- `android/keystore/README.md` — keystore instructions
- Tests: `__tests__` for utilities

---

## 13. Appendix — Math Reference

- Bearing formula (from lat1, lon1 to lat2, lon2):

  - Convert degrees to radians.
  - y = sin(dLon) * cos(lat2)
  - x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon)
  - initial_bearing = atan2(y, x) in radians
  - convert to degrees and normalize to 0..360

---

If you'd like, I can also:
- Add a small design spec with grayscale wireframes and a Figma starter file.
- Produce a `CONTRIBUTING.md` and code-style rules, or scaffold CI workflows.

Next: I can add coding standards, folder structure, and CI/QA checklists into the docs. Proceed?
