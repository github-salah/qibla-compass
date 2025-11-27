import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../styles/theme';
import { Toast } from './Toast';
import { usePreferences } from '../context/PreferencesContext';

interface CompassViewProps {
    heading: number; // Current device heading (0-360)
    qiblaDirection: number; // Direction to Qibla (0-360)
    toleranceDeg?: number; // angular tolerance in degrees to consider "aligned"
}

// Responsive sizing helper - adapts to screen width
const getResponsiveSize = (screenWidth: number): { compass: number; inner: number } => {
    // Tablet (>768px): larger compass, Large phone (414-768px): 65% width, Small phone (<414px): 75% max 280px
    const baseSize = screenWidth > 768 ? 320 : screenWidth > 414 ? screenWidth * 0.65 : Math.min(screenWidth * 0.75, 280);
    return {
        compass: baseSize,
        inner: baseSize - 60
    };
};

export const CompassView: React.FC<CompassViewProps> = ({ heading, qiblaDirection, toleranceDeg = 5 }) => {
    const { theme } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const { prefs } = usePreferences();
    
    // Responsive sizing - recalculates on screen width change
    const sizes = React.useMemo(() => getResponsiveSize(screenWidth), [screenWidth]);
    const COMPASS_SIZE = sizes.compass;
    const INNER_COMPASS_SIZE = sizes.inner;
    
    const styles = React.useMemo(() => createStyles(theme, COMPASS_SIZE, INNER_COMPASS_SIZE), [theme, COMPASS_SIZE, INNER_COMPASS_SIZE]);


    // Reanimated shared values for instantaneous rotation and pulse/glow loop
    const headingRotate = useSharedValue(-heading);
    const pulse = useSharedValue(0);
    const lastHapticRef = React.useRef<number>(0);
    const tolerance = prefs.toleranceDeg || toleranceDeg;
    const reduceMotion = prefs.reduceMotionEnabled;
    const hapticsEnabled = prefs.hapticsEnabled;

    const [isFlat, setIsFlat] = React.useState(true);

    // Instant rotation update on heading change
    React.useEffect(() => {
        headingRotate.value = -heading;
    }, [heading, headingRotate]);

    // Animated style for outer and inner rings
    const ringAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${headingRotate.value}deg` }],
    }));

    // Device Flatness Detection
    React.useEffect(() => {
        const subscription = Accelerometer.addListener(data => {
            // Z-axis close to 1 or -1 means flat (gravity)
            // We'll use a threshold. 0.8 is roughly 37 degrees tilt.
            const isDeviceFlat = Math.abs(data.z) > 0.8;
            setIsFlat(isDeviceFlat);
        });

        Accelerometer.setUpdateInterval(500); // Check every 500ms

        return () => subscription.remove();
    }, []);

    // Start/stop pulse loop based on alignment
    React.useEffect(() => {
        const deltaLocal = Math.abs(((heading - qiblaDirection + 540) % 360) - 180);
        const localAligned = deltaLocal <= tolerance;
        if (!reduceMotion && localAligned) {
            pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
        } else {
            pulse.value = 0;
        }
    }, [heading, qiblaDirection, tolerance, reduceMotion, pulse]);

    // Derived alignment state for haptics effect
    const delta = Math.abs(((heading - qiblaDirection + 540) % 360) - 180);
    const aligned = delta <= tolerance;

    React.useEffect(() => {
        if (aligned && hapticsEnabled) {
            const now = Date.now();
            if (now - lastHapticRef.current > 800) {
                lastHapticRef.current = now;
                try { Haptics.selectionAsync(); } catch (e) { /* ignore */ }
            }
        }
    }, [aligned, hapticsEnabled]);

    // No cleanup needed for Reanimated shared values
    React.useEffect(() => () => { /* no-op */ }, []);


    // Calculate Qibla angle relative to current heading and normalize
    let qiblaAngle = (qiblaDirection - heading);
    // Normalize to [0, 360)
    qiblaAngle = ((qiblaAngle % 360) + 360) % 360;

    // Calculate qibla degree to show above compass (normalize)
    const qiblaDegreeDisplay = Math.round(qiblaDirection);

    const INNER_OFFSET = (COMPASS_SIZE - INNER_COMPASS_SIZE) / 2;

    // Animated styles derived from pulse shared value
    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pulse.value, [0, 1], [0, 0.85]),
        transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.06]) }],
    }));
    const pulseStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pulse.value, [0, 1], [0, 0.45]),
        transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.4]) }],
    }));

    // Keep cardinal labels upright while riding the rotating ring
    const labelUprightStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${-headingRotate.value}deg` }],
    }));

    return (
        <View style={styles.screenCenter} accessibilityLabel="Compass showing Qibla direction">
            <View style={styles.container} accessible accessibilityRole="image" accessibilityLabel={aligned ? 'Aligned with Qibla' : 'Rotate device to face Qibla'}>
                {/* Flatness Warning */}
                {!isFlat && (
                    <View style={styles.flatnessWarning}>
                        <Text style={styles.flatnessText}>📱 Hold device flat</Text>
                    </View>
                )}

                {/* Outer ring rotates with heading; labels ride the ring but counter-rotate to stay upright */}
                <Animated.View style={[styles.outerRing, ringAnimatedStyle]}>
                    <View style={styles.cardinalContainer} pointerEvents="none">
                        <Animated.Text style={[styles.cardinal, styles.north, labelUprightStyle]}>N</Animated.Text>
                        <Animated.Text style={[styles.cardinal, styles.east, labelUprightStyle]}>E</Animated.Text>
                        <Animated.Text style={[styles.cardinal, styles.south, labelUprightStyle]}>S</Animated.Text>
                        <Animated.Text style={[styles.cardinal, styles.west, labelUprightStyle]}>W</Animated.Text>
                    </View>
                </Animated.View>

                {/* Inner ring with ticks - rotates with heading */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            width: COMPASS_SIZE,
                            height: COMPASS_SIZE,
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        ringAnimatedStyle,
                    ]}
                >
                    {/* Inner ring backdrop */}
                    <View style={styles.innerRing} pointerEvents="none" />

                    {/* SVG-based ticks (lazy loaded) */}
                        {/* View-based ticks (fallback without react-native-svg) */}
                        {React.useMemo(() => Array.from({ length: 60 }).map((_, i) => {
                            const angle = i * 6;
                            const isMajor = angle % 90 === 0;
                            const height = isMajor ? 14 : 6;
                            const width = isMajor ? 3 : 2;
                            return (
                                <View key={`inner-${i}`} style={[styles.innerTickContainer, { transform: [{ rotate: `${angle}deg` }, { translateY: -INNER_COMPASS_SIZE / 2 + 8 }] }]}>
                                    <View style={{ width, height, backgroundColor: theme.colors.textSecondary, borderRadius: width / 2 }} />
                                </View>
                            );
                        }), [INNER_COMPASS_SIZE, theme.colors.textSecondary])}
                </Animated.View>

                {/* Tolerance arc band near ring perimeter, centered at top (fixed, non-rotating) */}
                {prefs.showBearingIcon && !reduceMotion && (
                    <View style={styles.toleranceArcBand} pointerEvents="none">
                        {React.useMemo(() => {
                            const span = Math.max(6, prefs.toleranceDeg); // degrees to each side
                            const start = -span;
                            const end = span;
                            const step = 3; // finer resolution for smoother band
                            const bandRadius = COMPASS_SIZE / 2 - (COMPASS_SIZE - INNER_COMPASS_SIZE) / 4; // midway between outer & inner ring
                            const bandThickness = (COMPASS_SIZE - INNER_COMPASS_SIZE) / 2 * 0.7; // proportional thickness
                            const segments: React.ReactElement[] = [];
                            for (let a = start; a <= end; a += step) {
                                segments.push(
                                    <View
                                        key={`tol-band-${a}`}
                                        style={{
                                            position: 'absolute',
                                            transform: [
                                                { rotate: `${a}deg` },
                                                { translateY: -bandRadius }
                                            ],
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: Math.max(8, COMPASS_SIZE * 0.025),
                                                height: bandThickness,
                                                backgroundColor: theme.colors.success,
                                                opacity: 0.35,
                                                borderRadius: 4,
                                            }}
                                        />
                                    </View>
                                );
                            }
                            return segments;
                        }, [prefs.toleranceDeg, COMPASS_SIZE, INNER_COMPASS_SIZE, theme.colors.success])}
                    </View>
                )}

                {/* Glow breathing background when aligned - centered within compass */}
                <Animated.View
                    pointerEvents="none"
                    style={[styles.glowContainer, glowStyle]}
                >
                    <View style={styles.glowBackdrop} />
                </Animated.View>


                {/* Qibla Direction Indicator - arrow & Kaaba rotate to target; bearing icon rotates with heading separately */}
                <View
                    style={[
                        styles.qiblaIndicator,
                        {
                            transform: [{ rotate: `${qiblaAngle}deg` }],
                        },
                    ]}
                >
                    {/* Tolerance arc removed from Qibla indicator; shown alongside bearing at top */}
                    {/* Pulsing halo when aligned */}
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.pulse,
                            {
                                position: 'absolute',
                                top: INNER_OFFSET,
                                left: INNER_OFFSET,
                            },
                            pulseStyle,
                        ]}
                    />

                    {/* Minimal Qibla Indicator (icon only) fixed at top relative to rotation */}
                    <View style={styles.qiblaLabelContainer} accessibilityLabel={`Qibla direction ${qiblaDegreeDisplay} degrees`}>
                        <Text style={styles.qiblaIcon}>🕋</Text>
                    </View>

                    {/* Bearing icon rendered outside rotation container for independent heading orientation */}

                    {/* Modern Arrow */}
                    <View style={styles.arrowContainer}>
                        <View style={styles.arrowStem} />
                        <View style={styles.arrowHead} />
                    </View>
                </View>

                {prefs.showBearingIcon && (
                    <View style={styles.bearingStaticContainer} accessibilityLabel={aligned ? 'Aligned with Qibla' : 'Qibla alignment guide'}>
                        {/* Central alignment line */}
                        <View style={styles.bearingLine} />
                    </View>
                )}

                {/* Center dot - sits above glow and arrow */}
                <View style={styles.centerDot} />

                {/* Heading text removed per design simplification */}

                {/* Alignment toast */}
                {aligned && !reduceMotion && <Toast message="You're facing the Qibla!" variant="success" />}
            </View>
        </View>
    );
};

