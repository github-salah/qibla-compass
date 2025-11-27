import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, AccessibilityInfo } from 'react-native';
// @ts-ignore - slider types may not be present; runtime works
import Slider from '@react-native-community/slider';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { a11yStrings } from '../accessibility/strings';
import { Theme } from '../styles/theme';
import HeadingService from '../services/HeadingService';

export const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const { theme, setThemeMode, isDark } = useTheme();
  const { prefs, update, reset } = usePreferences();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <HeaderBar title="Settings" leftIcon="arrow-left" onLeftPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}> 
          <Text style={styles.label}>Theme Mode</Text>
          <View style={styles.inlineOptions}>
            {['system','light','dark'].map(m => (
              <TouchableOpacity key={m} style={[styles.optionChip, prefs.themeMode === m && styles.optionChipActive]} onPress={() => { update('themeMode', m as any); setThemeMode(m as any); }}>
                <Text style={[styles.optionChipText, prefs.themeMode === m && styles.optionChipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>High Contrast</Text>
          <Switch value={prefs.highContrastEnabled} onValueChange={(v) => update('highContrastEnabled', v)} />
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>Large Text Boost</Text>
          <Switch value={prefs.largeTextBoost} onValueChange={(v) => update('largeTextBoost', v)} />
        </View>

        <Text style={styles.sectionTitle}>Compass</Text>
        <View style={styles.row}> 
          <Text style={styles.label} accessibilityLabel={`Alignment tolerance ${prefs.toleranceDeg} degrees`}>Alignment Tolerance: {prefs.toleranceDeg}°</Text>
        </View>
        <Slider
          minimumValue={1}
          maximumValue={15}
          step={1}
          value={prefs.toleranceDeg}
          onValueChange={(v: number) => update('toleranceDeg', Math.round(v))}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.secondary}
          style={styles.slider}
        />
        <View style={styles.row}> 
          <Text style={styles.label} accessibilityLabel={`Compass update interval ${prefs.headingIntervalMs} milliseconds`}>Update Interval: {prefs.headingIntervalMs}ms</Text>
        </View>
        <Slider
          minimumValue={30}
          maximumValue={300}
          step={10}
          value={prefs.headingIntervalMs}
          onValueChange={(v: number) => { const ms = Math.round(v); update('headingIntervalMs', ms); HeadingService.setUpdateInterval(ms); }}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.secondary}
          style={styles.slider}
        />
        <View style={styles.row}> 
          <Text style={styles.label}>Show Bearing Icon</Text>
          <Switch value={prefs.showBearingIcon} onValueChange={(v) => update('showBearingIcon', v)} />
        </View>

        <View style={styles.row}> 
          <Text style={styles.label}>Allow Ratings Prompt</Text>
          <Switch value={!!prefs.askForRatings} onValueChange={(v) => update('askForRatings', v)} />
        </View>

        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.row}> 
          <Text style={styles.label}>Reduce Motion</Text>
          <Switch value={prefs.reduceMotionEnabled} onValueChange={(v) => update('reduceMotionEnabled', v)} />
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>Announcements</Text>
          <Switch value={prefs.announceAccessibility} onValueChange={(v) => update('announceAccessibility', v)} />
        </View>
        <View style={styles.row}> 
          <Text style={styles.label}>Haptics</Text>
          <Switch value={prefs.hapticsEnabled} onValueChange={(v) => update('hapticsEnabled', v)} />
        </View>

        <Text style={styles.sectionTitle}>Info</Text>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('About')}>
          <Text style={styles.navButtonText}>About App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={() => { reset(); AccessibilityInfo.announceForAccessibility('Preferences reset to defaults'); }}>
          <Text style={styles.resetText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.primary, marginTop: theme.spacing.xl, marginBottom: theme.spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: theme.spacing.sm },
  label: { ...theme.typography.body, color: theme.colors.text },
  slider: { marginBottom: theme.spacing.md },
  inlineOptions: { flexDirection: 'row', gap: theme.spacing.sm },
  optionChip: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full },
  optionChipActive: { backgroundColor: theme.colors.primary },
  optionChipText: { ...theme.typography.caption, color: theme.colors.text },
  optionChipTextActive: { color: theme.colors.primaryContrast, fontWeight: '600' },
  navButton: { marginTop: theme.spacing.md, padding: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md },
  navButtonText: { ...theme.typography.body, color: theme.colors.primary, fontWeight: '600' },
  resetButton: { marginTop: theme.spacing.xl, padding: theme.spacing.md, backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.md },
  resetText: { ...theme.typography.body, color: theme.colors.primaryContrast, fontWeight: '700', textAlign: 'center' },
});

export default SettingsScreen;
