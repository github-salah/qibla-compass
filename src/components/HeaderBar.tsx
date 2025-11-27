import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, AccessibilityRole } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

interface HeaderAction {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
  colorOverride?: string;
}

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onLeftPress?: () => void; // Back/navigation only
  leftIcon?: string;
  leftAccessibilityLabel?: string;
  actions?: HeaderAction[]; // Right-side actions rendered in order
  containerStyle?: ViewStyle;
  elevated?: boolean;
  accessibilityRole?: AccessibilityRole;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  onLeftPress,
  leftIcon = 'arrow-left',
  leftAccessibilityLabel = 'Go back',
  actions = [],
  containerStyle,
  elevated = false,
  accessibilityRole = 'header',
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.root, elevated && styles.elevated, containerStyle]}>
      {onLeftPress && (
        <TouchableOpacity
          style={styles.leftIconButton}
          onPress={onLeftPress}
          accessibilityRole="button"
          accessibilityLabel={leftAccessibilityLabel}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name={leftIcon as any} size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        <Text style={styles.title} accessibilityRole={accessibilityRole} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        {actions.map((a, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.iconButton}
            onPress={a.onPress}
            accessibilityRole="button"
            accessibilityLabel={a.accessibilityLabel || `${a.icon} action`}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name={a.icon as any} size={22} color={a.colorOverride || theme.colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  root: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  leftIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    flexShrink: 1,
  },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: theme.spacing.xs,
    },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default HeaderBar;
