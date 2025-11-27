import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface RatePromptProps {
  onRate: () => void;
  onLater: () => void;
  onNoThanks: () => void;
}

const RatePrompt: React.FC<RatePromptProps> = ({ onRate, onLater, onNoThanks }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.overlay} accessibilityViewIsModal accessibilityLabel="Rate app prompt">
      <View style={styles.panel}>
        <Text style={styles.title}>Enjoying Qibla Finder?</Text>
        <Text style={styles.body}>If we’ve helped, please take a moment to rate us. It encourages improvements and helps others find the app.</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={onRate} accessibilityLabel="Rate now">
            <Text style={styles.primaryText}>Rate Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onLater} accessibilityLabel="Maybe later">
            <Text style={styles.secondaryText}>Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.tertiary]} onPress={onNoThanks} accessibilityLabel="No thanks">
            <Text style={styles.secondaryText}>No Thanks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  },
  panel: {
    width: '86%', backgroundColor: theme.colors.surface, padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg, ...theme.shadows.medium,
  },
  title: {
    ...theme.typography.h3, color: theme.colors.primary, marginBottom: theme.spacing.md, textAlign: 'center',
  },
  body: {
    ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.lg,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  primary: { backgroundColor: theme.colors.primary, marginRight: theme.spacing.sm },
  secondary: { backgroundColor: theme.colors.surfaceAlt || theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  tertiary: { backgroundColor: theme.colors.surfaceAlt || theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, marginLeft: theme.spacing.sm },
  primaryText: { ...theme.typography.body, fontWeight: '700', color: theme.colors.primaryContrast },
  secondaryText: { ...theme.typography.body, color: theme.colors.textSecondary, fontWeight: '600' },
});

export default RatePrompt;
