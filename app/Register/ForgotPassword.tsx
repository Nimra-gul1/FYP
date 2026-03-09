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
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Success", "Password reset instructions sent to your email!");
      router.push("/Register/Login");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
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
    paddingHorizontal: 10,
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  formContainer: { paddingHorizontal: 30 },
  title: { fontSize: 32, fontWeight: "900", color: "#4A235A", textAlign: "center", marginBottom: 15 },
  subtitle: { fontSize: 16, color: "#884EA0", textAlign: "center", marginBottom: 35, lineHeight: 22, fontWeight: "500" },
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
  button: {
    width: "100%",
    borderRadius: 14,
    marginTop: 10,
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: { borderRadius: 14, paddingVertical: 18, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  footerLink: { marginTop: 35, alignItems: "center" },
  footerText: { fontSize: 14, color: "#884EA0", fontWeight: "600" },
  footerLinkBold: { color: "#4A235A", fontWeight: "800" },
});
