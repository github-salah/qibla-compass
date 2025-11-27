import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompassView } from '../components/CompassView';
import CompassTutorial from '../components/CompassTutorial';
import LocationService, { LocationResult } from '../services/LocationService';
import QiblaService from '../services/QiblaService';
import HeadingService from '../services/HeadingService';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../styles/theme';
import { Feather } from '@expo/vector-icons';
import { SearchCityModal } from '../components/SearchCityModal';
import HeaderBar from '../components/HeaderBar';
import { usePreferences } from '../context/PreferencesContext';
import { a11yStrings } from '../accessibility/strings';
import { City } from '../services/CitySearchService';
import { AccessibilityInfo } from 'react-native';
import RatePrompt from '../components/RatePrompt';
import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';

// Define navigation types locally or import from types file
type RootStackParamList = {
    Home: undefined;
    About: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const { prefs, update } = usePreferences();

    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<LocationResult | null>(null);
    const [qiblaDirection, setQiblaDirection] = useState(0);
    const [heading, setHeading] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [manualCity, setManualCity] = useState<City | null>(null);
    const [resolvedCityName, setResolvedCityName] = useState<string | null>(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [hasInternet, setHasInternet] = useState<boolean | null>(null);
    const [showRatePrompt, setShowRatePrompt] = useState(false);
    const internetIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const lastAlignedRef = React.useRef<boolean>(false);

    const headingUnsubRef = React.useRef<(() => void) | null>(null);

    useEffect(() => {
        setupLocationAndCompass();

        return () => {
            // cleanup subscription and stop service
            if (headingUnsubRef.current) {
                headingUnsubRef.current();
                headingUnsubRef.current = null;
            }
            HeadingService.stop();
        };
    }, []);

    // Connectivity check: initial, periodic (15s), and on app focus
    useEffect(() => {
        const checkInternet = async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2500);
            try {
                const res = await fetch('https://clients3.google.com/generate_204', { method: 'GET', signal: controller.signal });
                setHasInternet(res.status === 204);
            } catch {
                setHasInternet(false);
            } finally {
                clearTimeout(timer);
            }
        };
        checkInternet();
        internetIntervalRef.current = setInterval(checkInternet, 15000);
        const sub = AppState.addEventListener('change', (state) => { if (state === 'active') checkInternet(); });
        return () => { if (internetIntervalRef.current) clearInterval(internetIntervalRef.current); sub.remove(); };
    }, []);

    // Apply heading interval preference dynamically
    useEffect(() => {
        HeadingService.setUpdateInterval(prefs.headingIntervalMs);
    }, [prefs.headingIntervalMs]);

    // Re-calculate Qibla when location changes (manual or GPS)
    useEffect(() => {
        if (location) {
            const qibla = QiblaService.calculateQiblaDirection(location.latitude, location.longitude);
            setQiblaDirection(qibla);
        }
    }, [location]);

    // When internet becomes available after being offline, attempt reverse geocode if we have GPS location
    useEffect(() => {
        const refreshCityIfNeeded = async () => {
            if (hasInternet && location && !manualCity && !resolvedCityName) {
                try {
                    const name = await LocationService.getCityName(location.latitude, location.longitude);
                    if (name) setResolvedCityName(name);
                } catch {/* ignore */}
            }
        };
        refreshCityIfNeeded();
    }, [hasInternet, location, manualCity, resolvedCityName]);

    const setupLocationAndCompass = async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            // Start compass and subscribe to updates
            await HeadingService.start();

            // Ensure we subscribe after starting so the first value is from sensors
            if (!headingUnsubRef.current) {
                headingUnsubRef.current = HeadingService.subscribe((newHeading) => {
                    setHeading(newHeading);
                });
            }

            // Skip permission request if user previously denied and prefers manual mode
            if (prefs.locationDenied) {
                setErrorMsg('Location permission denied. Using manual city selection.');
            } else {
                const hasPermission = await LocationService.requestPermission();
                if (!hasPermission) {
                    update('locationDenied', true);
                    setErrorMsg('Location permission denied. Using manual city selection.');
                } else {
                    const currentLocation = await LocationService.getCurrentLocation();
                    setLocation(currentLocation);
                    setManualCity(null); // Reset manual city if GPS works
                    // Try reverse geocoding to get city name
                    const name = await LocationService.getCityName(currentLocation.latitude, currentLocation.longitude);
                    setResolvedCityName(name);
                }
            }
        } catch (error) {
            setErrorMsg('Error getting location. Please try again or search manually.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCity = (city: City) => {
        setManualCity(city);
        setLocation({
            latitude: city.latitude,
            longitude: city.longitude,
        });
        setErrorMsg(null); // Clear any previous errors
    };

    const handleUseGPS = () => {
        setupLocationAndCompass();
    };

    // Announce alignment changes for screen readers when enabled
    useEffect(() => {
        if (!prefs.announceAccessibility) return;
        const diffRaw = (qiblaDirection - heading + 540) % 360 - 180;
        const absDiff = Math.abs(diffRaw);
        const alignedNow = absDiff <= (prefs.toleranceDeg || 5);
        if (alignedNow !== lastAlignedRef.current) {
            lastAlignedRef.current = alignedNow;
            const message = alignedNow ? 'Aligned with Qibla' : `Leaving alignment: adjust ${Math.round(absDiff)} degrees`;
            AccessibilityInfo.announceForAccessibility(message);
        }
    }, [heading, qiblaDirection, prefs.announceAccessibility, prefs.toleranceDeg]);

    // Trigger ratings prompt after several successful alignments, once
    useEffect(() => {
        if (!prefs.askForRatings) return;
        const diffRaw = (qiblaDirection - heading + 540) % 360 - 180;
        const absDiff = Math.abs(diffRaw);
        const alignedNow = absDiff <= (prefs.toleranceDeg || 5);
        if (alignedNow && !prefs.hasPromptedForRating) {
            // heuristic: show after 3 distinct alignments (session-based)
            const count = (HomeScreen as any)._alignCount || 0;
            (HomeScreen as any)._alignCount = count + 1;
            if ((HomeScreen as any)._alignCount >= 3) {
                setShowRatePrompt(true);
            }
        }
    }, [heading, qiblaDirection, prefs.hasPromptedForRating, prefs.toleranceDeg, prefs.askForRatings]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Finding Qibla...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            <HeaderBar
                title={a11yStrings.qiblaFinderTitle}
                subtitle={manualCity ? `📍 ${manualCity.name}` : `📍 ${a11yStrings.currentLocation}`}
                actions={[
                    { icon: 'compass', onPress: () => setSearchVisible(true), accessibilityLabel: a11yStrings.searchCity },
                    { icon: 'settings', onPress: () => navigation.navigate('Settings'), accessibilityLabel: 'Settings' },
                ]}
                accessibilityRole="header"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {errorMsg ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMsg}</Text>
                                                {!prefs.locationDenied && (
                                                    <TouchableOpacity style={styles.retryButton} onPress={setupLocationAndCompass}>
                                                            <Text style={styles.retryText}>Retry GPS</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {prefs.locationDenied && (
                                                    <TouchableOpacity style={styles.retryButton} onPress={() => update('locationDenied', false)}>
                                                            <Text style={styles.retryText}>Enable GPS</Text>
                                                    </TouchableOpacity>
                                                )}
                        <TouchableOpacity style={[styles.retryButton, { marginTop: 10, backgroundColor: theme.colors.secondary }]} onPress={() => setSearchVisible(true)}>
                            <Text style={[styles.retryText, { color: theme.colors.secondaryContrast }]}>Search City</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* One-time tutorial overlay */}
                        {!prefs.hasSeenCompassTutorial && (
                            <CompassTutorial onComplete={() => update('hasSeenCompassTutorial', true)} />
                        )}
                        <CompassView heading={heading} qiblaDirection={qiblaDirection} />
                        {showRatePrompt && (
                            <RatePrompt
                                onRate={async () => {
                                    setShowRatePrompt(false);
                                    update('hasPromptedForRating', true);
                                    try {
                                        const has = await StoreReview.hasAction();
                                        if (has) {
                                            await StoreReview.requestReview();
                                        } else {
                                            // Fallback to store page
                                            const pkg = 'org.khairlabs.qibla';
                                            const url = `market://details?id=${pkg}`;
                                            // dynamic import to avoid extra import at top
                                            const { Linking } = await import('react-native');
                                            const supported = await Linking.canOpenURL(url);
                                            if (supported) await Linking.openURL(url);
                                        }
                                    } catch {}
                                }}
                                onLater={() => setShowRatePrompt(false)}
                                onNoThanks={() => { setShowRatePrompt(false); update('hasPromptedForRating', true); }}
                            />
                        )}

                        {/* Unified status panel */}
                        <View style={styles.statusPanel} accessibilityRole="summary">
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Qibla</Text>
                                <Text style={styles.statusValue}>{Math.round(qiblaDirection)}°</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Heading</Text>
                                <Text style={styles.statusValue}>{Math.round(heading)}°</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>City</Text>
                                <Text style={[styles.statusValue, hasInternet === false ? styles.statusValueError : (manualCity || resolvedCityName ? styles.statusValuePrimary : styles.statusValueMuted)]}>
                                    {manualCity ? manualCity.name : (hasInternet === false ? 'No internet' : (resolvedCityName || a11yStrings.currentLocation))}
                                </Text>
                            </View>
                            {(() => {
                                const diffRaw = (qiblaDirection - heading + 540) % 360 - 180; // shortest signed diff
                                const absDiff = Math.abs(diffRaw);
                                const turnDir = absDiff <= (prefs.toleranceDeg || 5) ? 'Aligned' : diffRaw > 0 ? 'Turn Right' : 'Turn Left';
                                return (
                                    <View style={[styles.statusRow, { marginTop: theme.spacing.sm }]}>
                                        <Text style={[styles.statusLabel, { opacity: 0.9 }]}>Adjustment</Text>
                                        <Text style={[styles.adjustmentValue, turnDir === 'Aligned' ? styles.adjustmentAligned : { color: theme.colors.info || theme.colors.warning }]}>
                                            {turnDir === 'Aligned' ? '✓ Aligned' : `${turnDir} ${Math.round(absDiff)}°`}
                                        </Text>
                                    </View>
                                );
                            })()}
                            {manualCity && (
                                <TouchableOpacity onPress={handleUseGPS} style={styles.gpsButton} accessibilityLabel="Switch back to GPS location">
                                    <Feather name="navigation" size={16} color={theme.colors.primaryContrast} style={{ marginRight: 6 }} />
                                    <Text style={styles.gpsButtonText}>📍 Use Current Location</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            <SearchCityModal
                visible={searchVisible}
                onClose={() => setSearchVisible(false)}
                onSelectCity={handleSelectCity}
                announceAccessibility={prefs.announceAccessibility}
            />
        </SafeAreaView>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    // header styles removed; using shared HeaderBar
    content: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: theme.spacing.xl,
    },
    errorContainer: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    errorText: {
        ...theme.typography.body,
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    retryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
    },
    retryText: {
        ...theme.typography.body,
        color: theme.colors.primaryContrast,
        fontWeight: '600',
    },
    infoContainer: {
        marginTop: theme.spacing.xl,
        alignItems: 'center',
    },
    statusPanel: {
        // Extra offset to avoid overlapping the compass outer ring
        marginTop: theme.spacing.xl + 48,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        width: '80%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.small,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
        flexWrap: 'wrap',
    },
    statusLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statusValue: {
        ...theme.typography.h3,
        color: theme.colors.primary,
        fontWeight: '700',
        flexShrink: 1,
    },
    statusValuePrimary: {
        color: theme.colors.primary,
    },
    statusValueMuted: {
        color: theme.colors.textSecondary,
    },
    statusValueError: {
        color: theme.colors.error,
    },
    adjustmentValue: {
        ...theme.typography.h3,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    adjustmentAligned: {
        color: theme.colors.success,
    },
    infoLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    infoValue: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        marginTop: theme.spacing.xs,
    },
    gpsButton: {
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.small,
    },
    gpsButtonText: {
        ...theme.typography.body,
        color: theme.colors.primaryContrast,
        fontWeight: '600',
    },
});
