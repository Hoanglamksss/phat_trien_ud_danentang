
import { Stack } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {

    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);


  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(protected)" options={{ headerShown: false }} /> 
      <Stack.Screen name="(admin)" options={{ headerShown: false }} /> 
    </Stack>
  );
}