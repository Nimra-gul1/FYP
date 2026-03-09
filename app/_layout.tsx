/* import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Splash Screens */
/* <Stack.Screen name="Splashscreens/Screen1" />
 <Stack.Screen name="Splashscreens/Screen2" />

 {/* Authentication Screens */
/* <Stack.Screen name="Register/Welcome" />
 <Stack.Screen name="Register/Login" />
 <Stack.Screen name="Register/Signup" />

 /* Main App Tabs & Modal 
 <Stack.Screen name="(tabs)" />
 <Stack.Screen
   name="modal"
   options={{ presentation: 'modal', title: 'Modal' }}
 />
</Stack>

<StatusBar style="auto" />
</ThemeProvider>
);
}*/


//chatbot code
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// };
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Splash Screens */}
        <Stack.Screen name="Splashscreens/Screen1" />
        <Stack.Screen name="Splashscreens/Screen2" />

        {/*  Authentication Screens */}
        <Stack.Screen name="Register/index" />
        <Stack.Screen name="Register/Login" />
        <Stack.Screen name="Register/Signup" />

        {/*  Main App Tabs */}
        <Stack.Screen name="(tabs)" />

        {/*  Profile Screen */}
        <Stack.Screen name="Register/ProfileScreen" />

        {/* Modal */}
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

