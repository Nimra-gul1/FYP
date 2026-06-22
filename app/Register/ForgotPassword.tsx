import { showToast } from "../components/ThemedToast";
import { Ionicons } from "@expo/vector-icons";
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
import { rf, scale, wp, hp } from "../utils/responsive";

const { width } = Dimensions.get("window");

const ForgotPassword = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState("");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Request failed");
        showToast("Reset link sent!", "success");
        router.push("/Register/Login");
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error. Please try again later.");
      }
    } catch (err: any) {
      showToast(err.message || "Connection error", "error");
    }
  };

  return (
    <LinearGradient colors={["#F3E8FF", "#F5D5E0", "#E0C3FC"]} style={styles.mainContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.contentContainer}>
          {/* Back Button Trigger */}
          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => router.push("/Register/Login" as any)}
          >
            <Ionicons name="arrow-back" size={28} color="#4A235A" />
          </TouchableOpacity>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive reset instructions.
            </Text>

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

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} activeOpacity={0.8}>
              <LinearGradient colors={["#9D50BB", "#6E48AA"]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.buttonText}>Send Reset Link</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/Register/Login" as any)} style={styles.footerLink}>
              <Text style={styles.footerText}>
                Back to <Text style={styles.footerLinkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: scale(10),
  },
  floatingBackButton: {
    position: "absolute",
    top: scale(50),
    left: scale(20),
    width: scale(44),
    height: scale(44),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  formContainer: { paddingHorizontal: scale(30) },
  title: { fontSize: rf(32), fontWeight: "900", color: "#4A235A", textAlign: "center", marginBottom: scale(15) },
  subtitle: { fontSize: rf(16), color: "#884EA0", textAlign: "center", marginBottom: scale(35), lineHeight: scale(22), fontWeight: "500" },
  inputWrapper: { marginBottom: scale(20) },
  inputLabel: { fontSize: rf(14), fontWeight: "700", color: "#4A235A", marginBottom: scale(8), marginLeft: scale(5) },
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
  button: {
    width: "100%",
    borderRadius: scale(14),
    marginTop: scale(10),
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },
  buttonGradient: { borderRadius: scale(14), paddingVertical: scale(18), alignItems: "center" },
  buttonText: { color: "#fff", fontSize: rf(18), fontWeight: "800" },
  footerLink: { marginTop: scale(35), alignItems: "center" },
  footerText: { fontSize: rf(14), color: "#884EA0", fontWeight: "600" },
  footerLinkBold: { color: "#4A235A", fontWeight: "800" },
});
