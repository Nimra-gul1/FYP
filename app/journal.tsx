import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const bgGradient: readonly [string, string, string] = ['#F3E8FF', '#D7BDE2', '#F5D5E0'];

type JournalEntry = {
  _id: string;
  text: string;
  date: string;
  emoji: string;
};

const EMOTIONS = ['😊', '😐', '😔', '😂', '🥰', '😡'];

export default function JournalScreen() {
  const router = useRouter();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  // 🔹 LOAD FROM MONGODB
  const loadEntries = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/journal/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 SAVE / UPDATE
  const saveEntry = async () => {
  if (!newText.trim()) {
    Alert.alert('Please write something.');
    return;
  }

  const token = await AsyncStorage.getItem('token');
  if (!token) return;

  const url = editingEntry
    ? `${API_BASE}/api/journal/update/${editingEntry._id}` // ensure backend has this route
    : `${API_BASE}/api/journal/save`;

  const method = editingEntry ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: newText,
        emoji: selectedEmoji,
        date: new Date().toDateString(),
      }),
    });

    await loadEntries();  // 🔹 first reload entries
    resetForm();          // 🔹 then clear form
    Alert.alert('Success', editingEntry ? 'Entry updated' : 'Entry saved');

  } catch (err) {
    Alert.alert('Error', 'Failed to save entry');
  }
};


  // 🔹 DELETE
const deleteEntry = (id: string) => {
  Alert.alert('Delete entry?', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error('No token found');

          // Use the correct route: /delete/:id
          const res = await fetch(`${API_BASE}/api/journal/delete/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();
          console.log('Delete response:', data);

          if (!res.ok) throw new Error(data.message || 'Failed to delete entry');

          // Refresh the entries after deletion
          await loadEntries();

          Alert.alert('Deleted', 'Entry successfully deleted');
        } catch (err: any) {
          console.error(err);
          Alert.alert('Error', err.message || 'Failed to delete entry');
        }
      },
    },
  ]);
};


  const resetForm = () => {
    setNewText('');
    setSelectedEmoji('😊');
    setEditingEntry(null);
    setIsCreating(false);
  };

  const filteredEntries = entries.filter(e =>
    e.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 CREATE / EDIT MODE
if (isCreating) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={bgGradient} style={styles.container}>
        {/* Top bar with back and save */}
        <View style={styles.header}>
          <TouchableOpacity onPress={resetForm}>
            <Ionicons name="arrow-back" size={26} color="#4A235A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingEntry ? 'Edit Entry' : 'New Entry'}
          </Text>
          <TouchableOpacity onPress={saveEntry}>
            <Ionicons name="checkmark" size={26} color="#4A235A" />
          </TouchableOpacity>
        </View>

        {/* Card with date, question, emojis */}
        <View style={styles.card}>
          <Text style={styles.date}>{new Date().toDateString()}</Text>
          <Text style={{ fontWeight: '900', marginTop:10, marginBottom: 10 }}>
            How do you feel today?
          </Text>

          {/* Emoji row */}
          <View style={styles.emojiRow}>
            {EMOTIONS.map(e => (
              <TouchableOpacity
                key={e}
                onPress={() => {
                  // Append emoji to text input only
                  setNewText(prev => (prev.trim() === '' ? e + ' ' : prev + ' ' + e));
                }}
                style={styles.emojiBtn} // no selected highlight
              >
                <Text style={{ fontSize: 24 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text input */}
   <TextInput
  style={styles.input}
  multiline
  placeholder="Write here..."
  value={newText}
  onChangeText={setNewText}
  scrollEnabled={true}        // ✅ allows scrolling inside the box
  textAlignVertical="top"     // ✅ text starts at top
/>


        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
  // 🔹 LIST MODE
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={bgGradient} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#4A235A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Journal</Text>
          <View style={{ width: 26 }} />
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={filteredEntries}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const expanded = expandedIds.includes(item._id);
            return (
              <TouchableOpacity
                style={styles.entry}
                onPress={() =>
                  setExpandedIds(prev =>
                    prev.includes(item._id)
                      ? prev.filter(id => id !== item._id)
                      : [...prev, item._id]
                  )
                }
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.date}>{item.date}</Text>
                  <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                </View>

                <Text numberOfLines={expanded ? undefined : 3}>
                  {item.text}
                </Text>

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingEntry(item);
                      setNewText(item.text);
                      setSelectedEmoji(item.emoji);
                      setIsCreating(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={22} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteEntry(item._id)}>
                    <MaterialIcons name="delete" size={22} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsCreating(true)}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#4A235A' },
  search: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  emojiRow: { flexDirection: 'row', marginBottom: 15 },
  emojiBtn: { padding: 8, marginRight: 10 },
  emojiSelected: { backgroundColor: '#E0C3FC', borderRadius: 10 },
  input: {
  height: 220,   
  fontSize: 16,
  borderWidth: 1,           // ✅ makes the border visible
  borderColor: '#6A67CE',   // purple border
  borderRadius: 12,         // rounded corners
  padding: 12,              // inner padding
  backgroundColor: '#fff',  // white so it stands out
  textAlignVertical: 'top', // makes multiline start at top
},
  entry: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: { fontWeight: '500', color: '#6A67CE' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#6A67CE',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
