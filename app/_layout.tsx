import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth';
import { loadAppFonts } from '@/lib/load-app-fonts';
import { colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const SPLASH_FALLBACK_MS = 4000;

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...loadAppFonts(),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  /** APK에서 폰트 로드가 멈추면 스플래시에서 영원히 대기 — 타임아웃으로 강제 진입 */
  useEffect(() => {
    const fallback = setTimeout(() => setAppReady(true), SPLASH_FALLBACK_MS);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
        <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
        <Stack.Screen name="couple/connect" options={{ headerShown: false }} />
        <Stack.Screen name="our/routes" options={{ headerShown: false }} />
        <Stack.Screen name="route/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="route/create"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="route/edit/[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
