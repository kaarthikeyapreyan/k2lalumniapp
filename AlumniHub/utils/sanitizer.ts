import { NotificationSettings, NotificationCategory } from '../types';

/**
 * Ensures that a value is a strict boolean.
 * Useful for sanitizing rehydrated state from AsyncStorage.
 */
export const toBoolean = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === 1 || val === '1') return true;
    if (val === 'false' || val === 0 || val === '0') return false;
    return !!val;
};

/**
 * Sanitizes notification settings to ensure all boolean flags are strictly boolean.
 */
export const sanitizeNotificationSettings = (settings: any): NotificationSettings => {
    if (!settings) return settings;

    const sanitized: any = { ...settings };

    if (settings.globalEnabled !== undefined) {
        sanitized.globalEnabled = toBoolean(settings.globalEnabled);
    }

    if (settings.perCategory) {
        sanitized.perCategory = {};
        Object.keys(settings.perCategory).forEach((key) => {
            const cat = settings.perCategory[key];
            sanitized.perCategory[key] = {
                enabled: toBoolean(cat.enabled),
                pushEnabled: toBoolean(cat.pushEnabled),
                soundEnabled: toBoolean(cat.soundEnabled),
                vibrationEnabled: toBoolean(cat.vibrationEnabled),
            };
        });
    }

    if (settings.doNotDisturb) {
        sanitized.doNotDisturb = {
            ...settings.doNotDisturb,
            enabled: toBoolean(settings.doNotDisturb.enabled),
        };
    }

    if (settings.quietHours) {
        sanitized.quietHours = {
            ...settings.quietHours,
            enabled: toBoolean(settings.quietHours.enabled),
        };
    }

    return sanitized as NotificationSettings;
};
