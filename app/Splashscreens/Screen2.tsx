import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Screen2 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/SplashAI.png")}
        style={styles.image1}
        resizeMode="contain"
      />
      {/* Title */}
      <Text style={styles.title}>Connect & Find Calm</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Engage in compassionate conversations with our AI companion, offering
        guidance and Qur’anic support tailored to your feelings
      </Text>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.buttonWrap}
          onPress={() => router.push("/Register/Account")}
        >
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonWrap}
          onPress={() => router.push("/Register/Account")}
        >
          <Text style={styles.next}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Screen2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 25,
    paddingTop: 0,
  },
  image1: {
    width: "110%",
    height: 510,
    marginBottom: 30,
    marginTop: -40,
    alignSelf: "center",
    resizeMode: "cover",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#5E2B97",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 25,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#7D3C98",
  },
  dotInactive: {
    backgroundColor: "#D8BFD8",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 5,
    marginBottom: 10,
    marginTop: 10,
  },

  buttonWrap: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },

  skip: {
    color: "#7D3C98",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },

  next: {
    color: "#7D3C98",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
});
