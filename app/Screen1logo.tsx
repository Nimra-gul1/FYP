import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const PRE_SPLASH_DURATION = 1200; // milliseconds

export default function Screen1logo() {
  const router = useRouter(); // ✅ useRouter for expo-router
  const logoY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide + fade in animation for logo
    Animated.parallel([
      Animated.timing(logoY, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();

    // Navigate to Screen1 after delay
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        router.replace('/Splashscreens/Screen1'); // ✅ expo-router syntax
      });
    }, PRE_SPLASH_DURATION);

    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.inner}>
        <Animated.View style={{ transform: [{ translateY: logoY }], opacity, alignItems: 'center', marginBottom: 24 }}>
          <Image
  source={require('../assets/images/logoo.png')}  // 👈 correct
  style={{ width: 140, height: 140 }}
  resizeMode="contain"
/>
        </Animated.View>
        <Animated.View style={{ opacity, alignItems: 'center', marginTop: 12 }}>
          <ActivityIndicator size="small" />
          <Text style={{ marginTop: 6, fontSize: 12, color: '#444' }}>Loading...</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 60 },
});
