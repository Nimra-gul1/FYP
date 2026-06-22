import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from './utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rf, scale, wp, hp } from './utils/responsive';

import { MOOD_THEMES, MoodTheme } from '../constants/MoodThemes';

export default function StreakScreen() {
    const router = useRouter();
    const [streak, setStreak] = useState(0);
    const [weekDays, setWeekDays] = useState<any[]>([]);
    const [currentTheme, setCurrentTheme] = useState<MoodTheme>(MOOD_THEMES[0]);

    useFocusEffect(
        useCallback(() => {
            loadStreakData();
            loadTheme();
        }, [])
    );

    const loadTheme = async () => {
        const saved = await AsyncStorage.getItem('appTheme');
        if (saved) {
            const theme = MOOD_THEMES.find(t => t.id === saved);
            if (theme) setCurrentTheme(theme);
        }
    };

    const loadStreakData = async () => {
        try {
            const localToday = new Date().toDateString();
            const res = await apiFetch(`/api/journal/streak?clientDate=${encodeURIComponent(localToday)}`);
            if (res.ok) {
                const data = await res.json();
                const currentStreak = data.currentStreak || 0;
                setStreak(currentStreak);

                const activeDates = data.activeDates || [];
                const days = [];
                const today = new Date();

                const streakDatesSet = new Set<string>();
                if (activeDates.includes(today.toDateString()) || activeDates.includes(new Date(today.getTime() - 86400000).toDateString())) {
                   let streakPointer = activeDates.includes(today.toDateString()) ? new Date(today) : new Date(today.getTime() - 86400000);
                   for (let s = 0; s < currentStreak; s++) {
                       streakDatesSet.add(streakPointer.toDateString());
                       streakPointer.setDate(streakPointer.getDate() - 1);
                   }
                }

                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    const dateStr = d.toDateString();
                    days.push({
                        dateString: dateStr,
                        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
                        status: streakDatesSet.has(dateStr) ? 'active' : 'missed'
                    });
                }
                setWeekDays(days);
            }
        } catch (err) {
            console.error("Failed to fetch streak:", err);
        }
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

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close" size={scale(24)} color="#4A235A" />
                    </TouchableOpacity>
                </View>

                {/* Main Centered Content */}
                <View style={styles.mainContent}>
                    {/* Flame */}
                    <View style={styles.flameCircle}>
                        <Ionicons name="flame" size={scale(70)} color="#FF9F43" />
                    </View>

                    {/* Count */}
                    <View style={styles.streakInfo}>
                        <Text style={styles.streakNumber}>{streak}</Text>
                        <Text style={styles.streakLabel}>day streak!</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <View style={styles.weekRow}>
                            {weekDays.map((d) => (
                                <View key={d.day} style={styles.dayCol}>
                                    <Text style={styles.dayText}>{d.day}</Text>
                                    {d.status === 'active' ? (
                                        <View style={styles.filledHeart}>
                                            <Ionicons name="heart" size={scale(16)} color="#FFF" />
                                        </View>
                                    ) : (
                                        <View style={styles.emptyHeart}>
                                            <Ionicons name="heart" size={scale(22)} color="rgba(157, 80, 187, 0.15)" />
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                        <View style={styles.divider} />
                        <Text style={styles.cardMessage}>
                            You're building a powerful habit. Don't stop. 🔥
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
                        <LinearGradient
                            colors={['#6A67CE', '#944E96']}
                            style={styles.continueBtn}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.continueText}>Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: hp(8), justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: scale(20) },
    closeBtn: { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: scale(20), padding: scale(6) },

    mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(20) },
    
    flameCircle: {
        width: scale(100), height: scale(100), borderRadius: scale(50), backgroundColor: 'rgba(224, 195, 252, 0.25)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#E0C3FC',
        marginBottom: scale(12),
        shadowColor: '#FF9F43', shadowOpacity: 0.2, shadowRadius: scale(10), elevation: 5
    },

    streakInfo: { alignItems: 'center', marginBottom: scale(15) },
    streakNumber: { fontSize: rf(70), fontWeight: 'bold', color: '#9D50BB', fontStyle: 'italic', lineHeight: scale(100), paddingHorizontal: scale(35), textAlign: 'center', includeFontPadding: false },
    streakLabel: { fontSize: rf(22), fontWeight: '600', color: '#884EA0', marginTop: scale(-5) },

    card: {
        width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: scale(24),
        padding: scale(18), paddingVertical: scale(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
        marginBottom: scale(12)
    },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(15) },
    dayCol: { alignItems: 'center', width: (wp(100) - scale(80)) / 7 },
    dayText: { color: '#6A67CE', fontSize: rf(12), fontWeight: '600', marginBottom: scale(6) },
    filledHeart: { width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: '#FF5252', justifyContent: 'center', alignItems: 'center' },
    emptyHeart: { marginTop: scale(2) },

    divider: { height: 1, backgroundColor: 'rgba(157, 80, 187, 0.1)', width: '100%', marginBottom: scale(15) },
    cardMessage: { textAlign: 'center', fontSize: rf(15), color: '#4A235A', lineHeight: scale(22), fontWeight: '500' },

    footer: { paddingHorizontal: scale(20), paddingBottom: scale(55) },
    continueBtn: { 
        width: '70%', alignSelf: 'center', paddingVertical: scale(11), borderRadius: scale(35), 
        alignItems: 'center', shadowColor: '#9D50BB', shadowOpacity: 0.25, 
        shadowOffset: { width: 0, height: scale(4) }, shadowRadius: scale(6), elevation: 6
    },
    continueText: { color: '#FFF', fontSize: rf(17), fontWeight: '800', letterSpacing: 0.5 }
});
