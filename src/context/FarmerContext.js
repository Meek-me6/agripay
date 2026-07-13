/**
 * src/context/FarmerContext.js
 *
 * Auth + farmer profile state — backed by the Express backend.
 *
 * Token and farmer profile are persisted in AsyncStorage so the
 * app reopens without re-login.
 *
 * Keys:
 *   jwt              → raw JWT string
 *   agripay:farmer   → JSON-serialised farmer profile (cached)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../config/appConfig';

const FarmerContext = createContext(null);

// ─── tiny helper — no token needed for login/register ────────────────────────
function publicClient() {
  return axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function authedClient() {
  const token = await AsyncStorage.getItem('jwt');
  return axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function FarmerProvider({ children }) {
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  // On mount — try to restore session from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) return;

        // Load cached profile immediately so UI is responsive
        const cached = await AsyncStorage.getItem('agripay:farmer');
        if (cached) setFarmer(JSON.parse(cached));

        // Then refresh from the server in the background
        const client = await authedClient();
        const { data } = await client.get('/auth/me');
        await AsyncStorage.setItem('agripay:farmer', JSON.stringify(data));
        setFarmer(data);
      } catch (e) {
        // Token expired or network error — wipe credentials
        await AsyncStorage.multiRemove(['jwt', 'agripay:farmer']);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── register ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, phone, region, pin, coopGroup }) => {
    setError(null);
    const client = publicClient();
    const { data } = await client.post('/auth/register', {
      name: name.trim(),
      phone: phone.trim(),
      region,
      pin,
      // coopGroup hint — backend will use it as coop_group seed
      coopGroup,
    });
    // { token, farmer }
    await AsyncStorage.setItem('jwt', data.token);
    await AsyncStorage.setItem('agripay:farmer', JSON.stringify(data.farmer));
    setFarmer(data.farmer);
    return data.farmer;
  }, []);

  // ─── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ phone, pin }) => {
    setError(null);
    const client = publicClient();
    const { data } = await client.post('/auth/login', {
      phone: phone.trim(),
      pin,
    });
    // { token, farmer }
    await AsyncStorage.setItem('jwt', data.token);
    await AsyncStorage.setItem('agripay:farmer', JSON.stringify(data.farmer));
    setFarmer(data.farmer);
    return data.farmer;
  }, []);

  // ─── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['jwt', 'agripay:farmer']);
    setFarmer(null);
  }, []);

  // ─── refresh from server ───────────────────────────────────────────────────
  const refreshFarmer = useCallback(async () => {
    try {
      const client = await authedClient();
      const { data } = await client.get('/auth/me');
      await AsyncStorage.setItem('agripay:farmer', JSON.stringify(data));
      setFarmer(data);
      return data;
    } catch (e) {
      // silently ignore network errors
    }
  }, []);

  return (
    <FarmerContext.Provider value={{ farmer, loading, error, setError, register, login, logout, refreshFarmer }}>
      {children}
    </FarmerContext.Provider>
  );
}

export function useFarmer() {
  const ctx = useContext(FarmerContext);
  if (!ctx) throw new Error('useFarmer must be used within FarmerProvider');
  return ctx;
}
