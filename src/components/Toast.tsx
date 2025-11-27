import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type ToastVariant = 'error' | 'warning' | 'info' | 'success';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number; // milliseconds
  position?: 'top' | 'bottom' | 'center';
  accessibilityMode?: 'polite' | 'assertive'; // Android live region behavior
}

export const Toast: React.FC<ToastProps> = ({ message, variant = 'info', duration = 1800, position = 'bottom', accessibilityMode = 'polite' }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme, variant, position), [theme, variant, position]);

  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      const t = setTimeout(() => {
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }, duration);
      return () => clearTimeout(t);
    });
  }, [fade, duration]);

  return (
    <Animated.View
      style={[styles.container, { opacity: fade }]}
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion={accessibilityMode}
      accessibilityLabel={message}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const createStyles = (theme: any, variant: ToastVariant, position: string) => StyleSheet.create({
  container: {
    position: 'absolute',
    [position === 'top' ? 'top' : position === 'bottom' ? 'bottom' : 'top']: position === 'center' ? '50%' : (position === 'top' ? theme.spacing.lg : theme.spacing.lg),
    alignSelf: 'center',
    transform: position === 'center' ? [{ translateY: -20 }] : undefined,
    backgroundColor: variant === 'error' ? theme.colors.error : variant === 'warning' ? (theme.colors.warning || '#f6c84c') : variant === 'success' ? theme.colors.success : theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    elevation: 6,
  },
  text: {
    color: theme.colors.background,
    ...theme.typography.body,
    fontWeight: '700',
  },
});

export default Toast;
