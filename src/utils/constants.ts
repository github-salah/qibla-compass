// Kaaba coordinates in Mecca, Saudi Arabia
export const KAABA_LATITUDE = 21.422487;
export const KAABA_LONGITUDE = 39.826206;

// Error messages
export const ERROR_MESSAGES = {
  LOCATION_PERMISSION_DENIED: 'Location permission is required to find Qibla direction. Please enable location access in your device settings.',
  LOCATION_UNAVAILABLE: 'Unable to get your location. Please ensure GPS is enabled and try again.',
  SENSOR_UNAVAILABLE: 'Compass sensor is not available on this device.',
  CALIBRATION_NEEDED: 'Compass needs calibration. Move your device in a figure-8 pattern.',
};

// Permission request messages
export const PERMISSION_MESSAGES = {
  LOCATION_REQUEST: 'This app needs access to your location to calculate the Qibla direction.',
};

// Calibration thresholds
export const CALIBRATION_THRESHOLD = 0.5; // Threshold for sensor accuracy
