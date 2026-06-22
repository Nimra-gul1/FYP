import 'react-native-gesture-handler';
import 'react-native-reanimated';
import './_patch'; // Load global UI fixes first
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Toast, setToastRef } from './components/ThemedToast';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Splashscreens/Screen1" />
        <Stack.Screen name="Splashscreens/Screen2" />
        <Stack.Screen name="Register/Account" />
        <Stack.Screen name="Register/Login" />
        <Stack.Screen name="Register/Signup" />
        <Stack.Screen name="Register/ForgotPassword" />
        <Stack.Screen name="Register/index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="Register/ProfileScreen" />
        <Stack.Screen name="customize" />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
      <Toast ref={(ref) => setToastRef(ref)} />
    </ThemeProvider>
  );
}
