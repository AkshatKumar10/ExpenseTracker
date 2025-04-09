import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 px-4 pt-12">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-white text-3xl font-bold">Profile</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-neutral-800 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-sky-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xl font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View>
              <Text className="text-white text-xl font-semibold">
                {user?.displayName || "User"}
              </Text>
              <Text className="text-gray-400 text-sm">{user?.email || "No email"}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500 rounded-xl py-4 items-center justify-center"
        >
          <Text className="text-white text-xl font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}