import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { FarmerProvider, useFarmer } from './src/context/FarmerContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainTabs from './src/navigation/MainTabs';
import { colors } from './src/theme/colors';
import { setupDB } from './src/db/database';

function Root() {
  const { farmer, loading } = useFarmer();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return farmer ? <MainTabs /> : <AuthNavigator />;
}

export default function App() {
  useEffect(() => { setupDB(); }, []);
  return (
    <SafeAreaProvider>
      <FarmerProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Root />
        </NavigationContainer>
      </FarmerProvider>
    </SafeAreaProvider>
  );
}
