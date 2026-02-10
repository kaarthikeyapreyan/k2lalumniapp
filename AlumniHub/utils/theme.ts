import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@alumnihub_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const saveTheme = async (theme: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const loadTheme = async (): Promise<ThemeMode> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return (theme as ThemeMode) || 'system';
  } catch (error) {
    console.error('Error loading theme:', error);
    return 'system';
  }
};
