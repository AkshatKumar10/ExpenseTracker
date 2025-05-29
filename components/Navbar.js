import { useContext } from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ThemeContext } from '../context/ThemeContext';

const NavBar = ({ onBackPress }) => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View>
      <Pressable onPress={handleBackPress} className="px-4">
        <AntDesign
          name="arrowleft"
          size={28}
          color={theme === 'dark' ? 'white' : 'black'}
        />
      </Pressable>
    </View>
  );
};

export default NavBar;
