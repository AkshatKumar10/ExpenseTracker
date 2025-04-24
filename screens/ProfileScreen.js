import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [image, setImage] = useState(null);
  useEffect(() => {
    const loadImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('@profile_image');
        if (savedImage) {
          setImage(savedImage);
        }
      } catch (error) {
        console.error('Failed to load profile image', error);
      }
    };
    loadImage();
  }, []);
  const addImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      try {
        await AsyncStorage.setItem('@profile_image', result.assets[0].uri);
      } catch (error) {
        console.error('Failed to save profile image', error);
      }
    }
  };

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("@profile_image");
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
    ]);
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
            <TouchableOpacity onPress={addImage} activeOpacity={0.9}>
              <View className="w-14 h-14 bg-sky-500 rounded-full items-center justify-center mr-6 border border-white">
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#ffffff",
                    }}
                  />
                ) : (
                  <Text className="text-white text-xl font-bold">
                    {user?.displayName?.charAt(0).toUpperCase()}
                  </Text>
                )}
                <View className="absolute -right-1 -bottom-1 bg-black rounded-full p-1">
                  <TouchableOpacity onPress={addImage}>
                    <AntDesign name="camera" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-semibold">
                {user?.displayName}
              </Text>
              <Text className="text-gray-400 text-sm">{user?.email}</Text>
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
