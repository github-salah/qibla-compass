import { Platform } from 'react-native';

/**
 * Check if the app is running on web platform
 */
export const isWeb = (): boolean => {
    return Platform.OS === 'web';
};

/**
 * Check if the app is running on a mobile platform
 */
export const isMobile = (): boolean => {
    return Platform.OS === 'ios' || Platform.OS === 'android';
};
