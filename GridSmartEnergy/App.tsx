import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import HomeScreen from './src/screens/HomeScreen';
import IncentivesScreen from './src/screens/IncentivesScreen';
import TradingScreen from './src/screens/TradingScreen';
import WalletScreen from './src/screens/WalletScreen';
import { colors } from './src/styles/theme';

const Tab = createBottomTabNavigator();

function TabBarIcon({
  name,
  focused,
  color
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(focused ? 1 : 0.9);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.accent.cyan : color}
      />
    </Animated.View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.primary.backgroundDark,
            borderTopColor: colors.card.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 10,
            position: 'absolute',
            elevation: 8,
            shadowColor: colors.shadow.medium,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
          tabBarActiveTintColor: colors.accent.cyan,
          tabBarInactiveTintColor: colors.text.secondary,
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon name="home" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Incentives"
          component={IncentivesScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon name="flash" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Trading"
          component={TradingScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon name="swap-horizontal" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabBarIcon name="wallet" focused={focused} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
