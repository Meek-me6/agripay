import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FarmerProvider, useFarmer } from './src/context/FarmerContext';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabs from './src/navigation/MainTabs';
import { View, ActivityIndicator } from 'react-native';
import { colors } from './src/theme/colors';

function Root() {
  const { farmer, loading } = useFarmer();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return farmer.registered ? <MainTabs /> : <RegisterScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FarmerProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </FarmerProvider>
    </SafeAreaProvider>
  );
}
