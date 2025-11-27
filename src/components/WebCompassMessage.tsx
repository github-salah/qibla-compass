import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface WebCompassMessageProps {
    qiblaDirection: number;
}

/**
 * WebCompassMessage - Informative message for web users
 * Explains sensor limitations and provides Qibla direction
 */
export const WebCompassMessage: React.FC<WebCompassMessageProps> = ({ qiblaDirection }) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            padding: theme.spacing.lg,
            alignItems: 'center',
            maxWidth: 600,
        },
        icon: {
            fontSize: 64,
            marginBottom: theme.spacing.md,
        },
        title: {
            ...theme.typography.h2,
            color: theme.colors.primary,
            marginBottom: theme.spacing.lg,
            textAlign: 'center',
        },
        infoBox: {
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        infoText: {
            ...theme.typography.body,
            color: theme.colors.text,
            textAlign: 'center',
            lineHeight: 24,
        },
        directionBox: {
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            width: '100%',
            ...theme.shadows.medium,
        },
        directionLabel: {
            ...theme.typography.body,
            color: theme.colors.background,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        directionValue: {
            ...theme.typography.h1,
            fontSize: 48,
            color: theme.colors.secondary,
            fontWeight: 'bold',
            marginVertical: theme.spacing.sm,
        },
        directionHint: {
            ...theme.typography.caption,
            color: theme.colors.background,
            opacity: 0.8,
            textAlign: 'center',
        },
        instructionBox: {
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
            width: '100%',
        },
        instructionTitle: {
            ...theme.typography.h3,
            color: theme.colors.primary,
            marginBottom: theme.spacing.sm,
        },
        instruction: {
            ...theme.typography.body,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        instructionNote: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            marginTop: theme.spacing.sm,
            textAlign: 'center',
        },
        alternativeBox: {
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            width: '100%',
        },
        alternativeTitle: {
            ...theme.typography.h3,
            color: theme.colors.primary,
            marginBottom: theme.spacing.sm,
        },
        alternativeText: {
            ...theme.typography.body,
            color: theme.colors.text,
            lineHeight: 24,
        },
    }), [theme]);

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🌐</Text>
            <Text style={styles.title}>Web Browser Detected</Text>

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    Compass sensors are not available in web browsers. For the full compass experience,
                    please download our mobile app.
                </Text>
            </View>

            <View style={styles.directionBox}>
                <Text style={styles.directionLabel}>Qibla Direction from your location:</Text>
                <Text style={styles.directionValue}>{Math.round(qiblaDirection)}°</Text>
                <Text style={styles.directionHint}>
                    (0° = North, 90° = East, 180° = South, 270° = West)
                </Text>
            </View>

            <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>📱 Get the Full Experience</Text>
                <Text style={styles.instruction}>
                    Download our mobile app for the interactive compass feature with real-time updates:
                </Text>
                <Text style={styles.instruction}>• Available on Google Play Store (Android)</Text>
                <Text style={styles.instruction}>• Available on Apple App Store (iOS)</Text>
                <Text style={styles.instructionNote}>App store links coming soon!</Text>
            </View>

            <View style={styles.alternativeBox}>
                <Text style={styles.alternativeTitle}>🧭 Using the Direction Now</Text>
                <Text style={styles.alternativeText}>
                    You can use a physical compass and align it to {Math.round(qiblaDirection)}° to find the Qibla direction.
                </Text>
            </View>
        </View>
    );
};
