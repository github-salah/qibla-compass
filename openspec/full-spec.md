# QiblaApp Open Specification (Archive State Before Rewrite)

Version: 1.0
Date: 2025-12-01
Status: Archived snapshot of current implementation prior to planned rewrite.

---
## 1. Purpose & Vision
QiblaApp helps users reliably determine the Qibla direction (toward the Kaaba) anywhere in the world with a minimal, accessible, privacy‑respecting experience. It optimizes:
- Fast, smooth directional feedback (high sensor update rate + Reanimated rotation)
- Clear alignment affordances (tolerance band, pulsating glow, haptics)
- Offline usability (manual city selection, cached preferences, no external analytics)
- Accessibility (screen reader announcements, reduced motion, high contrast, large text scaling)

Target Platform (current): Android (Expo SDK 54, React Native 0.81.x)
Secondary (future): iOS readiness (no platform‑blocking code in core logic; some modules require validation).

---
## 2. Scope
In-Scope (current state):
- Qibla bearing calculation from geolocation or manually selected city
- Real-time compass heading visualization with adaptive UI sizing
- Alignment detection and feedback (visual, tactile, auditory via a11y announcements)
- Manual city search (Open-Meteo Geocoding API)
- Basic rating prompt heuristic (session alignment count)
- Minimal onboarding tutorial overlay (one-time)
- Asset generation pipeline for store and adaptive icons
- CI/CD workflows (lint/typecheck/assets + Android release build artifacts)

Out-of-Scope (future candidates):
- Prayer time calculations
- Background alignment reminders
- Advanced sensor fusion / Kalman filtering
- Offline city database
- Multi-language localization (currently English only)
- Formal analytics / telemetry (intentionally omitted for privacy)

---
## 3. High-Level Architecture
Layers:
1. Presentation (Screens, Components)
2. Domain Services (LocationService, HeadingService, QiblaService, CitySearchService)
3. State Contexts (PreferencesContext, ThemeContext, Accessibility helper)
4. Utilities (Pure math & constants: calculations.ts, constants.ts)
5. Asset/Build Tooling (scripts/generate-assets.js, GitHub workflows)

Pattern Highlights:
- Service Singletons: Encapsulate platform APIs & side effects (SRP maintained)
- Pure Computation in utils: Deterministic math functions (testable)
- Context Providers: User/session preferences & theme adaptation
- React Hooks: Local ephemeral state (e.g., alignment, network status)
- Separation of Bearing vs Heading: Bearing computed once per location change; heading streamed continuously

---
## 4. Module Inventory & Responsibilities
### Services
- HeadingService: Magnetometer primary (20Hz), fallback `react-native-compass-heading`; normalization to 0–360°; dynamic interval adjustment (30–500ms).
- LocationService: Permission management, current position retrieval, reverse geocoding (best-effort city name inference priority: city → subregion → region → name).
- QiblaService: Bearing calculation wrapper using great-circle (forward azimuth) formula.
- CitySearchService: Debounced, cached paginated city lookup via Open-Meteo geocoding API, slicing 60-result batch locally.

### Contexts
- PreferencesContext: Persistent user settings (AsyncStorage): toleranceDeg, headingIntervalMs, hapticsEnabled, reduceMotionEnabled, highContrastEnabled, largeTextBoost, themeMode, locationDenied, showBearingIcon, tutorial/rating flags.
- ThemeContext: Combines system color scheme + accessibility scaling + high contrast override + custom palette.

### UI Components (Key)
- CompassView: Visual compass (outer rotating ring + upright cardinal labels + inner ticks + tolerance band + arrow + glow + pulse + flatness warning + alignment toast).
- HomeScreen: Orchestrator (location acquisition, heading stream, connectivity polling, reverse geocode refresh, rating prompt trigger, alignment instruction text, GPS/manual switching, tutorial gating).
- SearchCityModal: Debounced input, live results, incremental loading (paging) with accessibility announcements.
- CompassTutorial: Modal overlay with guidance steps; one-time display.
- RatePrompt: Modal tri-action overlay (Rate / Later / No Thanks) with store fallback.
- Toast: Ephemeral animated accessibility-friendly notification (alignment success).
- HeaderBar: Reusable top bar (title, subtitle, action icons).

### Utilities
- calculations.ts: degrees↔radians, normalizeAngle, forward azimuth bearing (great-circle) to Kaaba.
- constants.ts: Kaaba coordinates, error & permission messages, calibration threshold.

