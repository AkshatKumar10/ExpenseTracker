import { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useGroupStore } from '../store/groupStore';
import * as Haptics from 'expo-haptics';
import AntDesign from '@expo/vector-icons/AntDesign';
import { auth } from '../firebase';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { groups, deleteGroup, getUserTotalBalance, getUserGroupBalances } =
    useGroupStore();
  const { theme } = useContext(ThemeContext);
  const [profileImage, setProfileImage] = useState(null);

  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName || 'User';

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

  const handleDeleteGroup = (groupId, groupName) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteGroup(groupId);
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => BackHandler.exitApp(),
          },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, []),
  );

  const renderGroupItem = ({ item }) => {
    const previewMembers = item.members?.slice(0, 2) || [];
    const remainingMembers = item.members?.length - 2;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
        onLongPress={() => handleDeleteGroup(item.id, item.name)}
        activeOpacity={0.7}
        className={`${
          theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-100'
        } rounded-xl p-4 mb-4`}
      >
        <View className="flex-row justify-between items-start">
          <Text
            className={`text-xl font-semibold flex-1 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
          >
            {item.name}
          </Text>
          <Text
            className={`ml-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {item.members?.length || 0} member
            {item.members?.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text
          className={`mt-2 text-lg ${
            item.balance < 0 ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {item.balance < 0
            ? `You owe ₹${Math.abs(item.balance).toFixed(2)}`
            : `You get ₹${item.balance.toFixed(2)}`}
        </Text>
        {item.members?.length > 0 && (
          <View className="mt-3">
            <Text
              className={`text-base ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              } mb-1`}
            >
              Members:
            </Text>
            <View className="flex-row flex-wrap">
              {previewMembers.map((member) => (
                <View
                  key={member.id}
                  className={`${
                    theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-200'
                  } rounded-full pl-1 pr-2 py-1 mr-2 mb-2 flex-row items-center`}
                >
                  {profileImage && member.id === currentUser.uid ? (
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
                      className={`w-8 h-8 ${
                        theme === 'dark' ? 'bg-gray-500' : 'bg-gray-300'
                      } rounded-full mr-1 items-center justify-center`}
                    >
                      <Text
                        className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text
                    className={`text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                  >
                    {member.name.split(' ')[0]}
                  </Text>
                </View>
              ))}
              {remainingMembers > 0 && (
                <View
                  className={`${
                    theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-200'
                  } rounded-full px-3 py-1 mr-2 mb-2`}
                >
                  <Text
                    className={`text-base ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                  >
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
    <SafeAreaView
      className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'} px-4 pt-2`}
    >
      <View className="mb-8">
        <Text
          className={`text-2xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-sky-400' : 'text-sky-600'
          }`}
        >
          Welcome back, {userName}!
        </Text>
        <View className="flex-row justify-between items-center">
          <Text
            className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
          >
            Your Groups
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => navigation.navigate('Summary')}
              className="mr-4"
            >
              <AntDesign
                name="barschart"
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <AntDesign
                name="user"
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View
        className={`${
          theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-100'
        } rounded-xl p-4 mb-6`}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className={`text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Net Balance
          </Text>
          <AntDesign
            name={totalBalance < 0 ? 'arrowdown' : 'arrowup'}
            size={20}
            color={totalBalance < 0 ? '#ef4444' : '#4ade80'}
          />
        </View>
        <View className="flex-row items-end">
          <Text
            className={`text-3xl font-bold ${
              totalBalance < 0 ? 'text-red-500' : 'text-green-400'
            }`}
          >
            {totalBalance < 0
              ? `-₹${Math.abs(totalBalance).toFixed(2)}`
              : `+₹${totalBalance.toFixed(2)}`}
          </Text>
          <Text
            className={`text-sm ml-2 mb-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {totalBalance < 0 ? 'you owe' : "you'll receive"}
          </Text>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View className="flex-1 pr-2">
            <Text
              className={`text-base ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Total Owed
            </Text>
            <Text className="text-red-400 font-bold">
              ₹{Math.abs(totalOwed).toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 pl-2">
            <Text
              className={`text-base ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Total Receivable
            </Text>
            <Text className="text-green-400 font-bold">
              ₹{totalReceivable.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={groupsWithBalances}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <AntDesign
              name="addusergroup"
              size={48}
              color={theme === 'dark' ? '#4b5563' : '#6b7280'}
            />
            <Text
              className={`text-xl mt-4 text-center ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              No groups yet. Create one to get started!
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateGroup')}
        className={`absolute right-5 bottom-5 ${
          theme === 'dark' ? 'bg-sky-500' : 'bg-sky-600'
        } w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-black`}
      >
        <AntDesign
          name="plus"
          size={24}
          color={theme === 'dark' ? 'white' : 'white'}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
