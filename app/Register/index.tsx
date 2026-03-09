import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.push("/Register/Login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to Home Page 🎉</Text>
      <TouchableOpacity onPress={logout}>
        <Text style={{ color: "purple", marginTop: 20 }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
