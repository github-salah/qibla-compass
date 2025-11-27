## ADDED Requirements
### Requirement: Device Flatness
The system MUST detect if the device is not held flat.

#### Scenario: Device Tilt
- **WHEN** the device tilt exceeds a threshold (e.g., 15 degrees)
- **THEN** a "Hold device flat" warning MUST be displayed
- **AND** the compass accuracy warning MAY be shown

### Requirement: Manual Location
The system MUST allow users to manually search and select a city.

#### Scenario: City Search
- **WHEN** the user searches for a city
- **THEN** a list of matching cities MUST be displayed
- **AND** selecting a city MUST update the Qibla calculation to that location

### Requirement: Visual Alignment
The system MUST use a non-intrusive visual cue for alignment.

#### Scenario: Green Glow
- **WHEN** aligned with Qibla
- **THEN** a green indicator (line or glow) MUST activate
- **AND** no toast message SHALL obstruct the view
