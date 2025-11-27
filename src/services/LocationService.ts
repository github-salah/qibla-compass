import * as Location from 'expo-location';
import { ERROR_MESSAGES } from '../utils/constants';

export interface LocationResult {
    latitude: number;
    longitude: number;
}

export interface LocationError {
    message: string;
}

/**
 * LocationService - Handles all location-related functionality
 * Following Single Responsibility Principle
 */
class LocationService {
    /**
     * Request location permissions from the user
     */
    async requestPermission(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return false;
        }
    }

    /**
     * Check if location permission is already granted
     */
    async hasPermission(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error checking location permission:', error);
            return false;
        }
    }

    /**
     * Get current location coordinates
     * @returns LocationResult with latitude and longitude, or throws error
     */
    async getCurrentLocation(): Promise<LocationResult> {
        try {
            // Assume permission already granted; caller decides when to request
            const hasPermission = await this.hasPermission();
            if (!hasPermission) {
                throw new Error(ERROR_MESSAGES.LOCATION_PERMISSION_DENIED);
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.LOCATION_PERMISSION_DENIED) {
                throw error;
            }
            throw new Error(ERROR_MESSAGES.LOCATION_UNAVAILABLE);
        }
    }

    /**
     * Reverse geocode a lat/lon to get city/locality name.
     * Returns a best-effort city string or null if unavailable.
     */
    async getCityName(latitude: number, longitude: number): Promise<string | null> {
        try {
            const results = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (results && results.length > 0) {
                const r = results[0];
                // Prefer city, then region or subregion, then name
                return r.city || r.subregion || r.region || r.name || null;
            }
            return null;
        } catch (error) {
            console.warn('Reverse geocode failed:', error);
            return null;
        }
    }
}

// Export singleton instance
export default new LocationService();
