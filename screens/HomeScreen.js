import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  BackHandler,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../store/groupStore";
import * as Haptics from "expo-haptics";
import AntDesign from "@expo/vector-icons/AntDesign";
import { auth } from "../firebase";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { groups, deleteGroup, getUserTotalBalance, getUserGroupBalances } =
    useGroupStore();

  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName || "User";

  const totalBalance = getUserTotalBalance(userName);
  const groupBalances = getUserGroupBalances(userName);

  const totalOwed = groupBalances
    .filter((g) => g.balance < 0)
    .reduce((sum, g) => sum + g.balance, 0);

  const totalReceivable = groupBalances
    .filter((g) => g.balance > 0)
    .reduce((sum, g) => sum + g.balance, 0);

  const groupsWithBalances = groups.map((group) => {
    const balanceInfo = groupBalances.find((g) => g.groupId === group.id);
    return {
      ...group,
      balance: balanceInfo ? balanceInfo.balance : 0,
    };
  });

  const handleDeleteGroup = (groupId, groupName) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${groupName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteGroup(groupId);
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
    const onBackPress = () => {
      Alert.alert(
        "Exit App",
        "Are you sure you want to exit?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => BackHandler.exitApp(),
          },
        ]
      );
      return true;
    };
  
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
  
    return () => backHandler.remove();
  }, [])
);

  const renderGroupItem = ({ item }) => {
    const previewMembers = item.members?.slice(0, 3) || [];
    const remainingMembers = item.members?.length - 3;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("GroupDetail", { groupId: item.id })}
        onLongPress={() => handleDeleteGroup(item.id, item.name)}
        activeOpacity={0.7}
        className="bg-neutral-800 rounded-xl p-4 mb-4"
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-white text-xl font-semibold flex-1">
            {item.name}
          </Text>
          <Text className="text-gray-400 ml-2">
            {item.members?.length || 0} member
            {item.members?.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <Text
          className={`mt-2 text-lg ${
            item.balance < 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          {item.balance < 0
            ? `You owe ₹${Math.abs(item.balance).toFixed(2)}`
            : `You get ₹${item.balance.toFixed(2)}`}
        </Text>
        {item.members?.length > 0 && (
          <View className="mt-3">
            <Text className="text-gray-400 text-base mb-1">Members:</Text>
            <View className="flex-row flex-wrap">
              {previewMembers.map((member) => (
                <View
                  key={member.id}
                  className="bg-neutral-700 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
                >
                  <View className="w-8 h-8 bg-gray-500 rounded-full mr-1 items-center justify-center">
                    <Text className="text-white text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-white text-sm">
                    {member.name.split(" ")[0]}
                  </Text>
                </View>
              ))}
              {remainingMembers > 0 && (
                <View className="bg-neutral-700 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-white text-base">
                    +{remainingMembers} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black pt-12 px-4">
      <StatusBar barStyle="light-content" />
      <View className="mb-8">
        <Text className="text-sky-400 text-2xl font-semibold mb-2">
          Welcome back, {userName}!
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-3xl font-bold">Your Groups</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => navigation.navigate("Summary")}
              className="mr-4"
            >
              <AntDesign name="barschart" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <AntDesign name="user" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="bg-neutral-900 rounded-xl p-4 mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg text-gray-300">Net Balance</Text>
          <AntDesign
            name={totalBalance < 0 ? "arrowdown" : "arrowup"}
            size={20}
            color={totalBalance < 0 ? "#ef4444" : "#4ade80"}
          />
        </View>
        <View className="flex-row items-end">
          <Text
            className={`text-3xl font-bold ${
              totalBalance < 0 ? "text-red-500" : "text-green-400"
            }`}
          >
            {totalBalance < 0
              ? `-₹${Math.abs(totalBalance).toFixed(2)}`
              : `+₹${totalBalance.toFixed(2)}`}
          </Text>
          <Text className="text-gray-400 text-sm ml-2 mb-1">
            {totalBalance < 0 ? "you owe" : "you'll receive"}
          </Text>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-gray-400 text-base">Total Owed</Text>
            <Text className="text-red-400 font-bold">
              ₹{Math.abs(totalOwed).toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 pl-2">
            <Text className="text-gray-400 text-base">Total Receivable</Text>
            <Text className="text-green-400 font-bold">
              ₹{totalReceivable.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={groupsWithBalances}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <AntDesign name="addusergroup" size={48} color="#4b5563" />
            <Text className="text-gray-500 text-xl mt-4 text-center">
              No groups yet. Create one to get started!
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate("CreateGroup")}
        className="absolute right-5 bottom-5 bg-sky-500 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-black"
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
