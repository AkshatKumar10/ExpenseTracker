import React, { useEffect, useState, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../App';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [image, setImage] = useState(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('@profile_image');
            await signOut(auth);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const selectTheme = (selectedTheme) => {
    if (selectedTheme !== theme) {
      toggleTheme();
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#000000' : '#FFFFFF'}
      />
      <View className="flex-1 px-4 pt-2">
        <View className="flex-row justify-between items-center mb-8">
          <Text
            className={`${
              theme === 'dark' ? 'text-white' : 'text-black'
            } text-3xl font-bold`}
          >
            Profile
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign
              name="close"
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>
        </View>

        <View
          className={`${
            theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-100'
          } rounded-xl p-4 mb-6`}
        >
          <View className="flex-row items-center">
            <TouchableOpacity onPress={addImage} activeOpacity={0.9}>
              <View className="w-14 h-14 bg-sky-500 rounded-full items-center justify-center mr-6 border border-gray-300">
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme === 'dark' ? '#ffffff' : '#000000',
                    }}
                  />
                ) : (
                  <Text
                    className={`${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    } text-xl font-bold`}
                  >
                    {user?.displayName?.charAt(0).toUpperCase()}
                  </Text>
                )}
                <View
                  className={`absolute -right-1 -bottom-1 ${
                    theme === 'dark' ? 'bg-black' : 'bg-white'
                  } rounded-full p-1`}
                >
                  <TouchableOpacity onPress={addImage}>
                    <AntDesign
                      name="camera"
                      size={12}
                      color={theme === 'dark' ? 'white' : 'black'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
            <View>
              <Text
                className={`${
                  theme === 'dark' ? 'text-white' : 'text-black'
                } text-xl font-semibold`}
              >
                {user?.displayName}
              </Text>
              <Text
                className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                } text-sm`}
              >
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View
          className={`${
            theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-100'
          } rounded-xl p-4 mb-6`}
        >
          <Text
            className={`${
              theme === 'dark' ? 'text-white' : 'text-black'
            } text-lg font-semibold mb-4`}
          >
            Theme
          </Text>
          <View className="gap-6">
            <TouchableOpacity
              onPress={() => selectTheme('light')}
              className="flex-row items-center"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-500'
                    : theme === 'dark'
                      ? 'border-gray-400'
                      : 'border-gray-600'
                } mr-2`}
              >
                {theme === 'light' && (
                  <View className="w-3 h-3 bg-white rounded-full m-auto" />
                )}
              </View>
              <Text
                className={`${
                  theme === 'dark' ? 'text-white' : 'text-black'
                } text-base`}
              >
                Light Mode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selectTheme('dark')}
              className="flex-row items-center"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-500'
                    : theme === 'dark'
                      ? 'border-gray-400'
                      : 'border-gray-600'
                } mr-2`}
              >
                {theme === 'dark' && (
                  <View className="w-3 h-3 bg-white rounded-full m-auto" />
                )}
              </View>
              <Text
                className={`${
                  theme === 'dark' ? 'text-white' : 'text-black'
                } text-base`}
              >
                Dark Mode
              </Text>
            </TouchableOpacity>
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
