import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateGroup from '../screens/CreateGroup';
import GroupDetail from '../screens/GroupDetail';
import AddMembersScreen from '../screens/AddMembersScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SummaryScreen from '../screens/SummaryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Home' : 'Welcome'}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="AddMembers"
          component={AddMembersScreen}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroup}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="GroupDetail"
          component={GroupDetail}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
        <Stack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{
            gestureEnabled: false,
            presentation: 'transparentModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
