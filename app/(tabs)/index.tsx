import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "../components/ThemedToast";
import { apiFetch } from "../utils/api";
import { rf, scale, wp } from "../utils/responsive";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { MOOD_THEMES, MoodTheme } from "../../constants/MoodThemes";

const SCREEN_WIDTH = wp(100);

// Default initial colors
const DEFAULT_COLORS = MOOD_THEMES[0];

// Glass Style (Clean Transparency - No Shadow Artifacts)
const lightGlassStyle = (opacity = 0) => ({
  backgroundColor: `rgba(255, 255, 255, ${Math.max(opacity, 0.72)})`,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.55)",
  elevation: 0,
  shadowOpacity: 0,
});

const COMFORT_STYLES = [
  { id: "gentle", label: "Gentle", icon: "flower-outline", color: "#ff9ff3" },
  {
    id: "motivational",
    label: "Push",
    icon: "flame-outline",
    color: "#ff9f43",
  },
  { id: "spiritual", label: "Spirit", icon: "moon-outline", color: "#54a0ff" },
  {
    id: "silent",
    label: "Silent",
    icon: "volume-mute-outline",
    color: "#a29bfe",
  },
];

const HOPE_MESSAGES = [
  "Even small rest counts today.",
  "You are more than your productivity.",
  "Breathe. You're doing enough.",
  "Propel yourself forward, gently.",
  "Your pace is the right pace.",
];