const createStyles = (theme: Theme, compassSize: number, innerSize: number) => StyleSheet.create({
    container: {
        width: compassSize,
        height: compassSize,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    outerRing: {
        width: compassSize,
        height: compassSize,
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    tickContainer: {
        position: 'absolute',
        height: compassSize,
        alignItems: 'center',
    },
    compass: {
        width: innerSize,
        height: innerSize,
        borderRadius: innerSize / 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface, // Slightly different background
        justifyContent: 'center',
        alignItems: 'center',
        // Removed shadow for flatter, cleaner look
    },
    innerCrosshair: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardinalContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardinal: {
        position: 'absolute',
        fontSize: 26,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        textAlign: 'center',
        width: 28,
    },
    north: {
        top: -10,
        left: '50%',
        marginLeft: -14,
        color: theme.colors.primary,
    },
    east: {
        right: -10,
        top: '50%',
        marginTop: -14,
    },
    south: {
        bottom: -10,
        left: '50%',
        marginLeft: -14,
    },
    west: {
        left: -10,
        top: '50%',
        marginTop: -14,
    },
    qiblaIndicator: {
        position: 'absolute',
        width: compassSize,
        height: compassSize,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 3,
    },
    qiblaLabelContainer: {
        position: 'absolute',
        top: compassSize * 0.075,
        alignItems: 'center',
    },
    qiblaIcon: {
        fontSize: 36,
        marginBottom: 4,
    },
    qiblaLabel: {
        display: 'none',
    },
    arrowContainer: {
        position: 'absolute',
        top: compassSize * 0.32,
        alignItems: 'center',
    },
    arrowStem: {
        width: Math.max(3, compassSize * 0.014),
        height: compassSize * 0.14,
        backgroundColor: theme.colors.secondary,
        borderRadius: compassSize * 0.014,
    },
    arrowHead: {
        position: 'absolute',
        top: 0,
        width: Math.max(14, compassSize * 0.06),
        height: Math.max(14, compassSize * 0.06),
        borderRadius: Math.max(7, compassSize * 0.03),
        backgroundColor: theme.colors.secondary,
        transform: [{ translateY: -Math.max(7, compassSize * 0.03) }],
    },
    centerDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        zIndex: 4,
        top: '50%',
        left: '50%',
        transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    headingContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    headingText: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    headingLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    screenCenter: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qiblaDegreeText: {
        ...theme.typography.h3,
        color: theme.colors.primary,
        fontWeight: '800',
        fontSize: 20,
    },
    innerTickContainer: {
        position: 'absolute',
        height: innerSize,
        alignItems: 'center',
    },
    innerRing: {
        position: 'absolute',
        width: innerSize + 8,
        height: innerSize + 8,
        borderRadius: (innerSize + 8) / 2,
        borderWidth: 1.5,
        borderColor: theme.colors.textSecondary,
        opacity: 0.7,
    },
    pulse: {
        position: 'absolute',
        width: innerSize,
        height: innerSize,
        borderRadius: innerSize / 2,
        backgroundColor: theme.colors.secondary,
    },
    bearingStaticContainer: {
        position: 'absolute',
        top: -32,
        left: '50%',
        marginLeft: -12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bearingLine: {
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: theme.colors.primary,
    },
    toleranceArcBand: {
        position: 'absolute',
        width: compassSize,
        height: compassSize,
        top: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        // sits above outer ring, below arrow (arrow zIndex 3)
    },
    flatnessWarning: {
        position: 'absolute',
        top: -40,
        backgroundColor: theme.colors.error,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        zIndex: 100,
        elevation: 10,
    },
    flatnessText: {
        ...theme.typography.caption,
        color: theme.colors.primaryContrast,
        fontWeight: '600',
    },
    glowContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: compassSize,
        height: compassSize,
        justifyContent: 'center',
        alignItems: 'center',
        // Put glow behind the qibla indicator but above the outer ring
        zIndex: 2,
    },
    glowBackdrop: {
        position: 'absolute',
        width: innerSize * 1.2,
        height: innerSize * 1.2,
        borderRadius: (innerSize * 1.2) / 2,
        backgroundColor: theme.colors.success,
        opacity: 0.12,
        // center the glow on the inner compass
        top: (compassSize - (innerSize * 1.2)) / 2,
        left: (compassSize - (innerSize * 1.2)) / 2,
    }
});

