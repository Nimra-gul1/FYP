import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

// SOOTHING PASTEL MOON PALETTE
const COLORS = {
  bgLight: '#F3E8FF', // Soft Lavender
  bgMid: '#F5D5E0',   // Pale Pink
  bgDark: '#E0C3FC',  // Med Lavender
  primary: '#9D50BB', // Soft Orchid
  accent: '#6E48AA',  // Deep Lavender
  textDark: '#4A235A', // Deep Purple Text
  textDim: '#884EA0',  // Muted Purple
  white: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.75)'
};

// Gradient: Lavender -> Orchid -> Soft Pink (Balanced)
const bgGradient = ['#F3E8FF', '#D7BDE2', '#F5D5E0'];

// Glass Style (Clean Transparency - No Shadow Artifacts)
const lightGlassStyle = (opacity = 0) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  borderWidth: 0,
  // Removed elevation/shadows to prevent "white box" artifacts on Android
  elevation: 0,
  shadowOpacity: 0
});

const COMFORT_STYLES = [
  { id: 'gentle', label: 'Gentle', icon: 'flower-outline', color: '#ff9ff3' },
  { id: 'motivational', label: 'Push', icon: 'flame-outline', color: '#ff9f43' },
  { id: 'spiritual', label: 'Spirit', icon: 'moon-outline', color: '#54a0ff' },
  { id: 'silent', label: 'Silent', icon: 'volume-mute-outline', color: '#a29bfe' },
];

