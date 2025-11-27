# Privacy Notes

This app minimizes permissions and data storage.

- Location permission is requested only once on initial GPS attempt.
- If the user denies location, the app switches to manual city search without repeated prompts.
- A toggle "Enable GPS" allows the user to retry granting permission later.
- No background location usage; only foreground and only when user explicitly requests GPS.
- Settings are stored locally in AsyncStorage without requiring extra storage permissions.
- No analytics, advertising SDKs, or remote logging of location or heading data.
- Heading and sensor data are transient; not persisted.
- Manual city selection is used only for Qibla calculation and not stored remotely.

## Preference Flags
- `locationDenied`: Indicates the user previously denied location; suppresses automatic re-requests.
- `announceAccessibility`: Optional screen reader announcements; off by default.
- `reduceMotionEnabled`: Disables animations for accessibility and subtle privacy (less sensor churn).

## Future Considerations
- Provide an explicit export/import settings feature without cloud sync.
- Offer a "Clear Manual City" quick action to remove any stored city (currently not persisted).
- Consider a privacy dashboard summarizing active sensors.
