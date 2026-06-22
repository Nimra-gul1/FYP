import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { MOOD_THEMES, MoodTheme } from "../../constants/MoodThemes";
import { rf, scale, wp, hp } from "../utils/responsive";

const COLORS = {
  palePink: "#F5D5E0",
  mutedBlue: "#6E48AA", // Updated to Deep Lavender
  purple: "#9D50BB", // Soft Orchid
  deepPurple: "#4A235A",
  darkest: "#2E004F",
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>(MOOD_THEMES[0]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem("appTheme");
        const theme = MOOD_THEMES.find((t) => t.id === saved) || MOOD_THEMES[0];
        setCurrentTheme(theme);
      } catch (e) {
        setCurrentTheme(MOOD_THEMES[0]);
      }
    };

    loadTheme();
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: currentTheme.textDim,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          bottom: scale(12),
          left: scale(42),
          right: scale(42),
          height: scale(56),
          elevation: 0,
          backgroundColor: currentTheme.colors[0],
          borderRadius: scale(22),
          borderWidth: 1,
          borderColor: `${currentTheme.primary}33`,
          paddingBottom: Platform.OS === "ios" ? scale(4) : 0,
          paddingTop: Platform.OS === "ios" ? scale(4) : 0,
          ...Platform.select({
            ios: {
              shadowColor: currentTheme.primary,
              shadowOffset: { width: 0, height: scale(3) },
              shadowOpacity: 0.12,
              shadowRadius: scale(8),
            },
            android: {
              elevation: 3,
            },
          }),
        },
        tabBarItemStyle: {
          height: scale(50),
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={scale(23)}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={scale(24)}
                color={color}
              />
            </View>
          ),
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
