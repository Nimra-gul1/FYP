import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

const COLORS = {
  palePink: '#F5D5E0',
  mutedBlue: '#6E48AA', // Updated to Deep Lavender
  purple: '#9D50BB',    // Soft Orchid
  deepPurple: '#4A235A',
  darkest: '#2E004F'
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9D50BB',
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30, // Lifted slightly
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Clean White Glass
          borderRadius: 35, // More rounded pill shape
          height: 75, // Taller for comfort
          borderWidth: 0, // No border for cleaner look
          paddingBottom: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#9D50BB',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
            },
            android: {
              elevation: 8, // Soft shadow
            },
          })
        },
        tabBarShowLabel: false, // Hide labels for clean look
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', top: Platform.OS === 'ios' ? 10 : 0 }}>
              <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', top: Platform.OS === 'ios' ? 10 : 0 }}>
              <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={28} color={color} />
            </View>
          ),
          tabBarStyle: { display: 'none' }, // Hide tab bar on Chat screen
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', top: Platform.OS === 'ios' ? 10 : 0 }}>
              <Ionicons name={focused ? "compass" : "compass-outline"} size={28} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