### Tooling
- Asset Generation Script: Creates adaptive icon foreground/background, mipmaps in multiple densities, feature graphic; auto placeholder (composite Kaaba icon) if missing source.
- GitHub Workflows: CI (install, typecheck, lint placeholder, asset build); Release (tag-driven AAB + APK build & artifact upload).

---
## 5. Data Model & State
### Preferences (AsyncStorage JSON)
```
{
  themeMode: 'system' | 'light' | 'dark',
  highContrastEnabled: boolean,
  reduceMotionEnabled: boolean,
  announceAccessibility: boolean,
  hapticsEnabled: boolean,
  toleranceDeg: number,
  headingIntervalMs: number,
  largeTextBoost: boolean,
  locationDenied: boolean,
  showBearingIcon: boolean,
  hasSeenCompassTutorial: boolean,
  askForRatings: boolean,
  hasPromptedForRating: boolean
}
```
Constraints:
- toleranceDeg: practical range 1–15 (not enforced yet; default 5)
- headingIntervalMs: clamped to [30, 500] in HeadingService

### Ephemeral Runtime State
- heading (number, 0–360)
- qiblaDirection (number, 0–360)
- manualCity (City | null)
- resolvedCityName (string | null)
- hasInternet (boolean | null)
- isFlat (derived from accelerometer z-axis threshold)
- alignment pulses (Reanimated shared value)
- alignment count (session variable used for rating heuristic)

### City Entity
```
{
  id: number,
  name: string,
  latitude: number,
  longitude: number,
  country?: string,
  admin1?: string
}
```

---
## 6. Core Algorithms
### Bearing Calculation (Forward Azimuth)
Formula: `bearing = atan2( sin(dLon)*cos(lat2), cos(lat1)*sin(lat2) - sin(lat1)*cos(lat2)*cos(dLon) )` → normalized degrees.
Characteristics:
- Accounts for spherical geometry
- Ignores elevation (not material for Qibla direction)

### Alignment Detection
```
deltaRaw = (heading - qiblaDirection + 540) % 360 - 180  // shortest signed difference
aligned = Math.abs(deltaRaw) <= toleranceDeg
```
Used by: glow/pulse activation, haptic rate-limited trigger, accessibility announcement transitions, rating heuristic.

### Heading Derivation (Magnetometer)
`heading = normalize( atan2(-x, y) * 180/π )` → orientation correction using device coordinate convention.

### Flatness Determination
`isFlat = |accelerometer.z| > 0.8` (approx tilt < 37° from horizontal).

### Tolerance Band Rendering
Angular span: `±span` where `span = max(6, toleranceDeg)` (ensures minimum visual thickness even at small numerical tolerance). Rendered as multiple small segments every 3° positioned radially between outer & inner ring for perceptual clarity.

---
## 7. Interaction & Flow Sequences
### App Startup
1. Preferences loaded from storage.
2. Theme resolves (system + overrides + scaling).
3. HeadingService started → subscription established.
4. Location permission requested (unless previously denied → show manual mode message).
5. If granted: geolocation fetched → Qibla bearing computed → reverse geocode city name (if network available).
6. Tutorial overlay shown if `hasSeenCompassTutorial === false`.

### Manual City Selection
1. User opens SearchCityModal.
2. Debounced query triggers CitySearchService (>=3 chars).
3. Results cached; pagination loads additional slices.
4. Selecting a city sets manualCity + updates current location reference + recomputes qiblaDirection + clears error state.
5. GPS override button available to revert to live location.

### Heading Update Loop
1. Magnetometer emits new readings at configured interval.
2. HeadingService normalizes & broadcasts value.
3. CompassView rotates outer/inner rings via shared value instantaneous update.
4. Alignment detection recalculates; triggers pulse/glow/haptics if entering aligned state.

### Connectivity Recovery
1. Periodic (15s) & AppState focus check perform a fast 204 fetch.
2. On transition from offline→online and no manualCity & no resolvedCityName: reverse geocode attempted.

### Ratings Prompt Trigger
1. Each distinct alignment event increments session counter when `askForRatings` and not yet prompted.
2. After threshold (3 alignments): RatePrompt overlay shown.
3. User action updates `hasPromptedForRating` and attempts in-app review flow or store fallback.

### Accessibility Announcements
- Alignment state change: announce entering or leaving alignment with turn adjustment degrees.
- Tutorial modal: initial guide announcement if screen reader enabled.
- City search: result count / selections announced when accessibility flag enabled.

