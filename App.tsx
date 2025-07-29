import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { UserProvider } from './utils/UserContext';
import { Image } from 'react-native';

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
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          marginHorizontal: '5%',
          elevation: 5,
          backgroundColor: '#fff',
          borderRadius: 35,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 5,
        },
        tabBarActiveTintColor: '#8CA6DB',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Withdraw"
        component={DetailsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./screens/tabMedia/withdraw.webp')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#8CA6DB' : '#999',
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./screens/tabMedia/home.webp')} // <-- your local path
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#8CA6DB' : '#999', // changes color on focus
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Deposit"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./screens/tabMedia/deposit.webp')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#8CA6DB' : '#999',
              }}
            />
          ),
        }}
      />
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
