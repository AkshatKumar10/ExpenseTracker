import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as Contacts from "expo-contacts";
import { AntDesign } from "@expo/vector-icons";
import NavBar from "../components/Navbar";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";

export default function AddMembersScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const alreadySelected = route.params?.selectedMembers || [];

  const currentUser = auth.currentUser;
  const currentUserData = {
    id: currentUser?.uid || "current-user",
    name: currentUser?.displayName || "User",
  };

  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(alreadySelected);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isPhoneNumber = (str) => {
    if (!str) return true;
    const trimmedStr = str.trim();
    const phoneNumberPattern = /^\+?\d[\d\s-]*$/;
    return phoneNumberPattern.test(trimmedStr) || trimmedStr === "";
  };

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name],
        });

        if (data.length > 0) {
          const cleanedContacts = data
            .filter((contact) => contact.name && !isPhoneNumber(contact.name))
            .map((contact) => ({
              id: contact.id,
              name: contact.name,
            }));
          setContacts(cleanedContacts);
        }
      }
      setLoading(false);
    })();
  }, []);

  const filteredContacts = contacts
    .filter((contact) => contact.id !== currentUserData.id)
    .filter((contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleSelect = (contact) => {
    const exists = selectedContacts.find((c) => c.id === contact.id);
    if (exists) {
      setSelectedContacts((prev) => prev.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts((prev) => [...prev, contact]);
    }
  };

  const handleDone = () => {
    navigation.navigate("CreateGroup", {
      selectedMembers: selectedContacts,
      groupName: route.params?.groupName,
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#38bdf8" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <NavBar />
      <View className="flex-1 px-6">
        <Text className="text-white text-2xl font-bold mb-4 mt-6">
          Select Group Members
        </Text>

        <View className="bg-[#808080] rounded-lg mb-4 p-2">
          <TextInput
            placeholder="Search contacts..."
            placeholderTextColor="#ffffff"
            className="text-white p-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor="#ffffff"
          />
        </View>

        <View className="bg-gray-800 flex-row justify-between items-center p-4 rounded-lg mb-2">
          <Text className="text-white text-lg">{currentUserData.name}</Text>
          <Text className="text-gray-400">(Group creator)</Text>
        </View>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => `contact-${item.id}`}
          renderItem={({ item }) => {
            const isSelected = selectedContacts.some((c) => c.id === item.id);
            return (
              <TouchableOpacity
                onPress={() => toggleSelect(item)}
                className={`flex-row justify-between items-center p-4 rounded-lg mb-2 ${
                  isSelected ? "bg-blue-500" : "bg-gray-800"
                }`}
              >
                <Text className="text-white text-lg">{item.name}</Text>
                {isSelected && (
                  <AntDesign name="checkcircle" size={24} color="white" />
                )}
              </TouchableOpacity>
            );
          }}
        />

        {selectedContacts.length > 0 && (
          <TouchableOpacity
            onPress={handleDone}
            className="bg-blue-500 py-4 rounded-xl mt-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              Add {selectedContacts.length} Members
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}