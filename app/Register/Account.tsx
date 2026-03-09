import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Welcome = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={["#FDFBFF", "#F2E6FF", "#E5CCFF"]}
      style={styles.gradient}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logoo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.subheading}>Let’s get started!</Text>
        <Text style={styles.description}>Login to Stay healthy and fit</Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/Register/Login")}
        >
          <LinearGradient
            colors={["#7D3C98", "#9B59B6"]}
            style={styles.loginGradient}
          >
            <Text style={styles.loginText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push("/Register/Signup")}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  logoContainer: {
    shadowColor: "#7D3C98",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#5E2B97",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 5,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  loginButton: {
    width: "75%",
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: "#7D3C98",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loginGradient: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  signupButton: {
    borderWidth: 1.5,
    borderColor: "#7D3C98",
    width: "75%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  signupText: {
    color: "#7D3C98",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
