import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOOD_THEMES, MoodTheme } from '../constants/MoodThemes';
import { rf, scale } from './utils/responsive';
import { showToast } from './components/ThemedToast';

export default function CustomizeScreen() {
    const router = useRouter();
    const [selectedThemeId, setSelectedThemeId] = useState('lavender');

    useEffect(() => {
        const loadTheme = async () => {
            const saved = await AsyncStorage.getItem('appTheme');
            if (saved) setSelectedThemeId(saved);
        };
        loadTheme();
    }, []);

    const handleThemeSelect = async (theme: MoodTheme) => {
        try {
            setSelectedThemeId(theme.id);
            await AsyncStorage.setItem('appTheme', theme.id);
            showToast(`${theme.label} applied!`, 'success');
        } catch (e) {
            console.error(e);
        }
    };

    const currentTheme = MOOD_THEMES.find(t => t.id === selectedThemeId) || MOOD_THEMES[0];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={currentTheme.colors as any}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={scale(24)} color={currentTheme.textDark} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.title, { color: currentTheme.textDark }]}>App Style</Text>
                    </View>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.subtitle, { color: currentTheme.textDark }]}>Choose a palette that matches your heart's current weather.</Text>

                    <View style={styles.themesGrid}>
                        {MOOD_THEMES.map((theme) => {
                            const isSelected = selectedThemeId === theme.id;
                            return (
                                <TouchableOpacity
                                    key={theme.id}
                                    activeOpacity={0.9}
                                    onPress={() => handleThemeSelect(theme)}
                                    style={[
                                        styles.themeCard,
                                        isSelected && { borderColor: '#FFFFFF' }
                                    ]}
                                >
                                    <LinearGradient
                                        colors={theme.colors as any}
                                        style={styles.cardGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.cardInfo}>
                                            <Text style={[styles.themeLabel, { color: theme.textDark }]}>{theme.label}</Text>
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={scale(24)} color={theme.primary} />
                                            )}
                                        </View>
                                        
                                        <View style={styles.previewRow}>
                                            <View style={[styles.circle, { backgroundColor: theme.primary }]} />
                                            <View style={[styles.circle, { backgroundColor: theme.accent, marginLeft: scale(-10) }]} />
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    
                    <View style={styles.infoBox}>
                         <Ionicons name="information-circle-outline" size={20} color={currentTheme.textDark} style={{opacity: 0.6}} />
                         <Text style={[styles.infoText, { color: currentTheme.textDark }]}>These colors will be applied to your Dashboard, Journal, and Streaks.</Text>
                    </View>
                </ScrollView>


            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        height: scale(80),
    },
    backButton: {
        width: scale(46),
        height: scale(46),
        borderRadius: scale(23),
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginLeft: scale(-46), // Offset back button width for perfect centering
    },
    title: { fontSize: rf(24), fontWeight: '800' },
    scrollContent: { paddingHorizontal: scale(24), paddingTop: scale(10), paddingBottom: scale(30) },
    subtitle: { fontSize: rf(15), fontWeight: '500', opacity: 0.8, marginBottom: scale(40), lineHeight: scale(22), textAlign: 'center' },
    themesGrid: { gap: scale(25) },
    themeCard: {
        height: scale(120),
        borderRadius: scale(25),
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        borderWidth: scale(3),
        borderColor: 'transparent', // Keep layout stable to prevent blanking
    },
    cardGradient: { flex: 1, padding: scale(22), justifyContent: 'space-between' },
    cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    themeLabel: { fontSize: rf(18), fontWeight: '700' },
    previewRow: { flexDirection: 'row' },
    circle: { width: scale(35), height: scale(35), borderRadius: scale(17.5), borderWidth: 2, borderColor: '#FFF' },
    infoBox: { flexDirection: 'row', marginTop: scale(40), opacity: 0.7, alignItems: 'center', paddingHorizontal: scale(10) },
    infoText: { fontSize: rf(13), marginLeft: scale(10), flex: 1 },

});