// Configure Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation();
  const [streak, setStreak] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState("gentle");
  const [hopeMessage, setHopeMessage] = useState("");
  const [userName, setUserName] = useState("Friend");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>(MOOD_THEMES[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [infoModalConfig, setInfoModalConfig] = useState({
    visible: false,
    title: "",
    content: "",
  });

  // Rating & Review State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const submitReview = async () => {
    try {
      const res = await apiFetch("/api/user/review", {
        method: "POST",
        body: JSON.stringify({
          rating: reviewRating,
          reviewText,
          userName,
          userEmail,
        }),
      });
      if (res.ok) {
        showToast("Review submitted beautifully!", "success");
        setReviewModalVisible(false);
        setReviewText("");
        setReviewRating(5);
      } else {
        showToast("Error submitting review", "error");
      }
    } catch (e) {
      showToast("Error submitting review", "error");
    }
  };

  const openInfoModal = (title: string, content: string) => {
    setIsSettingsOpen(false);
    setInfoModalConfig({ visible: true, title, content });
  };
  // Daily Glimmer — MongoDB verse state
  const [glimmerText, setGlimmerText] = useState("");
  const [glimmerRef, setGlimmerRef] = useState("");
  const [glimmerLoading, setGlimmerLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchStreak();
      loadData();
      loadTheme();
    }, [userEmail]),
  );

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem("appTheme");
      if (saved) {
        const theme = MOOD_THEMES.find((t) => t.id === saved);
        if (theme) setCurrentTheme(theme);
      }
    } catch (e) {
      console.error("Failed to load theme", e);
    }
  };

  const dynamicStyles = {
    greeting: [styles.greeting, { color: currentTheme.textDark }],
    subGreeting: [styles.subGreeting, { color: currentTheme.textDim }],
    sidebarItemText: [styles.sidebarItemText, { color: currentTheme.textDark }],
    sidebarTitle: [styles.sidebarTitle, { color: currentTheme.textDark }],
    styleLabel: [styles.styleLabel, { color: currentTheme.textDim }],
    glimmerText: [styles.glimmerText, { color: currentTheme.textDark }],
    glimmerBtn: [
      styles.hopeBtnContainer,
      { shadowColor: currentTheme.primary },
    ],
    cardTitle: [styles.cardTitle, { color: currentTheme.textDark }],
    cardSubtitle: [styles.cardSubtitle, { color: currentTheme.textDim }],
    sectionTitle: [styles.sectionTitle, { color: currentTheme.primary }],
    streakTextSmall: [styles.streakTextSmall, { color: currentTheme.textDark }],
    modalTitle: [styles.modalTitle, { color: currentTheme.textDark }],
    modalText: [styles.modalText, { color: currentTheme.textDark }],
  };

  const fetchStreak = async () => {
    try {
      const localToday = new Date().toDateString();
      const res = await apiFetch(
        `/api/journal/streak?clientDate=${encodeURIComponent(localToday)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setStreak(data.currentStreak || 0);
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching streak:", err);
    }
  };

  // Toggle Tab Bar visibility when Sidebar opens/closes
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isSettingsOpen
        ? { display: "none" }
        : {
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
            shadowColor: currentTheme.primary,
            shadowOffset: { width: 0, height: scale(3) },
            shadowOpacity: 0.12,
            shadowRadius: scale(8),
          },
      tabBarItemStyle: {
        height: scale(50),
      },
    });
  }, [isSettingsOpen, currentTheme, navigation]);

  // Fetch a fresh verse from MongoDB for the Daily Glimmer card
  const fetchDailyGlimmer = async () => {
    setGlimmerLoading(true);
    try {
      const res = await apiFetch("/api/chat/verse", {
        method: "POST",
        body: JSON.stringify({ mood: "Peace", shortOnly: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setGlimmerText(data.translation || "");
        setGlimmerRef(data.verseRef || "");
      } else {
        setGlimmerText("Every soul shall taste peace.");
        setGlimmerRef("");
      }
    } catch (e) {
      setGlimmerText("Every soul shall taste peace.");
      setGlimmerRef("");
    } finally {
      setGlimmerLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) setUserEmail(email);

      const styleKey = email ? `comfortStyle_${email}` : "comfortStyle";

      const savedStyle = await AsyncStorage.getItem(styleKey);
      if (savedStyle) setSelectedStyle(savedStyle);

      const name = await AsyncStorage.getItem("userName");
      if (name) setUserName(name);

      // Fetch first verse on load
      fetchDailyGlimmer();
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    }
  };

  // --- Navigation & Sidebar ---
  const handleReminder = async () => {
    setIsSettingsOpen(false);
    try {
      const existingStatusObj: any = await Notifications.getPermissionsAsync();
      let isGranted =
        existingStatusObj.granted || existingStatusObj.status === "granted";

      if (!isGranted && existingStatusObj.canAskAgain !== false) {
        const reqObj: any = await Notifications.requestPermissionsAsync();
        isGranted = reqObj.granted || reqObj.status === "granted";
      }

      if (!isGranted) {
        showToast("Notification permission denied", "error");
        return;
      }

      // Cancel any existing daily reminders to avoid duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule for 9:00 PM every day
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Qalbify • Time to Reflect",
          body: "Breathe in. How was your heart today? Take a moment for your journal.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 21,
          minute: 0,
          repeats: true,
        },
      });

      showToast("Daily reminder set for 9:00 PM", "success");
    } catch (error) {
      showToast("Could not set reminder", "error");
    }
  };

  const handleRecommend = async () => {
    const message =
      "Hi! I've been using Qalbify to stay heart-centered and calm. You should try it too! ✨\n\nDownload here: http://qalbify.com";
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      // Close sidebar first for smooth transition
      setIsSettingsOpen(false);

      // Attempt to open WhatsApp directly
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to system share sheet if WhatsApp is not available
        await Share.share({
          message: message,
          title: "Qalbify Recommendation",
          // url: 'https://qalbify.com' // Optional enhancement for iOS
        });
      }
    } catch (error) {
      console.error("[Share] Error:", error);
      // Fallback to basic share if above fails
      try {
        await Share.share({ message });
      } catch (e) {
        showToast("Could not share link", "error");
      }
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    try {
      await GoogleSignin.signOut();
    } catch (_) {
      // Ignore if Google Sign-In was not used / not configured
    }
    router.replace("Register/Login" as any);
  };

  const handleStyleSelect = async (styleId: string) => {
    setSelectedStyle(styleId);
    const email = await AsyncStorage.getItem("userEmail");
    const styleKey = email ? `comfortStyle_${email}` : "comfortStyle";
    await AsyncStorage.setItem(styleKey, styleId);
  };

  const generateMicroHope = () => {
    const randomMsg =
      HOPE_MESSAGES[Math.floor(Math.random() * HOPE_MESSAGES.length)];
    setHopeMessage(randomMsg);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={currentTheme.colors as any}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Settings Modal (Sidebar) - MOVED TO ROOT absolute position */}
      {isSettingsOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setIsSettingsOpen(false)}
          />
          <View
            style={[
              styles.sidebarContent,
              { backgroundColor: currentTheme.colors[0] },
            ]}
          >
            <View style={styles.sidebarHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../assets/logoo copy.png")}
                  style={{
                    width: scale(50),
                    height: scale(50),
                    borderRadius: scale(25),
                    borderWidth: 2,
                    borderColor: currentTheme.primary,
                  }}
                />
                <View style={{ marginLeft: scale(12) }}>
                  <Text
                    style={{
                      fontSize: rf(18),
                      fontWeight: "700",
                      color: currentTheme.textDark,
                    }}
                  >
                    Account
                  </Text>
                  <Text
                    style={{ fontSize: rf(12), color: currentTheme.textDim }}
                  >
                    {userEmail || "Loading..."}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)}>
                <Ionicons
                  name="close"
                  size={scale(24)}
                  color={currentTheme.textDark}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarItems}>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => router.push("/journal")}
              >
                <Ionicons
                  name="book"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>Journal Entry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setIsSettingsOpen(false);
                  router.push("/customize");
                }}
              >
                <Ionicons
                  name="color-palette"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>
                  Colors and style
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={handleReminder}
              >
                <Ionicons
                  name="notifications"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>Reminder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setIsSettingsOpen(false);
                  setReviewModalVisible(true);
                }}
              >
                <Ionicons
                  name="star"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>
                  Rate and review
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={handleRecommend}
              >
                <Ionicons
                  name="share-social"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>
                  Recommend to a friend
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() =>
                  openInfoModal(
                    "Feedback",
                    "We deeply value your thoughts! Let us know how we can improve by reaching out to us at feedback@qalbify.com.",
                  )
                }
              >
                <Ionicons
                  name="chatbox-ellipses"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() =>
                  openInfoModal(
                    "About",
                    "Qalbify is your premium digital safe space. Created to help you reflect, process, and grow without distractions. Built with an empathetic design, this platform ensures you have a private corner for your thoughts, completely secure and free from judgment.",
                  )
                }
              >
                <Ionicons
                  name="information-circle"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>About</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() =>
                  openInfoModal(
                    "Privacy Policy",
                    "Your privacy is our utmost priority. All journal entries and chatbot interactions are encrypted and secured. Qalbify operates on strict confidentiality principles. We use advanced Differential Privacy practices to ensure your data remains yours alone.",
                  )
                }
              >
                <Ionicons
                  name="shield-checkmark"
                  size={scale(22)}
                  color={currentTheme.primary}
                />
                <Text style={dynamicStyles.sidebarItemText}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>

              <View style={styles.sidebarDivider} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={logout}
                style={{ marginTop: scale(10), marginBottom: scale(20) }}
              >
                <LinearGradient
                  colors={[currentTheme.primary, currentTheme.accent]}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: scale(14),
                    borderRadius: scale(25),
                    shadowColor: "#9D50BB",
                    shadowOffset: { width: 0, height: scale(4) },
                    shadowOpacity: 0.3,
                    shadowRadius: scale(8),
                    elevation: 5,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="log-out" size={scale(20)} color="#FFF" />
                  <Text
                    style={{
                      color: "#FFF",
                      fontSize: rf(16),
                      fontWeight: "700",
                      marginLeft: scale(8),
                    }}
                  >
                    Logout
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Ambient Blobs for aesthetic */}
      <View
        style={[
          styles.orb,
          { top: scale(-100), right: scale(-80), backgroundColor: "#A4B0F5" },
        ]}
      />
      <View
        style={[
          styles.orb,
          { bottom: scale(50), left: scale(-100), backgroundColor: "#FFE4E1" },
        ]}
      />

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Rate Qalbify</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={scale(24)}
                  color={currentTheme.textDark}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalText, { marginBottom: 15 }]}>
              How are you feeling about your journey here?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginVertical: scale(15),
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={{ marginHorizontal: scale(5) }}
                >
                  <Ionicons
                    name={star <= reviewRating ? "star" : "star-outline"}
                    size={scale(40)}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={{
                minHeight: scale(80),
                backgroundColor: "rgba(157, 80, 187, 0.05)",
                borderRadius: scale(12),
                padding: scale(15),
                fontSize: rf(16),
                color: currentTheme.textDark,
                textAlignVertical: "top",
              }}
              placeholder="Tell us what you love or how we can improve..."
              placeholderTextColor="rgba(74, 35, 90, 0.4)"
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity
              onPress={submitReview}
              style={{ marginTop: scale(24) }}
            >
              <LinearGradient
                colors={[currentTheme.primary, currentTheme.accent]}
                style={{
                  borderRadius: scale(25),
                  paddingVertical: scale(14),
                  alignItems: "center",
                  shadowColor: "#9D50BB",
                  shadowOffset: { width: 0, height: scale(4) },
                  shadowOpacity: 0.3,
                  shadowRadius: scale(8),
                  elevation: 5,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    fontSize: rf(16),
                  }}
                >
                  Submit Review
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Information Modal */}
      <Modal
        visible={infoModalConfig.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setInfoModalConfig((prev) => ({ ...prev, visible: false }))
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>
                {infoModalConfig.title}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setInfoModalConfig((prev) => ({ ...prev, visible: false }))
                }
              >
                <Ionicons
                  name="close"
                  size={scale(24)}
                  color={currentTheme.textDark}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              <Text style={dynamicStyles.modalText}>
                {infoModalConfig.content}
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() =>
                setInfoModalConfig((prev) => ({ ...prev, visible: false }))
              }
              style={{ marginTop: scale(24) }}
            >
              <LinearGradient
                colors={[currentTheme.primary, currentTheme.accent]}
                style={{
                  borderRadius: scale(25),
                  paddingVertical: scale(14),
                  alignItems: "center",
                  shadowColor: "#9D50BB",
                  shadowOffset: { width: 0, height: scale(4) },
                  shadowOpacity: 0.3,
                  shadowRadius: scale(8),
                  elevation: 5,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    fontSize: rf(16),
                  }}
                >
                  Close
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "transparent" }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={dynamicStyles.greeting}>Hi, {userName}</Text>
              <View style={styles.subHeaderRow}>
                <Text style={dynamicStyles.subGreeting}>
                  A fresh start, every moment.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/streak")}
                  activeOpacity={0.8}
                  style={[styles.streakBadgeSmall, lightGlassStyle(0.6)]}
                >
                  <Ionicons name="flame" size={12} color="#FF8A65" />
                  <Text style={dynamicStyles.streakTextSmall}>{streak}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsSettingsOpen(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[currentTheme.primary, currentTheme.accent]}
                style={styles.settingsBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name="settings-outline"
                  size={scale(24)}
                  color="#FFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 1. Daily Glimmer */}
          <View style={styles.sectionContainer}>
            <Text style={dynamicStyles.sectionTitle}>Daily Glimmer</Text>
            <View style={[styles.card, lightGlassStyle(0.35)]}>
              <Text style={styles.hopeText}>
                "
                {glimmerText ||
                  (glimmerLoading
                    ? "Fetching your verse..."
                    : "Tap to illuminate your day...")}
                "
              </Text>
              {glimmerRef ? (
                <Text
                  style={{
                    fontSize: 13,
                    color: currentTheme.textDark,
                    fontWeight: "600",
                    marginBottom: 14,
                    textAlign: "center",
                    opacity: 0.8,
                  }}
                >
                  — {glimmerRef}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={fetchDailyGlimmer}
                activeOpacity={0.8}
                style={styles.hopeBtnContainer}
                disabled={glimmerLoading}
              >
                <LinearGradient
                  colors={[currentTheme.primary, currentTheme.accent]}
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.actionBtnText}>
                    {glimmerLoading
                      ? "Loading..."
                      : glimmerText
                        ? "New Verse"
                        : "Illuminate"}
                  </Text>
                  <Ionicons
                    name="sparkles"
                    size={16}
                    color="#FFF"
                    style={{ marginLeft: 8 }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Quick Access Cards */}
          <View style={styles.sectionContainer}>
            <Text style={dynamicStyles.sectionTitle}>Explore</Text>
            <View style={styles.grid}>
              {/* Chatbot Card */}
              <TouchableOpacity
                onPress={() => router.push("/chatbot")}
                activeOpacity={0.9}
                style={[styles.gridCardMain, lightGlassStyle(0.35)]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <Ionicons
                      name="chatbubbles"
                      size={28}
                      color={currentTheme.primary}
                    />
                  </View>
                  <View>
                    <Text style={dynamicStyles.cardTitle}>Chatbot</Text>
                    <Text style={dynamicStyles.cardSubtitle}>
                      Your safe space
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={currentTheme.primary}
                  style={{ opacity: 0.6 }}
                />
              </TouchableOpacity>

              {/* Journal Card */}
              <TouchableOpacity
                onPress={() => router.push("/journal")}
                activeOpacity={0.9}
                style={[
                  styles.gridCardMain,
                  lightGlassStyle(0.35),
                  { marginTop: 12 },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="book" size={28} color={currentTheme.primary} />
                  </View>
                  <View>
                    <Text style={dynamicStyles.cardTitle}>My Journal</Text>
                    <Text style={dynamicStyles.cardSubtitle}>
                      Write your thoughts
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={currentTheme.primary}
                  style={{ opacity: 0.6 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: {
    padding: scale(24),
    paddingBottom: scale(80), // Space for the floating tab bar without extra empty scroll
  },

  orb: {
    position: "absolute",
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    opacity: 0.4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(35),
    marginTop: scale(10),
  },
  greeting: { fontSize: rf(32), fontWeight: "800", letterSpacing: scale(-0.5) },
  subGreeting: { fontSize: rf(16), marginTop: scale(4), fontWeight: "500" },

  sidebarItemText: {
    fontSize: rf(16),
    fontWeight: "500",
    marginLeft: scale(16),
  },
  logoutItem: { marginTop: "auto", marginBottom: scale(40) },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(40),
  },
  sidebarTitle: {
    fontSize: rf(24),
    fontWeight: "800",
  },
  sidebarItems: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(16),
    borderRadius: scale(12),
    marginBottom: scale(8),
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "rgba(157, 80, 187, 0.1)",
    marginVertical: scale(20),
  },

  // Info Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFBFF",
    borderRadius: scale(24),
    padding: scale(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(10) },
    shadowOpacity: 0.25,
    shadowRadius: scale(15),
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(20),
  },
  modalTitle: {
    fontSize: rf(22),
    fontWeight: "800",
  },
  modalText: {
    fontSize: rf(16),
    lineHeight: scale(26),
    fontWeight: "400",
  },

  styleLabel: { fontSize: rf(13), fontWeight: "600", marginTop: scale(8) },
  styleLabelActive: { color: "#FFFFFF", fontWeight: "700" },

  // Daily Glimmer
  card: {
    width: "100%",
    minHeight: scale(170),
    borderRadius: scale(24),
    padding: scale(24),
    alignItems: "center",
    justifyContent: "center",
  },
  glimmerText: {
    fontSize: rf(16),
    color: "#333",
    lineHeight: scale(26),
    fontWeight: "400",
  },
  hopeText: {
    fontSize: rf(18),
    fontStyle: "italic",
    textAlign: "center",
    // marginBottom: scale(20),
    lineHeight: scale(26),
    color: "#622879ff",
    fontWeight: "500",
  },
  hopeBtnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    marginTop: scale(18),
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(28),
    paddingVertical: scale(6),
    borderRadius: scale(30),
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 4,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: rf(14),
    textTransform: "uppercase",
    letterSpacing: scale(1),
  },

  // Grid Cards
  grid: { flexDirection: "column" },
  gridCardMain: {
    width: "100%",
    minHeight: scale(108),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(18),
    paddingVertical: scale(14),
    borderRadius: scale(16),
  },
  cardHeader: { flex: 1, flexDirection: "row", alignItems: "center" },
  iconBadge: {
    width: scale(50),
    height: scale(50),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(18),
    // Removed backgroundColor for transparent look
  },
  cardTitle: { fontSize: rf(18), fontWeight: "700" },
  cardSubtitle: { fontSize: rf(14), marginTop: scale(2) },

  // Style Pills
  styleCard: {
    padding: scale(16),
    borderRadius: scale(20),
    alignItems: "center",
    width: scale(90),
    height: scale(110),
    justifyContent: "center",
    overflow: "hidden",
  },
  sectionContainer: { marginBottom: scale(35) },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: "700",
    marginBottom: scale(15),
    textTransform: "uppercase",
    letterSpacing: scale(1),
  },

  styleCardActive: {},
  subHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  streakBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
    borderRadius: scale(8),
    marginLeft: scale(8),
  },
  streakTextSmall: {
    textAlign: "center",
    fontWeight: "700",
    marginLeft: scale(4),
    // marginTop: scale(2),
    fontSize: rf(14),
  },
  settingsBtn: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    justifyContent: "center",
    alignItems: "center",
    marginTop: scale(-8), // Pull up to align with visual center of header text
  },

  // Sidebar Styles
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    flexDirection: "row",
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sidebarContent: {
    width: scale(280),
    height: "100%",
    padding: scale(24),
    paddingTop: scale(60),
    borderTopLeftRadius: scale(20),
    borderBottomLeftRadius: scale(20),
    backgroundColor: "#FFF", // Fallback
  },
});
