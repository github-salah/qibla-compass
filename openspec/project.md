# Project Context

## Purpose
QiblaApp is a lightweight, privacy-first mobile application that helps users find the direction of the Qibla (Kaaba in Mecca) from their current location. The app prioritizes a minimal and elegant UI, high accuracy using device sensors and declination correction, and robust offline behavior. It is targeted primarily at Android with a codebase structured to allow iOS support later.

## Tech Stack
- **Frontend**: React Native (Expo SDK 54) with TypeScript
- **Navigation**: React Navigation (Stack)
- **Native Modules**: 
    - `react-native-compass-heading` (for compass data)
    - `expo-location` (for geolocation)
    - `expo-haptics` (for tactile feedback)
    - `expo-system-ui` & `expo-status-bar` (for UI control)
- **Utilities**: Custom TypeScript modules for bearing and declination calculations
- **Build**: Expo CLI, `expo prebuild` for native generation
- **Testing**: Jest (implied support via devDependencies)

## Project Conventions

### Code Style
- **Language**: TypeScript
- **Formatting**: Prettier (implied)
- **Naming**: 
    - `camelCase` for variables/functions
    - `PascalCase` for Components/Classes
    - `kebab-case` or `PascalCase` for files (currently mixed, e.g., `App.tsx`, `HomeScreen.tsx`, `index.ts`)

### Architecture Patterns
- **Screens**: Located in `src/screens` (e.g., `HomeScreen`, `AboutScreen`).
- **Components**: Reusable UI elements in `src/components`.
- **Services**: `src/services` containing singleton classes:
    - `LocationService`: Handles permissions and retrieving current location.
    - `QiblaService`: Encapsulates Qibla direction calculation logic.
- **Utils**: `src/utils` for pure functions and constants:
    - `calculations.ts`: Math for bearing/distance.
    - `declination.ts`: Magnetic declination adjustments.
    - `constants.ts`: App-wide constants.
    - `platform.ts`: Platform-specific helpers.
- **State Management**: Local state (React `useState`/`useEffect`) and props passing.

### Testing Strategy
- **Unit Tests**: Jest for utility functions (calculations, declination).
- **Component Tests**: React Native Testing Library (recommended).

### Git Workflow
- **Branching**: Feature branches merged into `main`.
- **Commits**: Conventional Commits recommended.

## Domain Context
- **Qibla**: Direction to Kaaba (21.422487, 39.826206).
- **Calculation**: Uses great-circle bearing formula.
- **Magnetic Declination**: Difference between magnetic north and true north, crucial for compass accuracy.

## Important Constraints
- **Privacy**: Location data stays on device.
- **Offline First**: Core functionality (compass) works without internet (assuming last known location or manual entry if implemented).
- **Android Focus**: Current build targets Android (`expo run:android`).

## External Dependencies
- `expo-location`
- `react-native-compass-heading`
- `react-navigation` ecosystem


