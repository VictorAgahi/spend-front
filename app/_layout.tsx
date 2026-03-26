import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/providers/auth.provider';
import { NotificationProvider } from '../src/providers/notification.provider';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    setTimeout(() => SplashScreen.hideAsync(), 1000);
  }, []);

  return (
    <NotificationProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
        </Stack>
      </AuthProvider>
    </NotificationProvider>
  );
}
