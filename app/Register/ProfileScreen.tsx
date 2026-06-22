import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { rf, scale, wp, hp } from "../utils/responsive";

// Demo preset avatars (update paths as needed)
const presetAvatars = [
  require("../../assets/wallpapers/pf_1.jpg"),
  require("../../assets/wallpapers/2.jpg"),
  require("../../assets/wallpapers/3.jpg"),
  require("../../assets/wallpapers/4.jpg"),
  require("../../assets/wallpapers/5.jpg"),
  require("../../assets/wallpapers/6.jpg"),
];

const genderOptions = ["Female", "Male", "Other"];
type RootStackParamList = {
  ProfileScreen: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Account: undefined;
  Journal: undefined;
  Chatbot: undefined;
  Screen1: undefined;
  Screen2: undefined;
  _layout: undefined;
  Modal: undefined;
  Index: undefined;
};
type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ProfileScreen">;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  // Profile info states
  const [avatar, setAvatar] = useState(presetAvatars[0]);
  const [name, setName] = useState("NMS");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(genderOptions[0]);
  const [bio, setBio] = useState(
    "Be kind to your heart. 🌙 Qalbify companion user",
  );

  // Edit modal states
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAge, setEditAge] = useState(age);
  const [editGender, setEditGender] = useState(gender);
  const [editBio, setEditBio] = useState(bio);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Avatar picker from gallery
  const pickAvatarFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission needed to access your gallery!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setAvatar({ uri: result.assets[0].uri });
      setShowAvatarPicker(false);
    }
  };

  // Save edits
  const saveEdit = () => {
    setName(editName);
    setAge(editAge);
    setGender(editGender);
    setBio(editBio);
    setShowEdit(false);
  };

  const handleLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <LinearGradient
      colors={["#fcf7ff", "#f7eaff", "#e8c2ff", "#cdaaff"]}
      style={styles.profileContainer}
    >
      <View style={styles.profileCard}>
        <View style={styles.profileAvatarGlow} />
        <TouchableOpacity
          onPress={() => setShowAvatarPicker(true)}
          activeOpacity={0.84}
        >
          <Image source={avatar} style={styles.profileAvatar} />
        </TouchableOpacity>
        <Text style={styles.profileName}>
          {name}, {age ? age : "--"}
        </Text>
        <Text style={styles.profileGender}>{gender}</Text>
        <Text style={styles.profileBio}>{bio}</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            setEditName(name);
            setEditAge(age);
            setEditGender(gender);
            setEditBio(bio);
            setShowEdit(true);
          }}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal visible={showEdit} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.profileCard,
              { paddingTop: scale(36), minWidth: scale(300) },
            ]}
          >
            <Text style={styles.profileName}>Edit Profile</Text>

            <TextInput
              style={[styles.input, { textAlign: "center", marginTop: 13 }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              placeholderTextColor="#8d44ff99"
            />

            <TextInput
              style={[styles.input, { textAlign: "center", marginTop: 10 }]}
              value={editAge}
              onChangeText={setEditAge}
              placeholder="Age"
              placeholderTextColor="#8d44ff99"
              keyboardType="numeric"
              maxLength={3}
            />

            {/* Gender Picker */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 13,
              }}
            >
              {genderOptions.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setEditGender(g)}
                  style={[
                    styles.genderBtn,
                    editGender === g && styles.genderBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.genderText,
                      editGender === g && styles.genderTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.input,
                { textAlign: "center", marginTop: 11, minHeight: 80 },
              ]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Bio"
              placeholderTextColor="#8d44ff99"
              multiline
            />

            <TouchableOpacity style={styles.editBtn} onPress={saveEdit}>
              <Text style={styles.editBtnText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowEdit(false)}
            >
              <Text style={styles.logoutBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal – Carousel of preset avatars & gallery */}
      <Modal visible={showAvatarPicker} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.profileCard,
              {
                minWidth: scale(310),
                alignItems: "center",
                paddingTop: scale(27),
              },
            ]}
          >
            <Text style={[styles.profileName, { fontSize: rf(22) }]}>
              Choose Avatar
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginVertical: 18, gap: 14 }}
            >
              {presetAvatars.map((a, i) => (
                <TouchableOpacity
                  key={`avatar-${i}`}
                  style={styles.avatarOption}
                  onPress={() => {
                    setAvatar(a);
                    setShowAvatarPicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={a} style={styles.avatarOptionImg} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.avatarOption}
                onPress={pickAvatarFromGallery}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.avatarOptionImg,
                    {
                      backgroundColor: "#e487ff",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 23, fontWeight: "bold" }}
                  >
                    +
                  </Text>
                </View>
                <Text
                  style={{
                    color: "#8d44ff",
                    fontSize: 10,
                    marginTop: 0,
                    fontWeight: "bold",
                  }}
                >
                  Gallery
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowAvatarPicker(false)}
            >
              <Text style={styles.logoutBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: scale(28),
    backgroundColor: "#F3E8FF",
  },
  profileCard: {
    width: "94%",
    padding: scale(24),
    borderRadius: scale(26),
    backgroundColor: "rgba(235,220,255,0.87)",
    shadowColor: "#e487ff",
    shadowOpacity: 0.23,
    shadowRadius: scale(20),
    elevation: 15,
    alignItems: "center",
    marginBottom: scale(13),
  },
  profileAvatarGlow: {
    position: "absolute",
    top: scale(-8),
    left: "50%",
    transform: [{ translateX: scale(-56) }],
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: "rgba(141,68,255,0.28)",
    zIndex: 0,
    shadowColor: "#e487ff",
    shadowRadius: scale(28),
    elevation: 12,
  },
  profileAvatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 4,
    borderColor: "#e487ff",
    backgroundColor: "rgba(228,135,255,0.27)",
    zIndex: 1,
  },
  profileName: {
    fontSize: rf(30),
    fontWeight: "bold",
    color: "#8d44ff",
    fontFamily: "Poppins",
    marginTop: scale(18),
    textShadowColor: "#cdaaff",
    textShadowRadius: scale(9),
    textAlign: "center",
  },
  profileGender: {
    fontSize: rf(13.5),
    color: "#e487ff",
    fontFamily: "Poppins",
    marginTop: scale(2),
    textAlign: "center",
    fontWeight: "600",
    opacity: 0.88,
    letterSpacing: scale(0.8),
  },
  profileBio: {
    marginTop: scale(7),
    fontSize: rf(16),
    color: "#29004b",
    fontFamily: "Roboto",
    opacity: 0.79,
    textAlign: "center",
    paddingHorizontal: scale(22),
  },
  editBtn: {
    marginTop: scale(21),
    paddingVertical: scale(13),
    paddingHorizontal: scale(27),
    backgroundColor: "#e487ff",
    borderRadius: scale(17),
    shadowColor: "#8d44ff",
    shadowRadius: scale(11),
    elevation: 6,
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins",
    fontSize: rf(16),
  },
  logoutBtn: {
    marginTop: scale(13),
    paddingVertical: scale(12),
    paddingHorizontal: scale(26),
    backgroundColor: "#8d44ff",
    borderRadius: scale(15),
    shadowColor: "#e487ff",
    shadowRadius: scale(8),
    elevation: 5,
  },
  logoutBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins",
    fontSize: rf(15),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(45,0,70,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderRadius: scale(13),
    paddingHorizontal: scale(13),
    paddingVertical: scale(10),
    backgroundColor: "rgba(255,255,255,0.84)",
    fontSize: rf(16),
    fontFamily: "Roboto",
    color: "#29004b",
    borderWidth: 1,
    borderColor: "#e487ff",
    marginBottom: scale(4),
  },
  closeBtn: {
    marginTop: scale(14),
    backgroundColor: "#b477ff",
    padding: scale(10),
    alignItems: "center",
    borderRadius: scale(10),
    borderWidth: 1.3,
    borderColor: "#e487ff",
    shadowColor: "#e487ff",
    shadowRadius: scale(5),
    elevation: 2,
  },
  // Avatar picker
  avatarOption: {
    marginHorizontal: scale(4),
    marginBottom: scale(6),
    borderRadius: scale(32),
    borderWidth: 2.5,
    borderColor: "#e487ff",
    shadowColor: "#cdaaff",
    shadowOpacity: 0.22,
    shadowRadius: scale(9),
    elevation: 4,
    alignItems: "center",
    backgroundColor: "#faf8fc",
  },
  avatarOptionImg: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    borderWidth: 1.1,
    borderColor: "#e487ff",
    resizeMode: "cover",
    marginBottom: scale(2),
  },
  // Gender selector
  genderBtn: {
    paddingVertical: scale(7),
    paddingHorizontal: scale(17),
    borderRadius: scale(14),
    backgroundColor: "rgba(228,135,255,0.19)",
    marginHorizontal: scale(6),
    borderWidth: 1.2,
    borderColor: "#e487ff",
  },
  genderBtnActive: {
    backgroundColor: "#e487ff",
    borderColor: "#8d44ff",
  },
  genderText: {
    fontSize: rf(14.5),
    color: "#8d44ff",
    fontFamily: "Poppins",
    fontWeight: "700",
  },
  genderTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
