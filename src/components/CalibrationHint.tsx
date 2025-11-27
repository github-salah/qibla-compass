import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CalibrationHintProps {
    visible: boolean;
}

/**
 * CalibrationHint Component - Shows subtle calibration reminder
 * Following Single Responsibility Principle
 */
export const CalibrationHint: React.FC<CalibrationHintProps> = ({ visible }) => {
    const { theme } = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            backgroundColor: theme.colors.secondary,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: theme.spacing.md,
            marginBottom: theme.spacing.md,
            ...theme.shadows.small,
        },
        icon: {
            fontSize: 24,
            marginRight: theme.spacing.sm,
        },
        text: {
            ...theme.typography.caption,
            color: theme.colors.text,
            flex: 1,
        },
    }), [theme]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
            <Text style={styles.icon}>📱</Text>
            <Text style={styles.text}>Move your device in a figure-8 pattern to calibrate</Text>
        </Animated.View>
    );
};
