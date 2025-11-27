export const palette = {
    // Modern Minimalistic Palette
    // Primary: Deep Emerald for spiritual/calm feel
    primary: {
        light: '#00695C',
        dark: '#4DB6AC',
        contrast: '#FFFFFF',
    },
    // Secondary: Gold/Amber for accents
    secondary: {
        light: '#FFB300',
        dark: '#FFD54F',
        contrast: '#000000',
    },
    // Neutrals
    neutral: {
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#FAFAFA',
        gray100: '#F5F5F5',
        gray200: '#EEEEEE',
        gray300: '#E0E0E0',
        gray400: '#BDBDBD',
        gray500: '#9E9E9E',
        gray600: '#757575',
        gray700: '#616161',
        gray800: '#424242',
        gray900: '#212121',
    },
    // Semantic
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#FBC02D',
    info: '#1976D2',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        fontFamily: 'Inter_700Bold',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        fontFamily: 'Inter_600SemiBold',
        lineHeight: 32,
        letterSpacing: -0.25,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        fontFamily: 'Inter_600SemiBold',
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        fontFamily: 'Inter_400Regular',
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        fontFamily: 'Inter_400Regular',
        lineHeight: 20,
        color: palette.neutral.gray600,
    },
    small: {
        fontSize: 12,
        fontWeight: '400' as const,
        fontFamily: 'Inter_400Regular',
        lineHeight: 16,
    },
};

export const borderRadius = {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 28,
    full: 9999,
};

export const shadows = {
    small: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    large: {
        shadowColor: palette.neutral.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
};

export const lightTheme = {
    dark: false,
    colors: {
        primary: palette.primary.light,
        primaryContrast: palette.primary.contrast,
        secondary: palette.secondary.light,
        secondaryContrast: palette.secondary.contrast,
        background: palette.neutral.white,
        surface: palette.neutral.gray50,
        surfaceHighlight: palette.neutral.gray100,
        text: palette.neutral.gray900,
        textSecondary: palette.neutral.gray600,
        border: palette.neutral.gray200,
        error: palette.error,
        success: palette.success,
        warning: palette.warning,
        info: palette.info,
        overlay: 'rgba(0, 0, 0, 0.5)',
    },
    spacing,
    typography,
    borderRadius,
    shadows,
};

export const darkTheme = {
    dark: true,
    colors: {
        primary: palette.primary.dark,
        primaryContrast: palette.neutral.black,
        secondary: palette.secondary.dark,
        secondaryContrast: palette.neutral.black,
        background: palette.neutral.gray900,
        surface: palette.neutral.gray800,
        surfaceHighlight: palette.neutral.gray700,
        text: palette.neutral.gray50,
        textSecondary: palette.neutral.gray300, // Slightly brighter for readability while distinct
        border: palette.neutral.gray600, // Increase contrast against background
        error: '#E57373', // Harmonize with lighter secondary text while retaining semantic meaning
        success: '#81C784', // Slightly brighter for dark surfaces
        warning: '#F9D54A', // Tuned warning for dark background
        info: '#64B5F6', // Softer info blue for dark mode
        overlay: 'rgba(0, 0, 0, 0.7)',
    },
    spacing,
    typography: {
        ...typography,
        caption: {
            ...typography.caption,
            color: palette.neutral.gray300,
        },
    },
    borderRadius,
    shadows: {
        ...shadows,
        small: { ...shadows.small, shadowOpacity: 0.3 },
        medium: { ...shadows.medium, shadowOpacity: 0.4 },
        large: { ...shadows.large, shadowOpacity: 0.5 },
    },
};

export type Theme = typeof lightTheme;
