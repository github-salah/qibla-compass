/**
 * Convert degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 */
export const radiansToDegrees = (radians: number): number => {
    return radians * (180 / Math.PI);
};

/**
 * Normalize angle to 0-360 range
 */
export const normalizeAngle = (angle: number): number => {
    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    return normalized;
};

/**
 * Calculate Qibla direction from user's location to Kaaba
 * Uses the Haversine formula for accurate great-circle bearing calculation
 * 
 * @param userLat - User's latitude in degrees
 * @param userLon - User's longitude in degrees
 * @param kaabaLat - Kaaba's latitude in degrees
 * @param kaabaLon - Kaaba's longitude in degrees
 * @returns Bearing in degrees (0-360) where 0 is North
 */
export const calculateQiblaDirection = (
    userLat: number,
    userLon: number,
    kaabaLat: number,
    kaabaLon: number
): number => {
    // Convert to radians
    const lat1 = degreesToRadians(userLat);
    const lon1 = degreesToRadians(userLon);
    const lat2 = degreesToRadians(kaabaLat);
    const lon2 = degreesToRadians(kaabaLon);

    // Calculate bearing using the forward azimuth formula
    const dLon = lon2 - lon1;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);

    // Convert to degrees and normalize to 0-360
    return normalizeAngle(radiansToDegrees(bearing));
};
