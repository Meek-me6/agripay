import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import PriceBoardScreen from '../screens/PriceBoardScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import SubsidyScreen from '../screens/SubsidyScreen';
import CooperativeScreen from '../screens/CooperativeScreen';
import CreditScreen from '../screens/CreditScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const iconFor = {
  Home: 'home-outline',
  Prices: 'trending-up-outline',
  Marketplace: 'cart-outline',
  Subsidy: 'cash-outline',
  Cooperative: 'people-outline',
  Credit: 'card-outline',
  Profile: 'person-outline',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={iconFor[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Prices" component={PriceBoardScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Subsidy" component={SubsidyScreen} />
      <Tab.Screen name="Cooperative" component={CooperativeScreen} />
      <Tab.Screen name="Credit" component={CreditScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
