import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
  ScrollView,
} from "react-native";
import { useGroupStore } from "../store/groupStore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { nanoid } from "nanoid/non-secure";
import NavBar from "../components/Navbar";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { auth } from "../firebase";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const { addGroup } = useGroupStore();
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedMembers, setSelectedMembers] = useState([]);

  const currentUser = auth.currentUser;
  const currentUserData = {
    id: currentUser?.uid || "current-user",
    name: currentUser?.displayName || "User",
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      const groupId = nanoid();
      addGroup({
        id: groupId,
        name: groupName,
        balance: 0,
        members: [
          currentUserData,
          ...selectedMembers.map((m) => ({
            id: m.id,
            name: m.name,
          })),
        ],
        expenses: [],
      });
      Keyboard.dismiss();
      navigation.navigate("Home", { groupId });
    }
  };

  useEffect(() => {
    if (route.params?.selectedMembers) {
      setSelectedMembers(route.params.selectedMembers);
    }
    if (route.params?.groupName) {
      setGroupName(route.params.groupName);
    }
  }, [route.params]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <NavBar />
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="text-white text-3xl font-bold mb-2">
              New Group
            </Text>
            <Text className="text-gray-400">
              Add members and set up your group
            </Text>
          </View>
          <View className="mb-6">
            <Text className="text-white text-lg font-medium mb-2">
              Group Name
            </Text>
            <TextInput
              placeholder="Enter group name"
              placeholderTextColor="#6b7280"
              value={groupName}
              onChangeText={setGroupName}
              className="bg-gray-800 text-white rounded-xl p-4 text-lg"
            />
          </View>
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-medium">
                Members ({selectedMembers.length + 1})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.navigate("AddMembers", {
                    selectedMembers,
                    groupName,
                  });
                }}
                className="flex-row items-center"
              >
                <Feather name="edit-2" size={18} color="#3b82f6" />
                <Text className="text-blue-400 ml-1">
                  {selectedMembers.length > 0 ? "Edit" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center py-3 border-b border-gray-700">
                <View className="w-10 h-10 bg-gray-600 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold text-lg">
                    {currentUserData.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white">{currentUserData.name}</Text>
                </View>
                <Text className="text-gray-400 text-sm">You</Text>
              </View>

              <FlatList
                data={selectedMembers}
                scrollEnabled={false}
                keyExtractor={(item) => `member-${item.id}`}
                renderItem={({ item }) => (
                  <View className="flex-row items-center py-3 border-b border-gray-700 last:border-b-0">
                    <View className="w-10 h-10 bg-gray-600 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-bold text-lg">
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white">{item.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedMembers(selectedMembers.filter((m) => m.id !== item.id))
                      }
                    >
                      <Ionicons name="close" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6 pt-2 bg-black">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className={`py-4 rounded-xl items-center ${
              !groupName.trim() || selectedMembers.length === 0
                ? "bg-gray-600"
                : "bg-sky-500"
            }`}
          >
            <Text className="text-xl font-bold text-white">Create Group</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}