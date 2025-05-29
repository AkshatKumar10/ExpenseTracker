import { useEffect, useState, useContext } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard,
  ScrollView,
  Image,
} from 'react-native';
import { useGroupStore } from '../store/groupStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { nanoid } from 'nanoid/non-secure';
import NavBar from '../components/Navbar';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { auth } from '../firebase';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const { addGroup } = useGroupStore();
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { theme } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState(null);

  const currentUser = auth.currentUser;
  const currentUserData = {
    id: currentUser?.uid || 'current-user',
    name: currentUser?.displayName || 'User',
  };

  useEffect(() => {
    const loadImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('@profile_image');
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error('Failed to load profile image:', error);
      }
    };
    loadImage();
  }, []);

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
      navigation.navigate('Home', { groupId });
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
    <SafeAreaView
      className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <NavBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text
              className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
            >
              New Group
            </Text>
            <Text
              className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Add members and set up your group
            </Text>
          </View>

          <View className="mb-6">
            <Text
              className={`text-lg font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
            >
              Group Name
            </Text>
            <TextInput
              placeholder="Enter group name"
              placeholderTextColor={theme === 'dark' ? '#6b7280' : '#9ca3af'}
              value={groupName}
              onChangeText={setGroupName}
              className={`rounded-xl p-4 text-lg ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-black'
              }`}
            />
          </View>

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className={`text-lg font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
              >
                Members ({selectedMembers.length + 1})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.navigate('AddMembers', {
                    selectedMembers,
                    groupName,
                  });
                }}
                className="flex-row items-center"
              >
                <Feather name="edit-2" size={18} color="#3b82f6" />
                <Text className="text-blue-400 ml-1">
                  {selectedMembers.length > 0 ? 'Edit' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              } rounded-xl p-4`}
            >
              <View
                className="flex-row items-center py-3 border-b"
                style={{
                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                }}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      marginRight: 12,
                    }}
                  />
                ) : (
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      {currentUserData.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text
                    className={`text-base ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                  >
                    {currentUserData.name}
                  </Text>
                </View>
                <Text
                  className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  You
                </Text>
              </View>

              <FlatList
                data={selectedMembers}
                scrollEnabled={false}
                keyExtractor={(item) => `member-${item.id}`}
                renderItem={({ item }) => (
                  <View
                    className="flex-row items-center py-3 border-b last:border-b-0"
                    style={{
                      borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                    }}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <Text
                        className={`font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}
                      >
                        {item.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedMembers(
                          selectedMembers.filter((m) => m.id !== item.id),
                        )
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

        <View className="px-6 pb-6 pt-2">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className={`py-4 rounded-xl items-center ${
              !groupName.trim() || selectedMembers.length === 0
                ? 'bg-gray-600'
                : 'bg-sky-500'
            }`}
          >
            <Text className="text-xl font-bold text-white">Create Group</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