---
## 8. UI/UX Specification
### CompassView Elements
| Element | Behavior | Accessibility |
|---------|----------|---------------|
| Outer Ring | Rotates with heading | Label text counter-rotates to stay upright |
| Cardinal Labels | N/E/S/W positioned absolute | High contrast coloring for North |
| Inner Ticks | 60 ticks (major every 90°) | Decorative (no a11y role) |
| Tolerance Band | Static at top; segments across ±span° | Visual alignment assistance; hidden if reduceMotion |
| Arrow + Kaaba Icon | Rotates relative to heading to point to Qibla | Icon accessible label with degrees |
| Glow + Pulse | Activated only when aligned & not reduceMotion | No rapid accessibility spam (toast handles message) |
| Alignment Toast | Ephemeral success message | role="alert" |
| Flatness Warning | Visible when phone tilt exceeds threshold | Clear instruction text |

### Status Panel Rows
- Qibla (rounded degrees)
- Heading (rounded degrees)
- City (manual / reverse geocoded / fallback / offline state)
- Adjustment (Aligned ✓ / Turn Left X° / Turn Right X°)
- GPS Revert Button (if manual city active)

### Tutorials & Prompts
- Tutorial: Sequence list of 5 guidance items; closable.
- Rating: Non-blocking modal with 3 actions; single-use heuristic.

### Color & Theme Strategy
- Light/Dark base with semantic palette (Emerald primary, Gold secondary).
- High Contrast: Elevates secondary text and borders to main text color.
- Large Text Boost: Manual scaling beyond system fontScale (capped).

### Motion Reduction
- Suppresses pulse/glow & tolerance band segmentation (band hidden when reduceMotion true + alignment toast still displays).

---
## 9. Preferences & Configuration
| Preference | Default | Impact |
|------------|---------|--------|
| toleranceDeg | 5 | Angular window for alignment; affects glow/pulse activation & guidance messaging |
| headingIntervalMs | 50 | Sensor sampling frequency; sets rotation responsiveness vs battery tradeoff |
| hapticsEnabled | true | Alignment tactile feedback gated at 800ms throttle |
| reduceMotionEnabled | false | Disables non-essential animations (pulse, glow, tolerance band) |
| highContrastEnabled | false | Adjusts secondary text & borders for readability |
| largeTextBoost | false | Adds extra scaling beyond system preferences |
| announceAccessibility | false | Enables live announcements for alignment & city search results |
| locationDenied | false | Avoids repeated permission prompts; enables manual mode interface |
| showBearingIcon | true | Toggles top bearing static indicator line |
| hasSeenCompassTutorial | false | Controls tutorial overlay display |
| askForRatings | true | Enables rating heuristic logic |
| hasPromptedForRating | false | Ensures one-time prompt behavior |

Persistence Strategy: Entire preferences object saved on each change; version key implicit via storage key naming.

---
## 10. Accessibility Specification
WCAG-Oriented Considerations:
- Text Scaling: Multiplicative scale derived from system font scale (+ optional boost) with cap to avoid overflow.
- Color Contrast: High contrast mode merges secondary text color with primary variant for stronger ratios.
- Motion Reduction: Aligns with user preference; removes non-essential animations and limits update frequency of announcements.
- Live Region Announcements: Debounced state transitions (alignment only on entering/leaving) prevents verbosity.
- Touch Targets: Buttons sized with adequate padding (>= 40px height effective).

Open Issues / Future Enhancements:
- Add dynamic role descriptions for adjustment row (explicit direction row live updates).
- Provide alternative symbolic representation for color-coded elements (e.g., pattern fill for tolerance band).

---
## 11. Performance & Reliability
Metrics (Qualitative):
- Heading latency: ~50ms target; rotation visually immediate via shared values.
- CPU: Reanimated handles transform on UI thread minimizing JS churn.
- Network: City search debounced (450ms), batched (60 results), cached by query string, aborts stale requests.
- Battery: Magnetometer 20Hz moderate; user-adjustable interval up to 500ms.

Potential Bottlenecks:
- Rendering tolerance band segments (loop every 3°) — acceptable due to static size; could optimize via canvas/SVG.
- Reverse geocode retries on unstable networks — currently single attempt when connectivity regained.

---
## 12. Privacy & Security
Privacy Principles:
- No analytics or telemetry.
- Location used transiently; never transmitted externally except reverse geocode & city search queries (external APIs).
- No credential or secret material stored in repo (.gitignore excludes keystore artifacts).
- Rating prompt does not collect feedback metrics — invokes platform review flow only.

