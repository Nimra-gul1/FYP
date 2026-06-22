import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rf, scale } from './utils/responsive';

const PRE_SPLASH_DURATION = 1200;

export default function Screen1logo() {
  const router = useRouter();
  const logoY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    Animated.parallel([
      Animated.timing(logoY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    const routeFromSavedSession = async () => {
      const token = await AsyncStorage.getItem('token');
      const nextRoute = token ? '/(tabs)' : '/Splashscreens/Screen1';

      if (!isMounted) return;
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace(nextRoute as any);
      });
    };

    const timeout = setTimeout(() => {
      routeFromSavedSession();
    }, PRE_SPLASH_DURATION);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [logoY, opacity, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.inner}>
        <Animated.View
          style={{
            transform: [{ translateY: logoY }],
            opacity,
            alignItems: 'center',
            marginBottom: scale(24),
          }}
        >
          <Image
            source={require('../assets/images/logoo.png')}
            style={{ width: scale(140), height: scale(140) }}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View
          style={{ opacity, alignItems: 'center', marginTop: scale(12) }}
        >
          <ActivityIndicator size="small" />
          <Text
            style={{ marginTop: scale(6), fontSize: rf(12), color: '#444' }}
          >
            Loading...
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: scale(60),
  },
});
