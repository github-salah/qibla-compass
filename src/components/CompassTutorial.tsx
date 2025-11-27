import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';

interface CompassTutorialProps {
  onComplete: () => void;
}

const steps = [
  'Hold device flat for accurate readings.',
  'Rotate until the 🕋 icon aligns; green glow shows alignment.',
  'Use the compass icon to search cities manually.',
  'Use the settings icon to adjust tolerance & accessibility.',
  'High contrast & large text toggles available in Settings.'
];

const CompassTutorial: React.FC<CompassTutorialProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { prefs } = usePreferences();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  React.useEffect(() => {
    // Announce for screen readers once
    AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
      if (enabled) AccessibilityInfo.announceForAccessibility('Compass tutorial. Swipe through tips and close when done.');
    });
  }, []);

  return (
    <View style={styles.overlay} accessibilityViewIsModal accessibilityLabel="Compass tutorial">
      <View style={styles.panel}>
        <Text style={styles.title}>Quick Guide</Text>
        {steps.map((s, i) => (
          <Text key={i} style={styles.step} accessibilityLabel={`Step ${i + 1}. ${s}`}>• {s}</Text>
        ))}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={onComplete} accessibilityLabel="Got it, close tutorial">
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onComplete} accessibilityLabel="Skip tutorial">
            <Text style={[styles.buttonText, styles.secondaryText]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    width: '82%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  step: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceAlt || theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginLeft: theme.spacing.sm,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primaryContrast,
  },
  secondaryText: {
    color: theme.colors.textSecondary,
  }
});

export default CompassTutorial;