Security Considerations:
- Network requests non-authenticated; limited risk surface.
- Potential improvement: Validate fetch failures vs. generic errors (prevent silent misclassification).
- Supply chain: Dependencies pinned via lockfile; CI ensures reproducible builds.

---
## 13. Error Handling & Resilience
Error Categories:
- Permission Denial → Switch to manual city mode; surfaces actionable button to enable GPS.
- Sensor Unavailability → Fallback to `react-native-compass-heading` (HeadingService state).
- Network Failure → Offline messaging ("No internet") + suppressed city search results.
- Reverse Geocode Failure → Graceful null handling; city row fallback text.

Logging Strategy: `console.warn` for recoverable network issues; `console.error` for service start failures.

---
## 14. CI/CD & Build Pipeline
CI Workflow (`.github/workflows/ci.yml`):
- Steps: checkout → setup node → install → typecheck → lint placeholder → asset generation → (optional build debug).
Release Workflow (`release-android.yml`):
- Trigger: Git tag
- Actions: `expo prebuild` → Gradle assemble (APK) + bundle (AAB) → Artifact upload.
Signing: Guidance for Play App Signing (external doc); keystore excluded from repository.

Asset Generation:
- Inputs: Source icon (1024x1024) or auto-generated placeholder (Kaaba + gradient).
- Outputs: Adaptive icon foreground/background, mipmap densities, feature graphic (1024x500).
- Placeholder Logic: If base icon missing, script composes simple emblem ensuring build continuity.

---
## 15. Extensibility & Future Enhancements
Potential Extension Points:
- Add `PrayerTimesService` integrating known algorithms (e.g., Muslim World League method) with user method preference.
- Internationalization (i18n) layer wrapping a11yStrings & visible labels.
- Replace tolerance band with dynamic arc overlay rendered via react-native-svg for smoother gradients.
- Implement sensor calibration guidance UI (figure-8 animation instructions).
- Integrate fallback city resolution using cached last successful reverse geocode when offline.
- Provide dev-mode debug panel (raw magnetometer vector, heading variance, smoothing toggle).

Refactor Opportunities for Rewrite:
- Consolidate alignment math into a dedicated `AlignmentService` (single source of truth).
- Formalize event bus for sensor + network state to reduce prop drilling.
- Adopt React Query or lightweight stale cache for reverse geocode & connectivity.
- Introduce test coverage harness (utilities + service mocks).
- Ensure strict lint/format setup (ESLint config + Prettier integration) replacing placeholder lint step.

---
## 16. Testing Strategy (Desired vs Current)
Current:
- Implicit coverage for utilities only (no present structured test suite in snapshot).
Desired in Rewrite:
- Unit: bearing calculation edge cases (polar regions, same longitude, near anti-meridian).
- Integration: HeadingService fallback sequencing.
- UI: Alignment transitions (mock heading stream), accessibility announcement rate limiting.
- E2E: Detox or Maestro scenario (manual city search + alignment + rating prompt).

---
## 17. Risk Register
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Magnetometer noise | Misalignment flicker | Introduce smoothing (low-pass filter) threshold + hysteresis |
| Network API changes (Open-Meteo) | City search breakage | Abstract API endpoint w/ versioned adapter |
| High alignment sensitivity | User frustration from jitter | Minimum displayed tolerance band width + haptic throttle |
| Large text overflow | Layout clipping | Dynamic scaling cap + responsive compass size calc |
| Fallback sensor drift | Direction inaccuracy | Periodic revalidation; optional calibration UI |

---
## 18. Glossary
- Bearing: Angle from true North to target location along great-circle path.
- Heading: Current orientation of device relative to magnetic/true North.
- Tolerance: Acceptable deviation (degrees) where alignment feedback triggers.
- Forward Azimuth: Method to compute initial heading from one geographic point to another.

---
## 19. Open Questions (For Rewrite Planning)
1. Should we apply magnetic declination correction or rely solely on true bearing? (declination util present historically but not integrated in current snapshot.)
2. Introduce persistent last-known successful location for offline reopens?
3. Provide dynamic tolerance suggestions based on sensor stability metrics?
4. Adopt service dependency injection to simplify testing (vs hardcoded singletons)?
5. Integrate PWA / web build or keep mobile-native focus?

---
## 20. Summary & Hand-Off
This specification captures the full functional and architectural state of QiblaApp prior to a planned rewrite. It enumerates core features, flows, preferences, algorithms, accessibility affordances, and operational tooling. Future development should leverage this archive to avoid regression in alignment feedback fidelity, accessibility performance, and offline resilience while pursuing identified extensibility and refactor opportunities.

End of Spec.
