import { apiFetch } from "../utils/api";
import { showToast } from "../components/ThemedToast";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
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
import { rf, scale, wp, hp } from "../utils/responsive";

const { width, height } = Dimensions.get("window");
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;
const GOOGLE_IS_CONFIGURED = Boolean(
  GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID,
);

const GoogleIcon = ({ size = 30 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <Path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <Path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <Path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <Path fill="none" d="M0 0h48v48H0z" />
  </Svg>
);

const Login = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    try {
      if (GoogleSignin) {
        GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
          offlineAccess: true,
        });
      }
    } catch (error) {
      console.warn("GoogleSignin not available:", error);
    }
  }, []);

  const signIn = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      if (!GoogleSignin || typeof GoogleSignin.hasPlayServices !== "function") {
        throw new Error(
          "Google Sign-in is not supported in this environment (e.g. Expo Go). Please use a Development Build.",
        );
      }
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken ?? (userInfo as any)?.idToken;
      if (idToken) {
        await handleGoogleLogin(idToken);
      } else {
        throw new Error("No ID Token found");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast("Play services not available", "error");
      } else {
        showToast("Google Login Not Available", "error");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const res = await apiFetch("/api/auth/google-login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      console.log(data, "data")
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
      showToast(err.message || "Google Login Failed", "error");
    }
  };

  const handleLogin = async () => {
    if (authLoading) return;
    try {
      if (!email || !password) {
        showToast("Please fill all fields", "error");
        return;
      }
      setAuthLoading(true);
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
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
      showToast("Login successful!", "success");
      router.replace("/(tabs)");
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Something went wrong", "error");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#F3E8FF", "#F5D5E0", "#E0C3FC"]}
      style={styles.mainContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
                placeholder="********"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push("/Register/ForgotPassword" as any)}
              >
                <Text style={styles.forgotText}>Forget Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, authLoading && styles.disabledButton]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={authLoading}
            >
              <LinearGradient
                colors={["#9D50BB", "#6E48AA"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {authLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
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
                  onPress={() => {
                    if (!GOOGLE_IS_CONFIGURED) {
                      showToast("Google Login Not Configured", "error");
                      return;
                    }
                    signIn();
                  }}
                  disabled={!GOOGLE_IS_CONFIGURED || authLoading}
                >
                  <GoogleIcon size={30} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/Register/Signup" as any)}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Don't have an account?{" "}
                <Text style={styles.footerLinkBold}>Sign Up</Text>
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
    paddingTop: scale(140),
    paddingHorizontal: scale(10),
  },
  floatingBackButton: {
    position: "absolute",
    top: scale(50),
    left: scale(20),
    width: scale(60),
    height: scale(60),
    zIndex: 100,
  },
  formContainer: { paddingHorizontal: scale(30), marginTop: scale(30) },
  loginTitle: {
    fontSize: rf(36),
    fontWeight: "900",
    color: "#4A235A",
    textAlign: "center",
    marginBottom: scale(35),
  },
  inputWrapper: { marginBottom: scale(20) },
  inputLabel: {
    fontSize: rf(14),
    fontWeight: "700",
    color: "#4A235A",
    marginBottom: scale(8),
    marginLeft: scale(5),
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    fontSize: rf(16),
    color: "#4A235A",
    borderWidth: 1,
    borderColor: "rgba(157, 80, 187, 0.2)",
  },
  forgotBtn: { alignSelf: "flex-end", marginTop: scale(8) },
  forgotText: { fontSize: rf(13), color: "#999", fontWeight: "600" },
  button: {
    width: "100%",
    borderRadius: scale(14),
    marginTop: scale(25),
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },
  disabledButton: { opacity: 0.75 },
  buttonGradient: {
    borderRadius: scale(14),
    paddingVertical: scale(18),
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: rf(18), fontWeight: "800" },
  socialContainer: { marginTop: scale(35), alignItems: "center" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: scale(25),
  },
  divider: { flex: 1, height: 1, backgroundColor: "#EEE" },
  socialText: {
    marginHorizontal: scale(10),
    fontSize: rf(13),
    color: "#884EA0",
    fontWeight: "600",
  },
  socialIconsRow: { flexDirection: "row", justifyContent: "center" },
  socialIconBtn: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    borderWidth: 1,
    borderColor: "rgba(157, 80, 187, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: scale(10),
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  footerLink: {
    marginTop: scale(40),
    alignItems: "center",
    marginBottom: scale(20),
  },
  footerText: { fontSize: rf(14), color: "#884EA0", fontWeight: "600" },
  footerLinkBold: { color: "#4A235A", fontWeight: "800" },
});
