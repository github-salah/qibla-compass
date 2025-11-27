import { calculateQiblaDirection } from '../utils/calculations';
import { KAABA_LATITUDE, KAABA_LONGITUDE } from '../utils/constants';

/**
 * QiblaService - Calculates Qibla direction
 * Following Single Responsibility Principle
 */
class QiblaService {
    /**
     * Calculate the Qibla direction from user's location
     * @param userLatitude - User's current latitude
     * @param userLongitude - User's current longitude
     * @returns Bearing to Qibla in degrees (0-360)
     */
    calculateQiblaDirection(userLatitude: number, userLongitude: number): number {
        return calculateQiblaDirection(
            userLatitude,
            userLongitude,
            KAABA_LATITUDE,
            KAABA_LONGITUDE
        );
    }

    /**
     * Calculate the angle to rotate the compass to point to Qibla
     * @param currentHeading - Current device heading (0-360)
     * @param qiblaDirection - Direction to Qibla (0-360)
     * @returns Rotation angle in degrees
     */
    getRotationAngle(currentHeading: number, qiblaDirection: number): number {
        // Calculate the difference between Qibla direction and current heading
        let angle = qiblaDirection - currentHeading;

        // Normalize to -180 to 180 range for shortest rotation
        if (angle > 180) {
            angle -= 360;
        } else if (angle < -180) {
            angle += 360;
        }

        return angle;
    }
}

// Export singleton instance
export default new QiblaService();
