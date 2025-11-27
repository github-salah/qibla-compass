import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import CompassHeading from 'react-native-compass-heading';
import { calculateQiblaDirection } from '../utils/calculations';
import { getDeclination } from '../utils/declination';
import { CompassView } from './CompassView';

const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;

// Helper: compute heading from magnetometer + accelerometer (tilt compensated)
function computeHeading(mx: number, my: number, mz: number, ax: number, ay: number, az: number) {
  // Normalize accelerometer (gravity) vector
  const normA = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
  const axn = ax / normA;
  const ayn = ay / normA;
  const azn = az / normA;

  // Create east and north vectors
  const hx = my * azn - mz * ayn;
  const hy = mz * axn - mx * azn;
  const hz = mx * ayn - my * axn;

  // Heading (azimuth) from north
  const heading = (Math.atan2(hy, hx) * (180 / Math.PI) + 360) % 360;
  return heading;
}

export const QiblaCompass: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [headingUnavailable, setHeadingUnavailable] = useState(false);

  const receivedRef = useRef(false);
  const attemptRef = useRef(0);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    let mounted = true;
    let headingSub: any = null;
    let timeoutId: any = null;

    const setup = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission is required.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const qibla = calculateQiblaDirection(loc.coords.latitude, loc.coords.longitude, KAABA_LAT, KAABA_LON);
        if (!mounted) return;
        setQiblaDirection(qibla);
        setReady(true);
        // Compute declination (magnetic -> true) using location
        let decl = 0;
        try {
          decl = getDeclination(loc.coords.latitude, loc.coords.longitude) ?? 0;
        } catch (e) {
          decl = 0;
        }

        // Start native compass heading via react-native-compass-heading
        try {
          // small delay to allow RN context to initialize
          setTimeout(() => {
            try {
              CompassHeading.start(1, ({ heading }: { heading: number }) => {
                const trueHeading = (heading + decl + 360) % 360;
                setDeviceHeading(trueHeading);
                receivedRef.current = true;
              });
            } catch (innerErr) {
              console.warn('CompassHeading.start failed', innerErr);
              setHeadingUnavailable(true);
            }
          }, 500);

          // if no heading callback within 3000ms consider unavailable (give native module time to initialize)
          timeoutId = setTimeout(() => {
            if (!receivedRef.current) {
              attemptRef.current += 1;
              if (attemptRef.current < MAX_ATTEMPTS) {
                // try restarting the compass once
                try {
                  CompassHeading.stop();
                } catch (e) {}
                setTimeout(() => {
                  try {
                    CompassHeading.start(1, ({ heading }: { heading: number }) => {
                      const trueHeading = (heading + decl + 360) % 360;
                      setDeviceHeading(trueHeading);
                      receivedRef.current = true;
                    });
                  } catch (innerErr) {
                    console.warn('CompassHeading.start retry failed', innerErr);
                  }
                }, 500);
                // set another timeout to check again
                timeoutId = setTimeout(() => {
                  if (!receivedRef.current) setHeadingUnavailable(true);
                }, 3000);
              } else {
                setHeadingUnavailable(true);
              }
            }
          }, 3000);
        } catch (err: any) {
          setHeadingUnavailable(true);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Failed to initialize location/heading');
      }
    };

    setup();

    return () => {
      mounted = false;
      try {
        CompassHeading.stop();
      } catch (e) {
        // ignore
      }
      if (headingSub && typeof headingSub.remove === 'function') headingSub.remove();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (headingUnavailable) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', padding: 16 }}>
          Heading not available on this device. Please enable Location Services or use a device with a compass.
        </Text>
        <CompassView heading={deviceHeading} qiblaDirection={qiblaDirection} />
        <View style={{ marginTop: 12 }}>
          <Text onPress={() => {
            // Retry starting the compass
            attemptRef.current = 0;
            setHeadingUnavailable(false);
            receivedRef.current = false;
          }} style={{ color: '#007AFF', fontWeight: '600' }}>
            Retry
          </Text>
        </View>
      </View>
    );
  }

  return (
    <CompassView heading={deviceHeading} qiblaDirection={qiblaDirection} />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});

export default QiblaCompass;
