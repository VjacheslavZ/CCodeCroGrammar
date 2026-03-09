import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-native-reanimated';
import '@/i18n';

import { queryClient } from '@/api/query-client';
import { useAuthHydration } from '@/hooks/use-auth-hydration';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { store, useAppSelector } from '@/store';

function RootNavigator() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAuthHydration();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" redirect={!isAuthenticated} />
        <Stack.Screen name="(auth)" redirect={isAuthenticated} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
