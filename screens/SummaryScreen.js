import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../store/groupStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import NavBar from "../components/Navbar";
import { auth } from "../firebase";

export default function SummaryScreen() {
  const navigation = useNavigation();
  const { groups, getUserTotalBalance, getUserGroupBalances } = useGroupStore();
  const [activeTab, setActiveTab] = useState("overview");
  
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
  
  // Group members with balances
  const memberBalanceSummary = groups.reduce((acc, group) => {
    if (!group.members) return acc;
    
    group.members.forEach(member => {
      if (member.name === userName) return; // Skip current user
      
      if (!acc[member.name]) {
        acc[member.name] = {
          name: member.name,
          youOwe: 0,
          theyOwe: 0,
          net: 0,
          groups: []
        };
      }
      
      // Get this member's balance in this group
      const balances = group.expenses?.reduce((bal, expense) => {
        if (expense.payer === userName && expense.splits && expense.splits[member.id]) {
          // Member owes user
          bal.theyOwe += expense.splits[member.id];
        } else if (expense.payer === member.name && expense.splits) {
          // Find current user's share
          const userMemberId = group.members.find(m => m.name === userName)?.id;
          if (userMemberId && expense.splits[userMemberId]) {
            bal.youOwe += expense.splits[userMemberId];
          }
        }
        return bal;
      }, { youOwe: 0, theyOwe: 0 }) || { youOwe: 0, theyOwe: 0 };
      
      if (balances.youOwe > 0 || balances.theyOwe > 0) {
        acc[member.name].youOwe += balances.youOwe;
        acc[member.name].theyOwe += balances.theyOwe;
        acc[member.name].net += balances.theyOwe - balances.youOwe;
        acc[member.name].groups.push({
          id: group.id,
          name: group.name,
          youOwe: balances.youOwe,
          theyOwe: balances.theyOwe,
          net: balances.theyOwe - balances.youOwe
        });
      }
    });
    
    return acc;
  }, {});
  
  // Convert to array and sort by absolute value of net balance
  const memberBalances = Object.values(memberBalanceSummary).sort((a, b) => 
    Math.abs(b.net) - Math.abs(a.net)
  );

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("GroupDetail", { groupId: item.groupId })}
      className="bg-neutral-800 rounded-xl p-4 mb-4"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-xl font-semibold flex-1">{item.groupName}</Text>
        <Text
          className={`text-lg font-bold ${
            item.balance === 0 
              ? "text-gray-400" 
              : item.balance > 0 
                ? "text-green-400" 
                : "text-red-400"
          }`}
        >
          {item.balance === 0
            ? "₹0.00"
            : item.balance > 0
              ? `+₹${item.balance.toFixed(2)}`
              : `-₹${Math.abs(item.balance).toFixed(2)}`}
        </Text>
      </View>
      <Text 
        className={`text-base ${
          item.balance === 0 
            ? "text-gray-400" 
            : item.balance > 0 
              ? "text-green-400" 
              : "text-red-400"
        }`}
      >
        {item.balance === 0
          ? "You're all settled up"
          : item.balance > 0
            ? "You are owed"
            : "You owe"}
      </Text>
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }) => (
    <View className="bg-neutral-800 rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold">{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text className="text-white text-lg font-semibold">{item.name}</Text>
        </View>
        <Text
          className={`text-lg font-bold ${
            item.net === 0 
              ? "text-gray-400" 
              : item.net > 0 
                ? "text-green-400" 
                : "text-red-400"
          }`}
        >
          {item.net === 0
            ? "₹0.00"
            : item.net > 0
              ? `+₹${item.net.toFixed(2)}`
              : `-₹${Math.abs(item.net).toFixed(2)}`}
        </Text>
      </View>
      
      <View className="mt-2 flex-row justify-between">
        <View className="flex-1">
          <Text className="text-gray-400 text-base">They owe you</Text>
          <Text className="text-green-400 font-semibold">₹{item.theyOwe.toFixed(2)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-400 text-base">You owe them</Text>
          <Text className="text-red-400 font-semibold">₹{item.youOwe.toFixed(2)}</Text>
        </View>
      </View>
      
      {item.groups.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-700">
          <Text className="text-gray-400 text-base mb-2">Groups:</Text>
          {item.groups.map(group => (
            <TouchableOpacity 
              key={group.id}
              onPress={() => navigation.navigate("GroupDetail", { groupId: group.id })}
              className="flex-row justify-between items-center py-1"
            >
              <Text className="text-gray-300 text-sm">{group.name}</Text>
              <Text
                className={`text-sm ${
                  group.net === 0 
                    ? "text-gray-400" 
                    : group.net > 0 
                      ? "text-green-400" 
                      : "text-red-400"
                }`}
              >
                {group.net === 0
                  ? "₹0"
                  : group.net > 0
                    ? `+₹${group.net.toFixed(2)}`
                    : `-₹${Math.abs(group.net).toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <NavBar />
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <Text className="text-white text-3xl font-bold mb-4">Summary</Text>
          
          <View className="bg-neutral-900 rounded-xl p-4 mb-6">
            <Text className="text-gray-400 text-lg mb-2">Overall Balance</Text>
            <Text 
              className={`text-3xl font-bold ${
                totalBalance === 0 
                  ? "text-gray-400" 
                  : totalBalance > 0 
                    ? "text-green-400" 
                    : "text-red-400"
              }`}
            >
              {totalBalance === 0
                ? "₹0.00"
                : totalBalance > 0
                  ? `+₹${totalBalance.toFixed(2)}`
                  : `-₹${Math.abs(totalBalance).toFixed(2)}`}
            </Text>
            
            <View className="mt-4 flex-row">
              <View className="flex-1 pr-2">
                <Text className="text-gray-400 text-base">Total You Owe</Text>
                <Text className="text-red-400 font-bold">
                  ₹{Math.abs(totalOwed).toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 pl-2">
                <Text className="text-gray-400 text-base">Total You're Owed</Text>
                <Text className="text-green-400 font-bold">
                  ₹{totalReceivable.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row mb-6">
            <TouchableOpacity
              onPress={() => setActiveTab("overview")}
              className={`flex-1 py-3 ${
                activeTab === "overview" 
                  ? "bg-neutral-700 rounded-xl" 
                  : ""
              }`}
            >
              <Text 
                className={`text-center font-semibold ${
                  activeTab === "overview" 
                    ? "text-white" 
                    : "text-gray-500"
                }`}
              >
                By Group
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("members")}
              className={`flex-1 py-3 ${
                activeTab === "members" 
                  ? "bg-neutral-700 rounded-xl" 
                  : ""
              }`}
            >
              <Text 
                className={`text-center font-semibold ${
                  activeTab === "members" 
                    ? "text-white" 
                    : "text-gray-500"
                }`}
              >
                By Person
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === "overview" ? (
            <>
              <Text className="text-gray-400 text-lg mb-4">Group Balances</Text>
              {groupBalances.length > 0 ? (
                <FlatList
                  data={groupBalances}
                  keyExtractor={(item) => item.groupId}
                  renderItem={renderGroupItem}
                  scrollEnabled={false}
                />
              ) : (
                <View className="bg-neutral-800 rounded-xl p-6 items-center justify-center">
                  <AntDesign name="addusergroup" size={40} color="#4b5563" />
                  <Text className="text-gray-400 text-center mt-4">
                    You haven't created any groups yet
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text className="text-gray-400 text-lg mb-4">Person Balances</Text>
              {memberBalances.length > 0 ? (
                <FlatList
                  data={memberBalances}
                  keyExtractor={(item) => item.name}
                  renderItem={renderMemberItem}
                  scrollEnabled={false}
                />
              ) : (
                <View className="bg-neutral-800 rounded-xl p-6 items-center justify-center">
                  <AntDesign name="user" size={40} color="#4b5563" />
                  <Text className="text-gray-400 text-center mt-4">
                    No balances with other people yet
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}