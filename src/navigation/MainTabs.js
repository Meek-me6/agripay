import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import SubsidyScreen from '../screens/SubsidyScreen';
import CooperativeScreen from '../screens/CooperativeScreen';
import CreditScreen from '../screens/CreditScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors, shadow } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',        icon: 'home',         iconOut: 'home-outline',           component: HomeScreen },
  { name: 'Marketplace', icon: 'storefront',   iconOut: 'storefront-outline',     component: MarketplaceScreen },
  { name: 'Subsidy',     icon: 'cash',         iconOut: 'cash-outline',           component: SubsidyScreen },
  { name: 'Cooperative', icon: 'people',       iconOut: 'people-outline',         component: CooperativeScreen },
  { name: 'Credit',      icon: 'card',         iconOut: 'card-outline',           component: CreditScreen },
  { name: 'Wallet',      icon: 'wallet',       iconOut: 'wallet-outline',         component: WalletScreen },
  { name: 'Profile',     icon: 'person',       iconOut: 'person-outline',         component: ProfileScreen },
];

function TabIcon({ focused, icon, iconOut, color }) {
  return (
    <Ionicons name={focused ? icon : iconOut} size={22} color={color} />
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} icon={tab.icon} iconOut={tab.iconOut} color={color} />
          ),
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        };
      }}
    >
      {TABS.map(t => (
        <Tab.Screen key={t.name} name={t.name} component={t.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    ...shadow.md,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabItem: {
    paddingVertical: 2,
  },
});
