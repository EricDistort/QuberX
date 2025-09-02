import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Image } from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { UserProvider } from './utils/UserContext';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import TransactionListScreen from './screens/home/TransactionListScreen';
import Help from './screens/home/Help';
import DepositScreen from './screens/home/DepositScreen';
import WithdrawalScreen from './screens/home/WithdrawalScreen';
import FeedScreen from './screens/Feed/FeedScreen';
import StoreScreen from './screens/Store/StoreMedia/StoreScreen';
import RecieveMoneyScreen from './screens/home/RecieveMoneyScreen';
import SendMoneyScreen from './screens/home/SendMoneyScreen';
import OrderListScreen from './screens/Store/StoreMedia/OrderListScreen';
const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="SendMoney" component={SendMoneyScreen} />
      <HomeStack.Screen name="RecieveMoney" component={RecieveMoneyScreen} />
      <HomeStack.Screen
        name="TransactionList"
        component={TransactionListScreen}
      />
      <HomeStack.Screen name="DepositMoney" component={DepositScreen} />
      <HomeStack.Screen name="WithdrawalMoney" component={WithdrawalScreen} />
    </HomeStack.Navigator>
  );
}

function FeedStackScreen() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedMain" component={FeedScreen} />
    </FeedStack.Navigator>
  );
}

function StoreStackScreen() {
  return (
    <StoreStack.Navigator screenOptions={{ headerShown: false }}>
      <StoreStack.Screen name="StoreMain" component={StoreScreen} />
      <StoreStack.Screen name="OrderList" component={OrderListScreen} />
    </StoreStack.Navigator>
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
          bottom: vs(16),
          left: 0,
          right: 0,
          marginHorizontal: '5%',
          elevation: 5,
          backgroundColor: '#fff',
          borderRadius: ms(35),
          height: vs(65),
          paddingBottom: vs(10),
          paddingTop: vs(10),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: vs(10) },
          shadowOpacity: 0.12,
          shadowRadius: ms(5),
        },
        tabBarActiveTintColor: '#a879beff',
        tabBarInactiveTintColor: '#a8bac4ff',
      }}
    >
      <Tab.Screen
        name="Store"
        component={StoreStackScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            const size = focused ? s(24 + 5) : s(24); // Add 5 if focused
            return (
              <Image
                source={require('./screens/tabMedia/store.webp')}
                style={{
                  width: size,
                  height: size,
                  opacity: focused ? 1 : 0.5, // Full opacity if focused
                }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            const size = focused ? s(24 + 5) : s(24); // Add 5 if focused
            return (
              <Image
                source={require('./screens/tabMedia/home.webp')}
                style={{
                  width: size,
                  height: size,
                  opacity: focused ? 1 : 0.5, // Full opacity if focused, half if not
                }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedStackScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            const size = focused ? s(24 + 5) : s(24); // Add 5 if focused
            return (
              <Image
                source={require('./screens/tabMedia/feed.webp')}
                style={{
                  width: size,
                  height: size,
                  opacity: focused ? 1 : 0.5, // Full opacity if focused, half if not
                }}
              />
            );
          },
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
          <RootStack.Screen name="Help" component={Help} />
        </RootStack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