const HOPE_MESSAGES = [
  "Even small rest counts today.",
  "You are more than your productivity.",
  "Breathe. You're doing enough.",
  "Propel yourself forward, gently.",
  "Your pace is the right pace."
];

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation();
  const [streak, setStreak] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('gentle');
  const [hopeMessage, setHopeMessage] = useState('');
  const [userName, setUserName] = useState('Friend');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Toggle Tab Bar visibility when Sidebar opens/closes
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isSettingsOpen
        ? { display: 'none' }
        : {
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 35,
          height: 75,
          borderWidth: 0,
          paddingBottom: 0,
          shadowColor: '#9D50BB',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }
    });
  }, [isSettingsOpen]);

  const loadData = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) setUserEmail(email);

      const streakKey = email ? `userStreak_${email}` : 'userStreak';
      const styleKey = email ? `comfortStyle_${email}` : 'comfortStyle';

      const savedStreak = await AsyncStorage.getItem(streakKey);
      setStreak(savedStreak ? parseInt(savedStreak) : 1);

      const savedStyle = await AsyncStorage.getItem(styleKey);
      if (savedStyle) setSelectedStyle(savedStyle);

      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);

    } catch (e) {
      console.error("Failed to load dashboard data", e);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace('Register/Login' as any);
  };

  const handleStyleSelect = async (styleId: string) => {
    setSelectedStyle(styleId);
    const email = await AsyncStorage.getItem('userEmail');
    const styleKey = email ? `comfortStyle_${email}` : 'comfortStyle';
    await AsyncStorage.setItem(styleKey, styleId);
  };

  const generateMicroHope = () => {
    const randomMsg = HOPE_MESSAGES[Math.floor(Math.random() * HOPE_MESSAGES.length)];
    setHopeMessage(randomMsg);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgGradient as any}
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
          <View style={[styles.sidebarContent, { backgroundColor: '#F3E8FF' }]}>
            <View style={styles.sidebarHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../../assets/luna.png')} style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: COLORS.primary }} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textDark }}>Account</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textDim }}>{userEmail || "Loading..."}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarItems}>
              <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/journal')}>
                <Ionicons name="book" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Journal Entry</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/progress')}>
                <Ionicons name="stats-chart" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Emotional Journey</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Ionicons name="color-palette" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Colors and style</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Ionicons name="notifications" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Reminder</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Ionicons name="star" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Rate and review</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Ionicons name="share-social" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Recommend to a friend</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Ionicons name="chatbox-ellipses" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Ionicons name="information-circle" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>About</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
                <Text style={styles.sidebarItemText}>Privacy Policy</Text>
              </TouchableOpacity>

              <View style={styles.sidebarDivider} />
              <TouchableOpacity style={[styles.sidebarItem, styles.logoutItem]} onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color="#FF5252" />
                <Text style={[styles.sidebarItemText, { color: '#FF5252' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Ambient Blobs for aesthetic */}
      <View style={[styles.orb, { top: -100, right: -80, backgroundColor: '#A4B0F5' }]} />
      <View style={[styles.orb, { bottom: 50, left: -100, backgroundColor: '#FFE4E1' }]} />

      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: 'transparent' }}
        >


          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hi, {userName}</Text>
              <View style={styles.subHeaderRow}>
                <Text style={styles.subGreeting}>A fresh start, every moment.</Text>
                <TouchableOpacity
                  onPress={() => router.push('/streak')}
                  activeOpacity={0.8}
                  style={[styles.streakBadgeSmall, lightGlassStyle(0.6)]}
                >
                  <Ionicons name="flame" size={14} color="#FF8A65" />
                  <Text style={styles.streakTextSmall}>{streak}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsSettingsOpen(true)}
              activeOpacity={0.8}
              style={[styles.settingsBtn, lightGlassStyle(0.8)]}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* 1. Daily Glimmer */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Daily Glimmer</Text>
            <View style={[styles.card, lightGlassStyle(0.35)]}>
              <Text style={styles.hopeText}>
                "{hopeMessage || "Tap for a gentle thought..."}"
              </Text>
              <TouchableOpacity
                onPress={generateMicroHope}
                activeOpacity={0.8}
                style={styles.hopeBtnContainer}
              >
                <LinearGradient
                  colors={['#6A67CE', '#944E96']} // Slate Blue -> Deep Orchid (Matches Image)
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.actionBtnText}>
                    {hopeMessage ? "New One" : "Illuminate"}
                  </Text>
                  <Ionicons name="sparkles" size={16} color="#FFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Quick Access Cards */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Explore</Text>
            <View style={styles.grid}>
              {/* Chatbot Card */}
              <TouchableOpacity
                onPress={() => router.push('/chatbot')}
                activeOpacity={0.9}
                style={[styles.gridCardMain, lightGlassStyle(0.35)]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="chatbubbles" size={28} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Chatbot</Text>
                    <Text style={styles.cardSubtitle}>Your safe space</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} style={{ opacity: 0.6 }} />
              </TouchableOpacity>

              {/* Progress Card */}
              <TouchableOpacity
                onPress={() => router.push('/progress')}
                activeOpacity={0.9}
                style={[styles.gridCardMain, lightGlassStyle(0.35), { marginTop: 12 }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="stats-chart" size={28} color="#54a0ff" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>My Journey</Text>
                    <Text style={styles.cardSubtitle}>Track your flow</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} style={{ opacity: 0.6 }} />
              </TouchableOpacity>

              {/* Journal Card */}
              <TouchableOpacity
                onPress={() => router.push('/journal')}
                activeOpacity={0.9}
                style={[styles.gridCardMain, lightGlassStyle(0.35), { marginTop: 12 }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="book" size={28} color="#9D50BB" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>My Journal</Text>
                    <Text style={styles.cardSubtitle}>Write your thoughts</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Personalization */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Vibe Check</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
              {COMFORT_STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  onPress={() => handleStyleSelect(style.id)}
                  activeOpacity={0.9}
                  style={{ marginRight: 12 }}
                >
                  <View style={[
                    styles.styleCard,
                    lightGlassStyle(0.4),
                    selectedStyle === style.id && styles.styleCardActive
                  ]}>
                    <Ionicons
                      name={style.icon as any}
                      size={26}
                      color={selectedStyle === style.id ? COLORS.white : style.color}
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={[
                      styles.styleLabel,
                      selectedStyle === style.id && styles.styleLabelActive
                    ]}>
                      {style.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />

        </ScrollView>
      </SafeAreaView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 24 },

  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
    filter: 'blur(60px)', // Web only
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    marginTop: 10
  },
  greeting: { fontSize: 32, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.5 },
  subGreeting: { fontSize: 16, color: COLORS.textDim, marginTop: 4, fontWeight: '500' },

  styleLabel: { fontSize: 13, color: COLORS.textDim, fontWeight: '600', marginTop: 8 },
  styleLabelActive: { color: COLORS.white, fontWeight: '700' },

  // Daily Glimmer
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    alignItems: 'center',
  },
  hopeText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    color: COLORS.textDark,
    marginBottom: 20,
    lineHeight: 28,
    fontWeight: '500'
  },
  hopeBtnContainer: { width: '100%', alignItems: 'center' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  actionBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },

  // Grid Cards
  grid: { flexDirection: 'column' },
  gridCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18
    // Removed backgroundColor for transparent look
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  cardSubtitle: { fontSize: 14, color: COLORS.textDim, marginTop: 2 },

  // Style Pills
  styleCard: {
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    width: 90,
    height: 110,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sectionContainer: { marginBottom: 35 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  styleCardActive: {
    backgroundColor: COLORS.primary,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  streakTextSmall: { fontWeight: '700', color: COLORS.textDark, marginLeft: 4, fontSize: 13 },
  settingsBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },

  // Sidebar Styles
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sidebarContent: {
    width: 280,
    height: '100%',
    padding: 24,
    paddingTop: 60,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: '#FFF', // Fallback
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sidebarItems: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 16,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: 'rgba(157, 80, 187, 0.1)',
    marginVertical: 20,
  },
  logoutItem: {
    marginTop: 'auto',
    marginBottom: 40,
  },
});
