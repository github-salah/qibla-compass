# Khair Labs - Qibla Finder

A cross-platform Islamic compass app for Android and iOS that helps Muslims find the Qibla direction using device sensors and GPS.

A Qibla Compass (Open Source)

Lightweight, privacy-conscious Qibla direction finder built with Expo & React Native.
 - ✅ **Real-time Compass**: Smooth compass updates using the platform fused-heading provided by `expo-location`
## Features
- Instant compass rotation (Reanimated) & alignment glow
- Dynamic tolerance band & bearing indicator
- Reverse geocoded city detection
- One-time tutorial & optional rating prompt
- Accessible announcements & reduced-motion support
- Manual city search with offline fallback
- **Android**: 5.0 (API 21) and above
## Getting Started
```bash
git clone <REPO_URL>
cd QiblaApp
npm install
npm run android   # or: npm run web
```

## Scripts
- `npm run android` – Android development build
- `npm run web` – Web preview
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript checks
## 🏗️ Architecture
## Project Structure (Simplified)
```
src/
   components/    # UI parts (CompassView, overlays)
   screens/       # App screens (Home, Settings, About)
   services/      # Location, Heading, Qibla logic
   context/       # Theme & Preferences providers
   accessibility/ # A11y strings
```
This app follows **Clean Architecture** and **SOLID principles**:
# Tech Stack
- Expo SDK / React Native
- React Native Reanimated
- Expo Sensors & Location
- For Android: Android Studio or Expo Go app
## Privacy
No analytics or tracking. External calls: reverse geocode (Expo Location) & connectivity check (Google 204).
- For iOS: Xcode (macOS only) or Expo Go app
## Contributing
Open issues / PRs welcome. See `CONTRIBUTING.md` (pending).

## License
MIT – see `LICENSE`.
### Installation
## Maintainers
Concept & Product Direction: Shamsuddin Altamash  
Engineering & Implementation: Salahuddin Abdul Gaffar

## Roadmap
- Optional EAS builds / OTA updates
- iOS adaptive icon & store assets
- Offline caching for reverse geocode
- Extended haptic feedback profiles
1. Clone the repository:
## Security
Report vulnerabilities privately (see `SECURITY.md` when added).
```bash
## Support
If beneficial, share with others. May it help – Ameen.
cd QiblaApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your device:
   - **Android**: Press `a` or scan QR code with Expo Go
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Web**: Press `w` (limited functionality)

## 🔧 Building for Production

### Android APK

```bash
npx expo build:android
```

### iOS IPA

```bash
npx expo build:ios
```

## 📦 Dependencies

- **expo**: Cross-platform development framework
- **react-native**: Mobile app framework
- **@react-navigation/native**: Navigation library
- **expo-location**: GPS and location services
- **expo-location**: GPS and fused-heading via platform sensors
- **react-native-screens**: Native navigation performance

## 🧪 Testing

The app includes comprehensive error handling for:
- Location permission denial
- GPS unavailable
- Sensor unavailable
- Network issues
- Calibration requirements

## 🎯 Technical Details

### Qibla Calculation

The app uses the **Haversine formula** to calculate the great-circle bearing from the user's location to the Kaaba in Mecca (21.422487°N, 39.826206°E).

### Compass Implementation

- **Primary**: Uses device rotation vector sensor
- **Fallback**: Combines magnetometer + accelerometer with tilt compensation
- **Accuracy**: Calculates sensor accuracy and prompts calibration when needed

## 👥 Team

- **Idea & Vision**: Shamsuddin Altamash
- **Development**: Salahuddin Abdul Gaffar

## 📄 License

This app is provided free of charge as a service to the Muslim community worldwide.

## 🤲 Support

May Allah accept our efforts and make this app beneficial for all Muslims. Ameen.

---

**Package**: `org.khairlabs.qibla`  
**Version**: 1.0.0  
**Company**: Khair Labs
