import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../styles/theme';
import CitySearchService, { City, CitySearchPage } from '../services/CitySearchService';
import HeaderBar from './HeaderBar';
import { AccessibilityInfo } from 'react-native';
import { a11yStrings } from '../accessibility/strings';
import NetInfo from '@react-native-community/netinfo';

interface SearchCityModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectCity: (city: City) => void;
    announceAccessibility?: boolean; // optional accessibility announcements
}

export const SearchCityModal: React.FC<SearchCityModalProps> = ({
    visible,
    onClose,
    onSelectCity,
    announceAccessibility = false,
}) => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<City[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const PAGE_SIZE = 12;
    const [loading, setLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 3) {
            setResults([]);
            setPage(0);
            setHasMore(false);
            return;
        }

        if (isConnected === false) {
            setResults([]);
            setLoading(false);
            return;
        }

        if (debounceTimer) clearTimeout(debounceTimer);
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                // Reset to first page on query change
                const firstPage: CitySearchPage = await CitySearchService.searchCitiesPaged(trimmed, 0, PAGE_SIZE);
                setResults(firstPage.cities);
                setPage(0);
                setHasMore(firstPage.hasMore);
            } catch (err) {
                setResults([]);
                setHasMore(false);
            }
            setLoading(false);
        }, 450);
        setDebounceTimer(timer);
        return () => { if (timer) clearTimeout(timer); };
    }, [query, isConnected]);

    const loadMore = async () => {
        if (!hasMore || loading) return;
        const trimmed = query.trim();
        setLoading(true);
        try {
            const nextPageIndex = page + 1;
            const pageData = await CitySearchService.searchCitiesPaged(trimmed, nextPageIndex, PAGE_SIZE);
            setResults(prev => [...prev, ...pageData.cities]);
            setPage(nextPageIndex);
            setHasMore(pageData.hasMore);
        } catch (e) {
            // swallow
        }
        setLoading(false);
    };

    useEffect(() => {
        const sub = NetInfo.addEventListener((state: any) => {
            setIsConnected(state.isConnected ?? null);
        });
        // get initial state
        NetInfo.fetch().then((state: any) => setIsConnected(state.isConnected ?? null));
        return () => sub();
    }, []);

    const handleSelect = (city: City) => {
        onSelectCity(city);
        onClose();
        setQuery('');
        setResults([]);
    };

    // Announce result count changes for screen readers
    React.useEffect(() => {
        if (!announceAccessibility) return;
        if (query.trim().length >= 3 && isConnected && !loading) {
            const count = results.length;
            AccessibilityInfo.announceForAccessibility(
                count === 0 ? 'No cities found' : `${count} ${count === 1 ? 'result' : 'results'} found`
            );
        }
    }, [results.length, loading, isConnected, query, announceAccessibility]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <HeaderBar
                        title={a11yStrings.searchCityTitle}
                        onLeftPress={onClose}
                        leftIcon="x"
                        leftAccessibilityLabel={a11yStrings.closeSearch}
                        accessibilityRole="header"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Enter city name..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />

                    {!isConnected ? (
                        <Text style={styles.offlineText}>No network connection — please connect to the internet to search cities.</Text>
                    ) : loading && results.length === 0 ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.resultItem}
                                    onPress={() => {
                                        handleSelect(item);
                                        if (announceAccessibility) {
                                            AccessibilityInfo.announceForAccessibility(a11yStrings.selectedCity(item.name));
                                        }
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select ${item.name}, ${[item.admin1, item.country].filter(Boolean).join(', ')}`}
                                >
                                    <Text style={styles.cityName}>{item.name}</Text>
                                    <Text style={styles.cityDetail}>
                                        {[item.admin1, item.country].filter(Boolean).join(', ')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                query.trim().length >= 3 && !loading ? (
                                    <Text style={styles.emptyText}>No cities found</Text>
                                ) : null
                            }
                            onEndReachedThreshold={0.4}
                            onEndReached={loadMore}
                            ListFooterComponent={hasMore ? (
                                <View style={{ paddingVertical: theme.spacing.md, alignItems: 'center' }}>
                                    {loading ? <ActivityIndicator size="small" color={theme.colors.primary} /> : (
                                        <Text style={styles.loadingMoreText} accessibilityLabel="Load more cities">Scroll for more...</Text>
                                    )}
                                </View>
                            ) : null}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        height: '80%',
        padding: theme.spacing.lg,
        ...theme.shadows.large,
    },
    // header styles removed; using shared HeaderBar
    input: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        color: theme.colors.text,
        ...theme.typography.body,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    resultItem: {
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    cityName: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text,
    },
    cityDetail: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: theme.spacing.xl,
        color: theme.colors.textSecondary,
        ...theme.typography.body,
    },
    loadingMoreText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    offlineText: {
        textAlign: 'center',
        marginTop: theme.spacing.lg,
        color: theme.colors.error,
        ...theme.typography.body,
        fontWeight: '600',
    },
});
