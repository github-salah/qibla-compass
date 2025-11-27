import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../styles/theme';
import HeaderBar from '../components/HeaderBar';
import { a11yStrings } from '../accessibility/strings';

type RootStackParamList = {
    Home: undefined;
    About: undefined;
};

type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface AboutScreenProps {
    navigation: AboutScreenNavigationProp;
}

/**
 * AboutScreen - Information about Khair Labs and the app
 */
export const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            {/* Header panel (matching app look) */}
            <HeaderBar
                title={a11yStrings.aboutTitle}
                onLeftPress={() => navigation.goBack()}
                leftIcon="arrow-left"
                leftAccessibilityLabel={a11yStrings.back}
                accessibilityRole="header"
            />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>🕌</Text>
                    <Text style={styles.title}>Khair Labs</Text>
                    <Text style={styles.subtitle}>Qibla Finder</Text>
                </View>

                {/* Mission */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mission</Text>
                    <Text style={styles.paragraph}>
                        We aim to provide a reliable, distraction‑free, and privacy‑respecting way to orient oneself for prayer. The app is intentionally focused: clear direction, minimal data use, and accessible experience for as many devices and users as possible.
                    </Text>
                </View>

                {/* Principles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guiding Principles</Text>
                    <Text style={styles.paragraph}>Accuracy – Verified Qibla calculation methods and sensor tuning.</Text>
                    <Text style={styles.paragraph}>Privacy – No analytics, tracking, or location retention beyond what is needed to determine direction.</Text>
                    <Text style={styles.paragraph}>Accessibility – Adjustable text size, reduced motion, high‑contrast options, and clear labels.</Text>
                    <Text style={styles.paragraph}>Simplicity – One purpose, fast loading, minimal visual noise.</Text>
                </View>

                {/* Free Access */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Free Access</Text>
                    <Text style={styles.paragraph}>
                        The Qibla direction is a universal need. We commit to keeping this tool free, ad‑free, and respectful of user dignity. Nothing is sold, profiled, or monetised.
                    </Text>
                </View>

                {/* Credits */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Credits</Text>
                    <View style={styles.teamMember}>
                        <Text style={styles.memberRole}>Concept & Product Direction</Text>
                        <Text style={styles.memberName}>Shamsuddin Altamash</Text>
                        <Text style={styles.memberDescription}>
                            Originated the idea and shaped the core purpose: a focused, respectful Qibla finder. Guided feature scope, simplicity, and user experience priorities.
                        </Text>
                    </View>
                    <View style={styles.teamMember}>
                        <Text style={styles.memberRole}>Engineering & Implementation</Text>
                        <Text style={styles.memberName}>Salahuddin Abdul Gaffar</Text>
                        <Text style={styles.memberDescription}>
                            Led development and architecture: sensor integration, Qibla calculation, performance optimizations, accessibility, and UI polish across devices.
                        </Text>
                    </View>
                    <Text style={[styles.paragraph, { marginTop: theme.spacing.sm }]}>We’re grateful for feedback and contributions that help improve the app over time.</Text>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Capabilities</Text>
                    <View style={styles.featureList}>
                        <Text style={styles.feature}>• Precise Qibla bearing from current or selected location</Text>
                        <Text style={styles.feature}>• Sensor‑based compass with alignment feedback</Text>
                        <Text style={styles.feature}>• Works offline after initial location fix</Text>
                        <Text style={styles.feature}>• Optional accessibility announcements</Text>
                        <Text style={styles.feature}>• Lightweight and battery conscious</Text>
                        <Text style={styles.feature}>• No ads, no tracking</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        May Allah accept our efforts and allow this tool to remain beneficial.
                    </Text>
                    <Text style={styles.footerText}>Āmīn.</Text>
                </View>

                {/* bottom back button removed; top-left back button added */}
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logo: {
        fontSize: 64,
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.h3,
        color: theme.colors.textSecondary,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        marginBottom: theme.spacing.md,
    },
    paragraph: {
        ...theme.typography.body,
        color: theme.colors.text,
        lineHeight: 24,
    },
    teamMember: {
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    memberRole: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    memberName: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    memberDescription: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },
    featureList: {
        gap: theme.spacing.sm,
    },
    feature: {
        ...theme.typography.body,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    footer: {
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
    },
    footerText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: theme.spacing.xs,
    },
    backButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    backButtonText: {
        ...theme.typography.body,
        color: theme.colors.primaryContrast,
        fontWeight: '600',
    },
});
