/**
 * Simple geomagnetic declination estimator.
 * This is NOT a replacement for the World Magnetic Model (WMM).
 * It gives a rough declination estimate based on longitude and latitude.
 * For production, consider integrating NOAA's WMM or a small library.
 */
/**
 * Try to compute geomagnetic declination using a local WMM package if available.
 * Falls back to a simple heuristic estimator if the package is not installed.
 */
export const getDeclination = (lat: number, lon: number): number => {
    // Try to use an installed WMM/geomag package
    try {
        // Dynamically require so bundler won't fail if package is absent
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const geomag = require('geomag');
        if (geomag) {
            // Many geomag packages expose different APIs; try common ones
            if (typeof geomag.declination === 'function') {
                const d = geomag.declination(lat, lon);
                if (!isNaN(d)) return d;
            }
            if (typeof geomag.get === 'function') {
                const r = geomag.get(lat, lon);
                if (r && (r.decl !== undefined || r.d !== undefined)) {
                    return r.decl ?? r.d;
                }
            }
            if (typeof geomag === 'function') {
                const r = geomag(lat, lon);
                if (r && r.decl !== undefined) return r.decl;
            }
        }
    } catch (e) {
        // package not available or failed, fallback below
    }

    // Fallback simple estimator (approximate, offline)
    const decl = (Math.sin(lon * Math.PI / 180) * 10 + (lat / 90) * 5);
    return Math.max(-25, Math.min(25, decl));
};

export default getDeclination;
