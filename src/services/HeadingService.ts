import { Magnetometer } from 'expo-sensors';
import CompassHeading from 'react-native-compass-heading';
import { Platform } from 'react-native';

type HeadingCallback = (heading: number) => void;

/**
 * HeadingService - Provides compass heading using the most reliable method per platform
 * 
 * Strategy:
 * - Primary: Magnetometer with atan2(-x, y) for smooth updates (50ms)
 * - Fallback: react-native-compass-heading if Magnetometer fails
 * 
 * The Magnetometer approach provides 20Hz updates for smooth rotation.
 * Formula atan2(-data.x, data.y) works consistently across Android devices
 * as Expo standardizes the magnetometer coordinate system.
 */
class HeadingServiceClass {
  private subscription: { remove: () => void } | null = null;
  private listeners: Set<HeadingCallback> = new Set();
  private currentHeading: number = 0;
  private usingFallback: boolean = false;
  private updateInterval: number = 50;
  private fallbackActive: boolean = false;

  /**
   * Start receiving compass heading updates from Magnetometer
   */
  async start(): Promise<void> {
    if (this.subscription) {
      return; // Already started
    }

    try {
      // Check if Magnetometer is available
      const available = await Magnetometer.isAvailableAsync();
      
      if (!available) {
        console.warn('Magnetometer not available, using fallback');
        this.startFallback();
        return;
      }

      // Set update interval to 50ms for smooth 20Hz updates
      Magnetometer.setUpdateInterval(this.updateInterval);

      this.subscription = Magnetometer.addListener((data) => {
        // Calculate heading from magnetometer x, y components
        // atan2(-x, y) gives us the correct compass heading
        // Negative x because magnetometer measures field, we want direction
        let angle = Math.atan2(-data.x, data.y) * (180 / Math.PI);
        
        // Normalize to 0-360 range
        let heading = ((angle % 360) + 360) % 360;

        this.currentHeading = heading;

        // Notify all listeners
        this.emit(heading);
      });
    } catch (error) {
      console.error('Failed to start Magnetometer, using fallback:', error);
      this.startFallback();
    }
  }

  /**
   * Fallback to react-native-compass-heading if Magnetometer unavailable
   */
  private startFallback(): void {
    try {
      this.usingFallback = true;
      this.fallbackActive = true;
      CompassHeading.start(this.updateInterval, ({ heading }) => {
        this.currentHeading = heading;
        this.emit(heading);
      });
    } catch (error) {
      console.error('Failed to start fallback compass:', error);
    }
  }

  /**
   * Adjust sensor update interval (ms). Applies live if service running.
   */
  setUpdateInterval(ms: number) {
    if (ms < 30) ms = 30; // safety lower bound
    if (ms > 500) ms = 500; // upper bound
    this.updateInterval = ms;
    if (this.subscription && !this.usingFallback) {
      try { Magnetometer.setUpdateInterval(this.updateInterval); } catch {}
    } else if (this.usingFallback) {
      try {
        if (this.fallbackActive) {
          CompassHeading.stop();
          CompassHeading.start(this.updateInterval, ({ heading }) => {
            this.currentHeading = heading;
            this.emit(heading);
          });
        }
      } catch (e) {
        console.error('Failed to reapply fallback interval', e);
      }
    }
  }

  /**
   * Stop receiving heading updates
   */
  stop(): void {
    if (this.usingFallback) {
      try {
        if (this.fallbackActive) {
          CompassHeading.stop();
          this.fallbackActive = false;
        }
      } catch (error) {
        console.error('Error stopping fallback compass:', error);
      }
      this.usingFallback = false;
    } else if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  /**
   * Subscribe to heading changes
   * @param callback Function called with heading value (0-360°) on each update
   * @returns Unsubscribe function
   */
  subscribe(callback: HeadingCallback): () => void {
    this.listeners.add(callback);

    // Immediately provide current heading if available
    if (this.currentHeading !== undefined) {
      try {
        callback(this.currentHeading);
      } catch (error) {
        console.error('Error in initial heading callback:', error);
      }
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current heading value
   * @returns Current compass heading in degrees (0-360°)
   */
  getCurrentHeading(): number {
    return this.currentHeading;
  }

  /**
   * Notify all subscribed listeners of heading change
   */
  private emit(heading: number): void {
    for (const callback of this.listeners) {
      try {
        callback(heading);
      } catch (error) {
        console.error('Error in heading callback:', error);
      }
    }
  }

  /**
   * Check if Magnetometer is available on this device
   * @returns Promise<boolean> true if sensor is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const available = await Magnetometer.isAvailableAsync();
      return available;
    } catch {
      return false;
    }
  }

  isFallback(): boolean {
    return this.usingFallback;
  }
}

// Export singleton instance
export default new HeadingServiceClass();
