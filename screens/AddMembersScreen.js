import { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { AntDesign } from '@expo/vector-icons';
import NavBar from '../components/Navbar';
import { useRoute, useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { ThemeContext } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddMembersScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const alreadySelected = route.params?.selectedMembers || [];

  const currentUser = auth.currentUser;
  const currentUserData = {
    id: currentUser?.uid || 'current-user',
    name: currentUser?.displayName || 'User',
  };

  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(alreadySelected);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useContext(ThemeContext);

  const isPhoneNumber = (str) => {
    if (!str) return true;
    const trimmedStr = str.trim();
    const phoneNumberPattern = /^\+?\d[\d\s-]*$/;
    return phoneNumberPattern.test(trimmedStr) || trimmedStr === '';
  };

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
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
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()),
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
    navigation.navigate('CreateGroup', {
      selectedMembers: selectedContacts,
      groupName: route.params?.groupName,
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 ${
          theme === 'dark' ? 'bg-black' : 'bg-white'
        } justify-center items-center`}
      >
        <ActivityIndicator
          size="large"
          color={theme === 'dark' ? '#38bdf8' : '#1e40af'}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
    >
      <NavBar />
      <View className="flex-1 px-6">
        <Text
          className={`text-2xl font-bold mb-4 mt-6 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        >
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

        <View
          className={`flex-row justify-between items-center p-4 rounded-lg mb-2 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-lg ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
          >
            {currentUserData.name}
          </Text>
          <Text
            className={`text-gray-400 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            (Group creator)
          </Text>
        </View>

        <FlatList
          data={filteredContacts}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `contact-${item.id}`}
          renderItem={({ item }) => {
            const isSelected = selectedContacts.some((c) => c.id === item.id);
            return (
              <TouchableOpacity
                onPress={() => toggleSelect(item)}
                className={`flex-row justify-between items-center p-4 rounded-lg mb-2 ${
                  isSelected
                    ? theme === 'dark'
                      ? 'bg-blue-500'
                      : 'bg-blue-400'
                    : theme === 'dark'
                      ? 'bg-gray-800'
                      : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}
                >
                  {item.name}
                </Text>
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
            className={`py-4 rounded-xl mt-4 ${
              selectedContacts.length > 0
                ? theme === 'dark'
                  ? 'bg-blue-500'
                  : 'bg-blue-400'
                : 'bg-gray-600'
            }`}
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
