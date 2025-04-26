import React, { useContext } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeContext } from '../context/ThemeContext';

export default function WelcomeScreen() {
  const width = Dimensions.get('window').width;
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <SafeAreaView
      className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#000000' : '#FFFFFF'}
      />
      <View className="flex-1 justify-center items-center px-4">
        <Text
          className={`text-3xl ${
            theme === 'dark' ? 'text-white' : 'text-black'
          } font-bold mb-20`}
        >
          𝙴𝚡𝚙𝚎𝚗𝚜𝚎 𝚃𝚛𝚊𝚌𝚔𝚎𝚛
        </Text>

        <View className="items-center">
          <Image
            source={require('../assets/expense.png')}
            style={{ width: 300, height: 300 }}
            resizeMode="contain"
          />
          <Text className="text-[25px] text-sky-400 mt-10 text-center font-bold">
            Track your expenses easily!
          </Text>
          <Text
            className={`text-xl ${
              theme === 'dark' ? 'text-white' : 'text-black'
            } mt-5 text-center px-10`}
          >
            Do you have trouble in tracking and managing your money expenses?
            Take note of your money expenses with expense tracker app, track
            them easily.
          </Text>
        </View>

        <View style={{ width: width - 40 }} className="mt-10 mb-10">
          <TouchableOpacity
            className="bg-sky-400 rounded-xl items-center justify-center py-4 mb-4"
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text className="text-white text-xl font-bold">Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-600 rounded-xl items-center justify-center py-4"
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text className="text-white text-xl font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
