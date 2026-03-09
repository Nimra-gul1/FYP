import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Gradient: Lavender -> Orchid -> Soft Pink (Matching Dashboard Exactly)
const bgGradient = ['#F3E8FF', '#D7BDE2', '#F5D5E0'];

export default function StreakScreen() {
    const router = useRouter();
    const [streak, setStreak] = useState(0);
    const [weekDays, setWeekDays] = useState<any[]>([]);

    useEffect(() => {
        loadStreak();
    }, []);

    const loadStreak = async () => {
        const email = await AsyncStorage.getItem('userEmail');
        const key = email ? `userStreak_${email}` : 'userStreak';
        const saved = await AsyncStorage.getItem(key);
        const streakVal = saved ? parseInt(saved) : 0;
        setStreak(streakVal);
        generateWeekData(streakVal);
    };

    const generateWeekData = (currentStreak: number) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayIndex = new Date().getDay(); // 0 = Sun, 6 = Sat

        const newWeek = days.map((day, index) => {
            let status = 'missed';

            // "Do not fill until streak is created" rule:
            // If streak is 0, everything is missed/empty.
            if (currentStreak > 0) {
                if (index === todayIndex) {
                    status = 'today';
                } else if (index < todayIndex && index >= todayIndex - (currentStreak - 1)) {
                    // Fill past days only if they are covered by the streak count
                    status = 'active';
                }
            }
            return { day, status };
        });
        setWeekDays(newWeek);
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

            <SafeAreaView style={{ flex: 1 }}>
                {/* Simple Confetti Decorations (Static) */}
                <View style={[styles.confetti, { top: 100, left: 40, backgroundColor: '#FFD700', transform: [{ rotate: '15deg' }] }]} />
                <View style={[styles.confetti, { top: 150, right: 60, backgroundColor: '#FF69B4', transform: [{ rotate: '-30deg' }] }]} />
                <View style={[styles.confetti, { top: 80, left: '50%', backgroundColor: '#00BFFF', transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.confetti, { top: 200, left: 20, backgroundColor: '#32CD32', transform: [{ rotate: '10deg' }] }]} />
                <View style={[styles.confetti, { top: 250, right: 30, backgroundColor: '#FF4500', transform: [{ rotate: '60deg' }] }]} />

                {/* Back Button */}
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={28} color="#4A235A" />
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Flame Circle */}
                    <View style={styles.flameContainer}>
                        <View style={styles.flameCircle}>
                            <Ionicons name="flame" size={80} color="#FF9F43" />
                        </View>
                    </View>

                    {/* Streak Count */}
                    <View style={{ alignItems: 'center', marginBottom: 40 }}>
                        <Text style={styles.streakNumber}>{streak}</Text>
                        <Text style={styles.streakLabel}>day streak!</Text>
                    </View>

                    {/* Calendar Card (Glass Effect) */}
                    <View style={styles.card}>
                        <View style={styles.weekRow}>
                            {weekDays.map((d, i) => (
                                <View key={i} style={styles.dayCol}>
                                    <Text style={styles.dayText}>{d.day}</Text>
                                    {/* Logic: Active=Red Heart, Today=Flag, Missed=Gray Heart */}
                                    {d.status === 'active' || d.status === 'today' ? (
                                        <View style={styles.filledHeart}>
                                            <Ionicons name="heart" size={18} color="#FFF" />
                                        </View>
                                    ) : (
                                        <View style={{ marginTop: 4 }}>
                                            <Ionicons name="heart" size={24} color="rgba(157, 80, 187, 0.2)" />
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

                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
                        <LinearGradient
                            colors={['#6A67CE', '#944E96']} // Matching Dashboard "Illuminate" Button
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
    container: { flex: 1 }, // BG handled by LinearGradient
    confetti: { position: 'absolute', width: 12, height: 12, borderRadius: 2, zIndex: 0, opacity: 0.8 },
    closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 20, padding: 4 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

    flameContainer: { marginBottom: 20 },
    flameCircle: {
        width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(224, 195, 252, 0.3)', // Lavender Glass
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 4, borderColor: '#E0C3FC', // Lavender Border
        shadowColor: '#9D50BB', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10
    },

    streakNumber: {
        fontSize: 90,
        fontWeight: 'bold',
        color: '#9D50BB', // Orchid
        fontStyle: 'italic',
        textShadowColor: 'rgba(157, 80, 187, 0.2)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        paddingHorizontal: 20, // Prevent Italic Clipping
        lineHeight: 110,
        textAlign: 'center'
    },
    streakLabel: { fontSize: 28, fontWeight: '600', color: '#884EA0' }, // Muted Purple

    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.65)', // Glass Effect
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        padding: 24,
        elevation: 0,
        paddingVertical: 32
    },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    dayCol: { alignItems: 'center', width: 35 },
    dayText: { color: '#6A67CE', fontSize: 13, fontWeight: '600', marginBottom: 6 },

    filledHeart: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF5252',
        justifyContent: 'center', alignItems: 'center', marginTop: 4
    },
    todayFlag: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF5252',
        justifyContent: 'center', alignItems: 'center', marginTop: 4
    },

    divider: { height: 1, backgroundColor: 'rgba(157, 80, 187, 0.1)', width: '100%', marginBottom: 15 },
    cardMessage: { textAlign: 'center', fontSize: 16, color: '#4A235A', lineHeight: 24, fontWeight: '500' },

    footer: { padding: 20, paddingBottom: 40 },
    continueBtn: {
        width: SCREEN_WIDTH - 40, paddingVertical: 18, borderRadius: 40,
        alignItems: 'center', elevation: 5, shadowColor: '#9D50BB', shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 }, shadowRadius: 8
    },
    continueText: { color: '#FFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }
});
