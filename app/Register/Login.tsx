import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";



const { width, height } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_BASE;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;
const GOOGLE_IS_CONFIGURED = Boolean(
  GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID
);

const GoogleIcon = ({ size = 30 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <Path fill="none" d="M0 0h48v48H0z" />
  </Svg>
);

const Login = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        throw new Error("No ID Token found");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Play services not available or outdated");
      } else {
        Alert.alert("Google Login Error", error.message);
      }
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      console.log("hitting backend api")
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
    
      if (!res.ok) throw new Error(data.message);

      await AsyncStorage.setItem("token", data.token);
      if (data.user) {
        await AsyncStorage.setItem("userName", data.user.name || "User");
        await AsyncStorage.setItem("userEmail", data.user.email || "");
      }
      await AsyncStorage.setItem("needsGreeting", "true"); // Trigger fresh greeting on chat mount

      // Greeting handled by Chatbot screen on mount
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Google Login Failed", err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("userEmail", email);
      if (data.user?.name) {
        await AsyncStorage.setItem("userName", data.user.name);
      }
      await AsyncStorage.setItem("needsGreeting", "true"); // Trigger fresh greeting on chat mount

      // Greeting handled by Chatbot screen on mount
      Alert.alert("Success", "Login successful!");
      router.push("/(tabs)");
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("Login failed", err.message);
      } else {
        Alert.alert("Login failed", "Something went wrong");
      }
    }
  };

  return (
    <LinearGradient colors={["#F3E8FF", "#F5D5E0", "#E0C3FC"]} style={styles.mainContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => router.push("/Register/index" as any)}
          />

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <Text style={styles.loginTitle}>Login</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="Qalbify@gmail.com"
                placeholderTextColor="#A9A9A9"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push("/Register/ForgotPassword" as any)}>
                <Text style={styles.forgotText}>Forget Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
              <LinearGradient colors={["#9D50BB", "#6E48AA"]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.buttonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.socialContainer}>
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.socialText}>Or sign in with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialIconsRow}>
                <TouchableOpacity
                  style={styles.socialIconBtn}
                  onPress={async () => {
                    await AsyncStorage.setItem("userName", "Phone User");
                    await AsyncStorage.setItem("userEmail", "phone@qalbify.com");
                    router.push("/(tabs)");
                  }}
                >
                  <Ionicons name="call-outline" size={24} color="#6A67CE" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconBtn}
                  onPress={() => {
                    if (!GOOGLE_IS_CONFIGURED) {
                      Alert.alert(
                        "Google Login Not Configured",
                        "Set EXPO_PUBLIC_GOOGLE_CLIENT_ID and platform-specific Google client IDs in .env, then restart Expo."
                      );
                      return;
                    }
                    signIn();
                  }}
                  disabled={!GOOGLE_IS_CONFIGURED}
                >
                  <GoogleIcon size={30} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => router.push("/Register/Signup" as any)} style={styles.footerLink}>
              <Text style={styles.footerText}>
                Don't have an account? <Text style={styles.footerLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 140,
    paddingHorizontal: 10,
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 60,
    height: 60,
    zIndex: 100,
  },
  formContainer: { paddingHorizontal: 30, marginTop: 30 },
  loginTitle: { fontSize: 36, fontWeight: "900", color: "#4A235A", textAlign: "center", marginBottom: 35 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "700", color: "#4A235A", marginBottom: 8, marginLeft: 5 },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#4A235A",
    borderWidth: 1,
    borderColor: "rgba(157, 80, 187, 0.2)",
  },
  forgotBtn: { alignSelf: "flex-end", marginTop: 8 },
  forgotText: { fontSize: 13, color: "#999", fontWeight: "600" },
  button: {
    width: "100%",
    borderRadius: 14,
    marginTop: 25,
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: { borderRadius: 14, paddingVertical: 18, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  socialContainer: { marginTop: 35, alignItems: "center" },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 25 },
  divider: { flex: 1, height: 1, backgroundColor: "#EEE" },
  socialText: { marginHorizontal: 10, fontSize: 13, color: "#884EA0", fontWeight: "600" },
  socialIconsRow: { flexDirection: "row", justifyContent: "center" },
  socialIconBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(157, 80, 187, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  footerLink: { marginTop: 40, alignItems: "center", marginBottom: 20 },
  footerText: { fontSize: 14, color: "#884EA0", fontWeight: "600" },
  footerLinkBold: { color: "#4A235A", fontWeight: "800" },
});
