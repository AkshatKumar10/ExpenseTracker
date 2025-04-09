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
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

export default function SignInScreen() {
  const width = Dimensions.get("window").width;
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("Home");
    } catch (error) {
      let errorMessage = "An error occurred during sign in";
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email format";
          break;
        case "auth/user-not-found":
          errorMessage = "No user found with this email. Please sign up first.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts, please try again later";
          break;
      }
      Alert.alert("Sign In Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first");
      return;
    }
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length === 0) {
        Alert.alert(
          "Email Not Found",
          "This email is not registered. Please sign up first."
        );
        return;
      }
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset Email Sent",
        `A password reset link has been sent to ${email}. Please check your inbox.`
      );
    } catch (error) {
      let errorMessage = "Failed to send password reset email";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-4xl text-white font-bold mb-10">Sign In</Text>
          <View style={{ width: width - 40 }} className="mt-4 mb-10">
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
              className="bg-white rounded-xl py-4 px-4 mb-2 text-lg"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={loading}
              className="mb-4"
            >
              <Text className="text-sky-400 text-right text-base">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`bg-sky-400 rounded-xl items-center justify-center py-4 mb-4 ${
                loading ? "opacity-50" : ""
              }`}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text className="text-white text-xl font-bold">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center gap-1">
              <Text className="text-sky-400 text-center text-lg">
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignUp")}
                disabled={loading}
              >
                <Text className="text-white text-center text-lg">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
