import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Image, View } from 'react-native';
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
import StoreScreen from './screens/Store/StoreScreen';
import RecieveMoneyScreen from './screens/home/RecieveMoneyScreen';
import SendMoneyScreen from './screens/home/SendMoneyScreen';
import OrderListScreen from './screens/Store/OrderListScreen';
import { LinearGradient } from 'react-native-linear-gradient';
const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="SendMoney" component={StoreScreen} />
      <HomeStack.Screen name="RecieveMoney" component={FeedScreen} />
     
      <HomeStack.Screen name="DepositMoney" component={DepositScreen} />
      <HomeStack.Screen name="WithdrawalMoney" component={WithdrawalScreen} />
    </HomeStack.Navigator>
  );
}

function FeedStackScreen() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedMain" component={TransactionListScreen} />
    </FeedStack.Navigator>
  );
}

function StoreStackScreen() {
  return (
    <StoreStack.Navigator screenOptions={{ headerShown: false }}>
      <StoreStack.Screen name="StoreMain" component={SendMoneyScreen} />
      
    </StoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: vs(16),
            left: 0,
            right: 0,
            height: vs(65),
            backgroundColor: 'rgba(0, 0, 0, 1)',
            borderRadius: ms(35),
            borderWidth: ms(2),
            borderColor: 'transparent',
            overflow: 'hidden',
            elevation: 5,
            marginHorizontal: '5%',
            paddingBottom: vs(10),
          paddingTop: vs(10),
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#00c6ff', '#ff00ff']}
              style={{
                flex: 1,
                borderRadius: ms(35),
                padding: ms(2),
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 1)',
                  borderRadius: ms(35),
                }}
              />
            </LinearGradient>
          ),
          tabBarActiveTintColor: '#00c6ff',
          tabBarInactiveTintColor: '#00c8ff77',
        }}
      >
        <Tab.Screen
          name="Store"
          component={StoreStackScreen}
          options={{
            tabBarIcon: ({ focused }) => {
              const size = focused ? s(29) : s(24);
              return (
                <Image
                  source={require('./screens/tabMedia/store.webp')}
                  style={{
                    width: size,
                    height: size,
                    tintColor: '#00c6ff',
                    opacity: focused ? 1 : 0.5,
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
              const size = focused ? s(29) : s(24);
              return (
                <Image
                  source={require('./screens/tabMedia/home.webp')}
                  style={{
                    width: size,
                    height: size,
                    tintColor: '#00c6ff',
                    opacity: focused ? 1 : 0.5,
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
              const size = focused ? s(29) : s(24);
              return (
                <Image
                  source={require('./screens/tabMedia/feed.webp')}
                  style={{
                    width: size,
                    height: size,
                    tintColor: '#00c6ff',
                    opacity: focused ? 1 : 0.5,
                  }}
                />
              );
            },
          }}
        />
      </Tab.Navigator>
    </View>
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
