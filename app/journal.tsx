import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './utils/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showToast } from './components/ThemedToast';
import { rf, scale, wp, hp } from './utils/responsive';

import { MOOD_THEMES, MoodTheme } from '../constants/MoodThemes';

type JournalEntry = {
  _id: string;
  text: string;
  date: string;
  emoji: string;
};

const EMOTIONS = ['😊', '😐', '😔', '😂', '🥰', '😡'];

const PASTEL_COLORS = [
  '#F5D5E0', // Pale Pink
  '#E0C3FC', // Med Lavender
  '#F3E8FF', // Soft Lavender
  '#F8D7DA', // Soft Red/Pink
  '#E9DCF1', // Light Lavender
  '#F5E1E9', // Blush
];

export default function JournalScreen() {
  const router = useRouter();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [userName, setUserName] = useState('My');
  const [streak, setStreak] = useState(0);
  const [streakDates, setStreakDates] = useState<string[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>(MOOD_THEMES[0]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadEntries();
      fetchStreak();
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

  const dynamicStyles = {
    premiumTitle: [styles.premiumTitle, { color: currentTheme.textDark }],
    streakNum: [styles.streakNum, { color: currentTheme.textDark }],
    dayText: [styles.dayText, { color: currentTheme.textDark, opacity: 0.7 }],
    sectionHeading: [styles.sectionHeading, { color: currentTheme.textDark, opacity: 0.5 }],
  };

  const last7Days = React.useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        dateString: d.toDateString(),
        label: ['S','M','T','W','T','F','S'][d.getDay()],
      });
    }
    return days;
  }, []);

  const fetchStreak = async () => {
    try {
      const localToday = new Date().toDateString();
      const res = await apiFetch(`/api/journal/streak?clientDate=${encodeURIComponent(localToday)}`);
      if (res.ok) {
        const data = await res.json();
        const currentStreak = data.currentStreak || 0;
        const activeDates = data.activeDates || [];
        setStreak(currentStreak);

        // Local Streak Calculation
        const sDates: string[] = [];
        const todayStr = new Date().toDateString();
        const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

        if (activeDates.includes(todayStr) || activeDates.includes(yesterdayStr)) {
            let streakPointer = activeDates.includes(todayStr) ? new Date() : new Date(Date.now() - 86400000);
            for (let s = 0; s < currentStreak; s++) {
                sDates.push(streakPointer.toDateString());
                streakPointer.setDate(streakPointer.getDate() - 1);
            }
        }
        setStreakDates(sDates);
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching streak:", err);
    }
  };

  const loadData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (e) {
      console.error("Failed to load user data", e);
    }
  };

  // 🔹 LOAD FROM MONGODB
  const loadEntries = async () => {
    try {
      const res = await apiFetch('/api/journal/get');
      if (res.ok) {
        const data = await res.json();
        console.log("[Journal] Fetched entries count:", Array.isArray(data) ? data.length : 0);
        if (Array.isArray(data)) {
          setEntries(data);
        }
      }
    } catch (err) {
      console.error("[Journal] Error fetching entries:", err);
    }
  };

  // 🔹 SAVE / UPDATE
  const saveEntry = async () => {
  if (!newText.trim()) {
    Alert.alert('Please write something.');
    return;
  }

  const url = editingEntry
    ? `/api/journal/update/${editingEntry._id}`
    : `/api/journal/save`;

  const method = editingEntry ? 'PUT' : 'POST';

  try {
    const res = await apiFetch(url, {
      method,
      body: JSON.stringify({
        text: newText,
        emoji: selectedEmoji,
        date: new Date().toDateString(),
      }),
    });

    if (res.ok) {
      await loadEntries();  // 🔹 first reload entries
      await fetchStreak();  // 🔹 then reload streak
      resetForm();          // 🔹 then clear form
      showToast(editingEntry ? 'Memory Updated' : 'Memory Illuminated', 'success');
    } else {
      showToast('Backend connection lost', 'error');
    }

  } catch (err) {
    showToast('Failed to save memory', 'error');
  }
};


  // 🔹 DELETE (Trigger Modal)
  const deleteEntry = (id: string) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      const res = await apiFetch(`/api/journal/delete/${entryToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadEntries();
        setDeleteModalVisible(false);
        setEntryToDelete(null);
        showToast('Memory Deleted', 'success');
      } else {
        showToast('Server error during deletion', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Deletion failed', 'error');
    }
  };


  const resetForm = () => {
    setNewText('');
    setSelectedEmoji('😊');
    setEditingEntry(null);
    setIsCreating(false);
    setSearchQuery(''); // Reset search when switching modes
  };

  const filteredEntries = entries.filter(e =>
    e.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 CREATE / EDIT MODE
  if (isCreating) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={currentTheme.colors as any} style={styles.container}>
          {/* Subtle Header */}
          <View style={styles.createHeader}>
            <TouchableOpacity onPress={resetForm} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={currentTheme.primary} />
            </TouchableOpacity>
            <Text style={styles.createTitle}>
              {editingEntry ? 'Edit Thoughts' : 'New Thought'}
            </Text>
            <TouchableOpacity onPress={saveEntry} style={styles.closeBtn}>
              <Ionicons name="checkmark" size={24} color={currentTheme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.createContent}>
            <View style={styles.glassCard}>
              <View style={styles.cardHeaderSmall}>
                <Text style={styles.cardDateText}>{new Date().toDateString()}</Text>
                <View style={styles.dot} />
                <Text style={styles.cardGoalText}>Daily Reflection</Text>
              </View>

              <Text style={styles.questionText}>How is your heart feeling today?</Text>

              {/* Emoji/Mood Row */}
              <View style={styles.emojiBubbleRow}>
                {EMOTIONS.map(e => (
                  <TouchableOpacity
                    key={e}
                    onPress={() => {
                      setNewText(prev => (prev.trim() === '' ? e + ' ' : prev + ' ' + e));
                    }}
                    style={styles.emojiBubble}
                  >
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputDivider} />

              {/* Premium Text Input */}
              <TextInput
                style={styles.premiumInput}
                multiline
                placeholder="Start typing your heart out..."
                placeholderTextColor="#AAA"
                value={newText}
                onChangeText={setNewText}
                scrollEnabled={true}
                textAlignVertical="top"
                autoFocus
              />
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  // 🔹 LIST MODE
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={currentTheme.colors as any} style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <FlatList
          data={filteredEntries || []}
          extraData={entries}
          style={{ flex: 1 }}
          keyExtractor={item => item._id}
          ListHeaderComponent={() => (
            <View style={{ paddingBottom: 20 }}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={26} color={currentTheme.textDark} />
                </TouchableOpacity>
                <Text style={dynamicStyles.premiumTitle}>{userName}'s Journal</Text>
                <View style={{ width: 26 }} />
              </View>

              {/* Streak Card */}
              <View style={styles.streakCard}>
                <View style={styles.streakInfo}>
                  <Text style={dynamicStyles.streakNum}>{streak}</Text>
                  <Text style={styles.streakLabel}>STREAK</Text>
                </View>
                <View style={styles.weekRow}>
                  {last7Days.map((day, i) => {
                    const isPartOfStreak = streakDates.includes(day.dateString);
                    return (
                      <View key={day.dateString + i} style={styles.dayContainer}>
                        <View style={[styles.dayIcon, isPartOfStreak ? styles.dayIconActive : null]}>
                          <Ionicons 
                            name="flame" 
                            size={18} 
                            color={isPartOfStreak ? "#E91E63" : "#C0C0C0"} 
                          />
                        </View>
                        <Text style={dynamicStyles.dayText}>{day.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={{ marginTop: 25, marginBottom: 10 }}>
                <Text style={dynamicStyles.sectionHeading}>TODAY</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          renderItem={({ item, index }) => {
            const backgroundColor = PASTEL_COLORS[index % PASTEL_COLORS.length] || '#FFF';
            const itemDate = item.date;
            const prevItemDate = index > 0 ? filteredEntries[index - 1].date : null;
            const showHeader = itemDate !== prevItemDate;

            return (
              <View style={{ marginBottom: 15 }}>
                {showHeader && (
                  <Text style={[styles.sectionHeading, { marginVertical: 15, textTransform: 'uppercase' }]}>
                    {itemDate === new Date().toDateString() ? 'TODAY' : itemDate}
                  </Text>
                )}
                
                <TouchableOpacity
                  style={[styles.premiumEntry, { backgroundColor }]}
                  onPress={() => {
                    setEditingEntry(item);
                    setNewText(item.text);
                    setSelectedEmoji(item.emoji);
                    setIsCreating(true);
                  }}
                  onLongPress={() => deleteEntry(item._id)}
                >
                  <Text style={styles.entryText}>{item.text}</Text>
                  {item.emoji && (
                    <Text style={styles.entryEmoji}>{item.emoji}</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ color: '#6A67CE', fontSize: 16, fontWeight: '600' }}>
                Your journal is empty.
              </Text>
              <Text style={{ color: '#AAA', marginTop: 10 }}>
                Tap "Write Entry" to begin!
              </Text>
            </View>
          )}
        />

        {/* Floating "Write Entry" Pill Button */}
        <TouchableOpacity
          style={styles.pillFabContainer}
          onPress={() => setIsCreating(true)}
        >
          <LinearGradient
            colors={['#E91E63', '#F06292']}
            style={styles.pillFab}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="pencil" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.pillFabText}>Write Entry</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Premium Delete Confirmation Modal */}
        <Modal
          transparent
          visible={deleteModalVisible}
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.themedModal}>
              <View style={styles.modalIconBg}>
                <Ionicons name="trash-outline" size={32} color="#E91E63" />
              </View>
              <Text style={styles.modalTitle}>Delete Memory?</Text>
              <Text style={styles.modalSubtitle}>
                This will permanently remove this thought from your journal. This action cannot be undone.
              </Text>
              
              <View style={styles.modalActionRow}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Keep it</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={confirmDelete}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E91E63', '#F06292']}
                    style={styles.modalDeleteBtn}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.modalDeleteText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: scale(20),
    paddingHorizontal: 0,
    alignItems: 'center',
    marginBottom: scale(20),
  },
  premiumTitle: {
    fontSize: rf(28),
    fontWeight: '800',
    fontFamily: 'serif',
  },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    padding: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    shadowOffset: { width: 0, height: scale(2) },
  },
  streakInfo: {
    alignItems: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderColor: '#F0F0F0',
  },
  streakNum: {
    fontSize: rf(32),
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: rf(10),
    color: '#999',
    fontWeight: '700',
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(5),
  },
  dayIconActive: {
    backgroundColor: '#FFEEF2',
  },
  dayText: {
    fontSize: rf(12),
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: rf(12),
    fontWeight: '800',
    letterSpacing: scale(1.2),
  },
  premiumEntry: {
    borderRadius: scale(20),
    padding: scale(24),
    minHeight: scale(120),
  },
  entryText: {
    fontSize: rf(18),
    color: '#4A235A',
    fontWeight: '500',
    lineHeight: scale(26),
  },
  entryEmoji: {
    position: 'absolute',
    right: scale(15),
    bottom: scale(15),
    fontSize: rf(22),
  },
  pillFabContainer: {
    position: 'absolute',
    right: scale(20),
    bottom: scale(30),
    elevation: 8,
    shadowColor: '#E91E63',
    shadowOpacity: 0.3,
    shadowRadius: scale(10),
    shadowOffset: { width: 0, height: scale(5) },
  },
  pillFab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(25),
    paddingVertical: scale(15),
    borderRadius: scale(30),
  },
  pillFabText: {
    color: '#fff',
    fontSize: rf(16),
    fontWeight: '800',
  },
  // New Create/Edit Mode Styles
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
    marginBottom: scale(20),
  },
  closeBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createTitle: {
    fontSize: rf(20),
    fontWeight: '800',
    color: '#4A235A',
    fontFamily: 'serif',
  },
  createContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: scale(30),
    padding: scale(25),
    minHeight: '70%',
    shadowColor: '#6A67CE',
    shadowOpacity: 0.1,
    shadowRadius: scale(15),
    shadowOffset: { width: 0, height: scale(10) },
    elevation: 5,
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardDateText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
  },
  dot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: '#CCC',
    marginHorizontal: scale(8),
  },
  cardGoalText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: '#6A67CE',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: rf(22),
    fontWeight: '800',
    color: '#333',
    marginBottom: scale(20),
    lineHeight: scale(30),
  },
  emojiBubbleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  emojiBubble: {
    width: scale(45),
    height: scale(45),
    borderRadius: scale(22.5),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: scale(20),
  },
  premiumInput: {
    flex: 1,
    fontSize: rf(18),
    color: '#4A235A',
    lineHeight: scale(28),
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: rf(16),
    fontWeight: '800',
    letterSpacing: scale(0.5),
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  themedModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: scale(30),
    padding: scale(30),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: scale(20),
  },
  modalIconBg: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    backgroundColor: '#FFEEF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  modalTitle: {
    fontSize: rf(22),
    fontWeight: '800',
    color: '#333',
    fontFamily: 'serif',
    marginBottom: scale(12),
  },
  modalSubtitle: {
    fontSize: rf(15),
    color: '#666',
    textAlign: 'center',
    lineHeight: scale(22),
    marginBottom: scale(30),
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(15),
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: scale(16),
    borderRadius: scale(20),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: rf(16),
    fontWeight: '700',
    color: '#666',
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    paddingHorizontal: scale(40),
    paddingVertical: scale(16),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: rf(16),
    fontWeight: '800',
    color: '#FFF',
  },
});
