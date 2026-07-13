/**
 * src/api/backendClient.js
 *
 * Factory that returns an axios instance pre-configured with:
 *   - baseURL from appConfig
 *   - Authorization: Bearer <jwt> header (loaded from AsyncStorage)
 *   - 30-second timeout
 *
 * Usage:
 *   const client = await backendClient();
 *   const { data } = await client.get('/some-route');
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/appConfig';

export default async function backendClient() {
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
