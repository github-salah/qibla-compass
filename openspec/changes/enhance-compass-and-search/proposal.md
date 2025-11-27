# Change: Enhance Compass and Add City Search

## Why
User feedback highlights UI/UX gaps in the compass (fixed outer ring, lack of flatness feedback, overlapping messages) and a need for manual location entry (City Search) for users without GPS or who want to check other locations.

## What Changes
- **Compass UI**:
    - Rotate Outer Ring (NSEW) with heading.
    - Add "Hold device flat" warning using accelerometer.
    - Replace alignment toast with a subtle "Green Line/Glow" effect.
    - Increase tick density on the outer ring.
- **City Search**:
    - Add a Search feature to manually find and set location.
    - Use a free Geocoding API (e.g., Open-Meteo).
    - Allow toggling between GPS and Manual location.

## Impact
- **Dependencies**: Add `expo-sensors` (for flatness).
- **Code**: `CompassView.tsx`, `HomeScreen.tsx`, `LocationService.ts`, new `SearchCityModal.tsx`.
