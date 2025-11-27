import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme, typography as baseTypography } from '../styles/theme';
import { useAccessibilityPreferences } from '../accessibility/useAccessibilityPreferences';
import { usePreferences } from './PreferencesContext';

type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
};

// Provide a safe default so consumers don't crash if rendered before provider mounts
const defaultContext: ThemeContextType = {
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => {},
    setThemeMode: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        if (mode === 'system') {
            setIsDark(systemColorScheme === 'dark');
        } else {
            setIsDark(mode === 'dark');
        }
    }, [mode, systemColorScheme]);

    const a11y = useAccessibilityPreferences();
    const { prefs } = usePreferences();

    // Scale typography based on fontScale (cap at 1.35 to avoid huge layouts)
    const extraBoost = prefs.largeTextBoost ? 0.15 : 0;
    const scale = Math.min(Math.max(a11y.fontScale + extraBoost, 1), 1.5);
    const scaleTypography = (typography: typeof baseTypography) => {
        const apply = (t: any) => ({
            ...t,
            fontSize: Math.round(t.fontSize * scale),
            lineHeight: Math.round((t.lineHeight || t.fontSize * 1.25) * scale),
        });
        return {
            h1: apply(typography.h1),
            h2: apply(typography.h2),
            h3: apply(typography.h3),
            body: apply(typography.body),
            caption: apply(typography.caption),
            small: apply(typography.small),
        };
    };

    const baseTheme = isDark ? darkTheme : lightTheme;

    // High contrast adjustments: strengthen secondary text & borders
    const highContrastEnabled = prefs.highContrastEnabled || a11y.highContrast;
    const highContrastColors = highContrastEnabled ? {
        textSecondary: isDark ? lightTheme.colors.text : darkTheme.colors.text,
        border: isDark ? lightTheme.colors.text : darkTheme.colors.text,
    } : {};

    const theme: Theme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            ...highContrastColors,
        },
        typography: scaleTypography(baseTheme.typography as any),
    } as Theme;

    const toggleTheme = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setThemeMode = (newMode: 'light' | 'dark' | 'system') => {
        setMode(newMode);
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    return useContext(ThemeContext);
};
