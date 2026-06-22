import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { rf, scale } from "../utils/responsive";

export default function Home() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.push("/Register/Login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: rf(16) }}>Welcome to Home Page 🎉</Text>
      <TouchableOpacity onPress={logout}>
        <Text style={{ color: "purple", marginTop: scale(20), fontSize: rf(16) }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
