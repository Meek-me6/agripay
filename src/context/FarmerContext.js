import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockFarmer } from '../data/mockData';

const FarmerContext = createContext(null);
const STORAGE_KEY = 'agripay:farmer';

export function FarmerProvider({ children }) {
  const [farmer, setFarmer] = useState(mockFarmer);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setFarmer(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load farmer profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateFarmer = async (updates) => {
    const next = { ...farmer, ...updates };
    setFarmer(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save farmer profile', e);
    }
  };

  const registerFarmer = async ({ name, phone, region }) => {
    await updateFarmer({ name, phone, region, registered: true, creditScore: 480 });
  };

  return (
    <FarmerContext.Provider value={{ farmer, loading, updateFarmer, registerFarmer }}>
      {children}
    </FarmerContext.Provider>
  );
}

export function useFarmer() {
  const ctx = useContext(FarmerContext);
  if (!ctx) throw new Error('useFarmer must be used within FarmerProvider');
  return ctx;
}
