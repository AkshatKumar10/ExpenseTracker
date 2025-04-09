import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function SignUpScreen() {
  const width = Dimensions.get("window").width;
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      navigation.navigate("SignIn");
    } catch (error) {
      let errorMessage = "An error occurred  occurred during sign up";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters";
          break;
      }
      Alert.alert("Sign Up Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-4xl text-white font-bold mb-10">Sign Up</Text>
          <View style={{ width: width - 40 }} className="mt-4 mb-10">
            <TextInput
              className="bg-white rounded-xl py-4 px-4 mb-4 text-lg"
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
            <TextInput
              className="bg-white rounded-xl py-4 px-4 mb-4 text-lg"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <TextInput
              className="bg-white rounded-xl py-4 px-4 mb-6 text-lg"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <TouchableOpacity
              className={`bg-sky-400 rounded-xl items-center justify-center py-4 mb-4 ${
                loading ? "opacity-50" : ""
              }`}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text className="text-white text-xl font-bold">
                {loading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>
            <View className="flex-row justify-center gap-1">
              <Text className="text-sky-400 text-center text-lg">
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignIn")}
                disabled={loading}
              >
                <Text className="text-white text-center text-lg">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}