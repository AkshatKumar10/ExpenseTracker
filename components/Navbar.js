import React from "react";
import {
  SafeAreaView,
  View,
  Pressable
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";

const NavBar = ({ onBackPress }) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView className="bg-black">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="pl-4 pt-12 pr-5"
      >
        <Pressable onPress={handleBackPress}>
          <AntDesign
            name="arrowleft"
            size={28}
            color="white"
            className="ml-0"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default NavBar;
