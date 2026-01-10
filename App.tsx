import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  StatusBar,
  Image,
  View,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { UserProvider } from './utils/UserContext';
import LinearGradient from 'react-native-linear-gradient';

// Import Screens
import SplashScreen from './SplashScreen';
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
import OnboardingScreen from './screens/Onboarding';
import Register from './screens/Register';
import ProfileScreen from './screens/home/ProfileScreen';
import TransactionDetailsScreen from './screens/home/TransactionDetailsScreen';

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Theme Constants
const THEME_GRADIENT = ['#7b0094ff', '#ff00d4ff'];

// --- CUSTOM POP TAB BUTTON ---
const PopTabButton = (props: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8, // Scales down to 80%
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      {...props}
      onPressIn={e => {
        handlePressIn();
        props.onPressIn && props.onPressIn(e);
      }}
      onPressOut={e => {
        handlePressOut();
        props.onPressOut && props.onPressOut(e);
      }}
      style={[props.style, styles.tabBtnContainer]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {props.children}
      </Animated.View>
    </Pressable>
  );
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="SendMoney" component={SendMoneyScreen} />
      <HomeStack.Screen name="RecieveMoney" component={FeedScreen} />
      <HomeStack.Screen name="OrderList" component={OrderListScreen} />
      <HomeStack.Screen
        name="RecieveMoneyScreen"
        component={RecieveMoneyScreen}
      />
      <HomeStack.Screen name="DepositMoney" component={DepositScreen} />
      <HomeStack.Screen name="WithdrawalMoney" component={WithdrawalScreen} />
      <HomeStack.Screen
        name="TransactionDetailsScreen"
        component={TransactionDetailsScreen}
      />
      <HomeStack.Screen name="StoreMain" component={StoreScreen} />
      <HomeStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </HomeStack.Navigator>
  );
}

function FeedStackScreen() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedMain" component={TransactionListScreen} />
      <FeedStack.Screen
        name="TransactionDetailsScreen"
        component={TransactionDetailsScreen}
      />
    </FeedStack.Navigator>
  );
}

function StoreStackScreen() {
  return (
    <StoreStack.Navigator screenOptions={{ headerShown: false }}>
      <StoreStack.Screen name="SendMoney" component={SendMoneyScreen} />
    </StoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <LinearGradient
              colors={THEME_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}
            />
          ),
        }}
      >
        <Tab.Screen
          name="Trades"
          component={StoreStackScreen}
          options={{
            // Apply Pop Animation Button
            tabBarButton: props => <PopTabButton {...props} />,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Image
                  source={require('./screens/tabMedia/store.webp')}
                  style={[
                    styles.icon,
                    focused ? styles.activeIcon : styles.inactiveIcon,
                  ]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            // Apply Pop Animation Button
            tabBarButton: props => <PopTabButton {...props} />,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Image
                  source={require('./screens/tabMedia/home.webp')}
                  style={[
                    styles.icon,
                    focused ? styles.activeIcon : styles.inactiveIcon,
                  ]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Receipt"
          component={FeedStackScreen}
          options={{
            // Apply Pop Animation Button
            tabBarButton: props => <PopTabButton {...props} />,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Image
                  source={require('./screens/tabMedia/feed.webp')}
                  style={[
                    styles.icon,
                    focused ? styles.activeIcon : styles.inactiveIcon,
                  ]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  return (
    <UserProvider>
      <StatusBar hidden={true} />
      <NavigationContainer>
        <RootStack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={Register} />
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen name="Help" component={Help} />
        </RootStack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  /* Floating Tab Bar */
  tabBar: {
    position: 'absolute',
    bottom: vs(20),
    left: s(0),
    right: s(0),
    height: vs(65),
    borderRadius: ms(35),
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    marginHorizontal: s(30),
    paddingHorizontal: s(15),
  },

  /* Gradient Background */
  gradientBackground: {
    flex: 1,
    borderRadius: ms(35),
    elevation: 10,
    shadowColor: '#ff00d4',
  },

  /* Pop Button Container */
  tabBtnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Icons */
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    top: vs(10), // Micro adjustment to center optically with the dot
  },

  icon: {
    width: s(27),
    height: s(27),
    marginBottom: vs(4),
  },

  activeIcon: {
    width: s(32), // Slightly larger when active
    height: s(32),
    tintColor: '#fff',
  },

  inactiveIcon: {
    tintColor: 'rgba(255, 255, 255, 0.5)',
  },

  /* The White Dot */
  activeDot: {
    bottom: vs(8), // Pinned to bottom of the container
    width: s(15),
    height: s(4),
    borderRadius: s(2.5),
    marginTop: vs(7),
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
});
