import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ErrorMessageProps {
    message: string;
}

/**
 * ErrorMessage Component - Displays user-friendly error messages
 * Following Single Responsibility Principle
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
            alignItems: 'center',
            marginHorizontal: theme.spacing.md,
        },
        icon: {
            fontSize: 48,
            marginBottom: theme.spacing.md,
        },
        message: {
            ...theme.typography.body,
            color: theme.colors.text,
            textAlign: 'center',
        },
    }), [theme]);

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};
