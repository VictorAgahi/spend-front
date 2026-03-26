import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { notificationEvents } from './notification.events';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') return 'http://localhost:3000';
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return 'http://localhost:3000';

  const host = hostUri.split(':')[0];
  return `http://${host}:3000`;
};

const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const is401 = error.response?.status === 401;

    if (!is401) {
      const message = error.response?.data?.message || error.message || 'A network error occurred';
      notificationEvents.emit({
        message,
        type: 'error'
      });
    }

    if (is401) {
      await AsyncStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);
