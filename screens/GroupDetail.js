import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useGroupStore } from "../store/groupStore";
import { nanoid } from "nanoid/non-secure";
import AntDesign from "@expo/vector-icons/AntDesign";
import NavBar from "../components/Navbar";
import { Snackbar } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";

export default function GroupDetail({ route }) {
  const { groupId } = route?.params || {};
  const navigation = useNavigation();
  const { groups, addExpense, calculateMemberBalances } = useGroupStore();
  const group = groups.find((g) => g.id === groupId);
  const [customSplits, setCustomSplits] = useState({});
  const [showCustomSplitModal, setShowCustomSplitModal] = useState(false);
  const [totalCustomAmount, setTotalCustomAmount] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showAllMembers, setShowAllMembers] = useState(false);

  const availablePayers = group?.members || [];
  const [payer, setPayer] = useState(availablePayers[0]?.name || "");

  const formatExpenseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCustomSplitChange = (memberId, value) => {
    const amountValue = Math.max(0, parseFloat(value) || 0);
    setCustomSplits((prev) => ({
      ...prev,
      [memberId]: amountValue,
    }));
    const newTotal = Object.values({
      ...customSplits,
      [memberId]: amountValue,
    }).reduce((sum, val) => sum + val, 0);
    setTotalCustomAmount(newTotal);
  };

  const handleAddExpense = () => {
    if (!description.trim() || !amount || !payer.trim()) {
      setIsModalVisible(false);
      setTimeout(() => {
        setSnackbarMessage("Please fill all fields");
        setSnackbarVisible(true);
      }, 300);
      return;
    }

    const expenseAmount = parseFloat(amount);
    let splits = {};

    if (splitType === "equal") {
      const share = expenseAmount / availablePayers.length;
      availablePayers.forEach((member) => {
        splits[member.id] = share;
      });
    } else if (splitType === "custom") {
      if (
        Math.abs(totalCustomAmount - expenseAmount) > 0.01 ||
        Object.keys(customSplits).length === 0
      ) {
        setSnackbarMessage(`Allocated amount must equal ₹${expenseAmount.toFixed(2)}`);
        setSnackbarVisible(true);
        return;
      }
      splits = { ...customSplits };
      const payerMember = availablePayers.find((m) => m.name === payer);
      if (payerMember) {
        const othersSum = Object.values(customSplits).reduce((a, b) => a + b, 0);
        splits[payerMember.id] = expenseAmount - othersSum;
      }
    }

    const expense = {
      id: nanoid(),
      description,
      amount: parseFloat(amount),
      payer,
      splitType,
      splits,
      timestamp: new Date().toISOString(),
    };
    addExpense(groupId, expense);
    resetForm();
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPayer(availablePayers[0]?.name || "");
    setSplitType("equal");
    setCustomSplits({});
    setTotalCustomAmount(0);
    setIsModalVisible(false);
    setShowCustomSplitModal(false);
    setSnackbarMessage("Expense added successfully!");
    setSnackbarVisible(true);
  };

  const handleEqualSplitSelect = () => {
    setSplitType("equal");
    setCustomSplits({});
    setTotalCustomAmount(0);
  };

  const memberBalances = calculateMemberBalances(groupId);
  const displayedMembers = showAllMembers ? memberBalances : memberBalances.slice(0, 3);

  const getDisplayName = (fullName) => {
    const firstName = fullName.split(" ")[0];
    return firstName.length > 10 ? `${firstName.substring(0, 7)}...` : firstName;
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <NavBar />
      <View className="flex-1">
        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="mb-6">
            <Text className="text-3xl text-white font-bold mb-1">{group?.name}</Text>
            <View className="mt-6 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg text-gray-400 font-semibold">
                  Members ({group?.members?.length || 0})
                </Text>
                {!showAllMembers && memberBalances.length > 3 && (
                  <TouchableOpacity onPress={() => setShowAllMembers(true)}>
                    <Text className="text-blue-400 text-base">View All</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="bg-gray-800 rounded-xl p-4">
                {displayedMembers.map((member, index) => {
                  const fromTransactions = member.transactions.filter((t) => t.from);
                  const toTransactions = member.transactions.filter((t) => t.to);

                  return (
                    <TouchableOpacity
                      key={`member-${member.id}-${index}`}
                      className="py-3 border-b border-gray-700 last:border-b-0"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center mr-3">
                            <Text className="text-white font-bold">{member.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <Text className="text-white text-lg">{member.name}</Text>
                        </View>
                        <Text
                          className={`text-sm font-bold ${
                            member.balance > 0 ? "text-green-400" : member.balance < 0 ? "text-red-400" : "text-gray-400"
                          }`}
                        >
                          {member.balance > 0 ? `+₹${member.balance.toFixed(2)}` : member.balance < 0 ? `-₹${Math.abs(member.balance).toFixed(2)}` : "₹0.00"}
                        </Text>
                      </View>
                      {(member.balance !== 0) && (
                        <View className="mt-1 ml-11">
                          <Text
                            className={`text-base ${
                              member.balance > 0 ? "text-green-400" : "text-red-400"
                            }`}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {member.balance > 0
                              ? `From ${fromTransactions.length > 0 ? getDisplayName(fromTransactions[0].from) : "others"}${
                                  fromTransactions.length > 1 ? " & others" : ""
                                }`
                              : `To ${toTransactions.length > 0 ? getDisplayName(toTransactions[0].to) : "others"}${
                                  toTransactions.length > 1 ? " & others" : ""
                                }`}
                            {(fromTransactions.length > 1 || toTransactions.length > 1) && (
                              <Text className="text-gray-400"> ({Math.max(fromTransactions.length, toTransactions.length)})</Text>
                            )}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
                {showAllMembers && memberBalances.length > 3 && (
                  <TouchableOpacity onPress={() => setShowAllMembers(false)} className="pt-3 items-center">
                    <Text className="text-blue-400 text-base">Show Less</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {group?.expenses?.length > 0 && (
              <Text className="text-lg text-gray-400 font-semibold mt-6">Expenses</Text>
            )}
          </View>
          {group?.expenses?.length > 0 ? (
            <FlatList
              data={[...(group.expenses || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="bg-gray-800 rounded-xl p-4 mb-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-xl text-white flex-1 font-medium">
                      {item.description}
                    </Text>
                    <Text className="text-blue-400 font-bold text-base">₹{item.amount.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row mb-2">
                    <Text className="text-gray-400 text-base mr-6">Paid by {item.payer}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">{formatExpenseDate(item.timestamp)}</Text>
                    <Text className="text-gray-500 text-sm">
                      {item.splitType === "equal" ? "Equal split" : "Custom split"}
                    </Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <View className="flex-1 justify-center items-center h-[60vh]">
              <Text className="text-white text-2xl font-semibold mb-2">No expenses yet</Text>
              <Text className="text-gray-400 text-xl">Add your first expense to get started</Text>
            </View>
          )}
        </ScrollView>
        {!snackbarVisible && (
          <TouchableOpacity
            className="absolute right-5 bottom-5 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-black"
            onPress={() => {
              setIsModalVisible(true);
              setDescription("");
              setAmount("");
              setPayer(availablePayers[0]?.name || "");
              setSplitType("equal");
              setCustomSplits({});
              setTotalCustomAmount(0);
            }}
          >
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 justify-end">
          <View className="bg-gray-800 rounded-t-3xl p-6 max-h-[90%]">
            <ScrollView>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-2xl font-bold">Add Expense</Text>
                <TouchableOpacity className="p-2" onPress={() => setIsModalVisible(false)}>
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Description"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-700 text-white p-4 mb-4 rounded-lg text-base"
                value={description}
                onChangeText={setDescription}
              />
              <TextInput
                placeholder="Amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="bg-gray-700 text-white p-4 mb-4 rounded-lg text-base"
                value={amount}
                onChangeText={setAmount}
              />
              <View className="bg-gray-700 rounded-lg mb-4 overflow-hidden">
                <Picker
                  selectedValue={payer}
                  onValueChange={(itemValue) => setPayer(itemValue)}
                  style={{ color: "white" }}
                  dropdownIconColor="white"
                >
                  {availablePayers.map((member) => (
                    <Picker.Item key={`payer-${member.id}`} label={member.name} value={member.name} />
                  ))}
                </Picker>
              </View>
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  onPress={handleEqualSplitSelect}
                  className={`flex-1 py-3 rounded-lg ${splitType === "equal" ? "bg-blue-500" : "bg-gray-700"}`}
                >
                  <Text className="text-center font-bold text-white">Equal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSplitType("custom");
                    setShowCustomSplitModal(true);
                  }}
                  className={`flex-1 py-3 rounded-lg ${splitType === "custom" ? "bg-blue-500" : "bg-gray-700"}`}
                >
                  <Text className="text-center font-bold text-white">Custom</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleAddExpense} className="bg-blue-500 py-4 rounded-xl mb-4">
                <Text className="text-white font-bold text-lg text-center">Add Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showCustomSplitModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomSplitModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-gray-800 rounded-t-3xl p-6 max-h-[80%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-2xl font-bold">Custom Split</Text>
                <TouchableOpacity
                  className="p-2"
                  onPress={() => {
                    setSplitType("equal");
                    setCustomSplits({});
                    setTotalCustomAmount(0);
                    setShowCustomSplitModal(false);
                  }}
                >
                  <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-white mb-2 font-bold">Total Amount: ₹{parseFloat(amount || 0).toFixed(2)}</Text>
              <Text
                className={`mb-4 ${
                  totalCustomAmount > parseFloat(amount || 0)
                    ? "text-red-400"
                    : totalCustomAmount === parseFloat(amount || 0)
                    ? "text-green-400"
                    : "text-white"
                }`}
              >
                Allocated: ₹{totalCustomAmount.toFixed(2)}
                {totalCustomAmount > parseFloat(amount || 0) && (
                  <Text className="text-red-400 text-sm">
                    {" "} (Exceeds by ₹{(totalCustomAmount - parseFloat(amount || 0)).toFixed(2)})
                  </Text>
                )}
                {totalCustomAmount < parseFloat(amount || 0) && (
                  <Text className="text-yellow-400 text-sm">
                    {" "} (Less by ₹{(parseFloat(amount || 0) - totalCustomAmount).toFixed(2)})
                  </Text>
                )}
              </Text>
              {availablePayers.map((member) => (
                <View key={`split-${member.id}`} className="mb-4">
                  <Text className="text-white mb-1">{member.name}</Text>
                  <TextInput
                    placeholder="Amount"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="bg-gray-700 text-white p-4 rounded-lg text-base"
                    value={customSplits[member.id]?.toString() || ""}
                    onChangeText={(value) => handleCustomSplitChange(member.id, value)}
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={() => {
                  if (totalCustomAmount === parseFloat(amount || 0)) {
                    setShowCustomSplitModal(false);
                  } else {
                    setSnackbarMessage(
                      totalCustomAmount > parseFloat(amount || 0)
                        ? "Allocated amount exceeds total amount"
                        : "Allocated amount must equal total amount"
                    );
                    setSnackbarVisible(true);
                  }
                }}
                className={`py-4 rounded-xl mt-4 ${
                  totalCustomAmount === parseFloat(amount || 0) ? "bg-blue-500" : "bg-gray-500"
                }`}
              >
                <Text className="text-white font-bold text-lg text-center">
                  {totalCustomAmount === parseFloat(amount || 0) ? "Confirm Split" : "Fix Allocation First"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#3B82F6", borderRadius: 8, marginHorizontal: 16 }}
      >
        <Text className="text-white font-semibold">{snackbarMessage}</Text>
      </Snackbar>
    </SafeAreaView>
  );
}