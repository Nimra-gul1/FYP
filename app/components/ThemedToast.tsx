import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { rf, scale, wp, hp } from '../utils/responsive';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
}

export const Toast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  useImperativeHandle(ref, () => ({
    show: (msg: string, t: ToastType = 'success') => {
      setMessage(msg);
      setType(t);
      setVisible(true);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: scale(20),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          hide();
        }, 3000);
      });
    },
  }));

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  const isError = type === 'error';
  const colors = isError ? ['#FF4B2B', '#FF416C'] : ['#6A67CE', '#944E96'];
  const icon = isError ? 'alert-circle' : 'checkmark-circle';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toast}
      >
        <Ionicons name={icon} size={scale(22)} color="#FFF" />
        <Text style={styles.text}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
});

// Helper for global access
let toastRef: any;
export const setToastRef = (ref: any) => {
  toastRef = ref;
};

export const showToast = (message: string, type: ToastType = 'success') => {
  if (toastRef) {
    toastRef.show(message, type);
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: scale(40),
    left: scale(20),
    right: scale(20),
    zIndex: 9999,
  },
  toast: {
    paddingVertical: scale(14),
    paddingHorizontal: scale(20),
    borderRadius: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 8,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 10,
    textAlign: 'center',
  },
});
