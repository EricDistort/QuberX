import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { UserProvider } from './utils/UserContext'; // <-- Wrap app

// --- Screens ---
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import HomeDetailsScreen from './screens/home/HomeDetailsScreen';
import DetailsScreen from './screens/details/DetailsScreen';
import DetailsInfoScreen from './screens/details/DetailsInfoScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import EditProfileScreen from './screens/profile/EditProfileScreen';

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const DetailsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="HomeDetails" component={HomeDetailsScreen} />
    </HomeStack.Navigator>
  );
}

function DetailsStackScreen() {
  return (
    <DetailsStack.Navigator screenOptions={{ headerShown: false }}>
      <DetailsStack.Screen name="DetailsMain" component={DetailsScreen} />
      <DetailsStack.Screen name="DetailsInfo" component={DetailsInfoScreen} />
    </DetailsStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Details" component={DetailsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <StatusBar hidden={true} />
      <NavigationContainer>
        <RootStack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Main" component={MainTabs} />
        </RootStack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
