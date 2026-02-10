import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@rneui/themed';
import { useColorScheme } from 'react-native';
import { store } from '../store';
import { lightTheme, darkTheme } from '../theme';
import { rehydrateAuth } from '../store/authSlice';
import { loadTheme, ThemeMode } from '../utils/theme';

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const savedTheme = await loadTheme();
      setThemeMode(savedTheme);
      await store.dispatch(rehydrateAuth());
      setIsReady(true);
    };

    initialize();
  }, []);

  if (!isReady) {
    return null;
  }

  const getActiveTheme = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={getActiveTheme()}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </Provider>
  );
}
