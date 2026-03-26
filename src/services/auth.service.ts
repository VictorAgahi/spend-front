import { api } from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterRequest, LoginRequest, TokenResponse, UserResponse } from '../types/auth.types';

export const AuthService = {
  async login(request: LoginRequest): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/users/login', request);
    await AsyncStorage.setItem('accessToken', data.accessToken);
    return data;
  },

  async register(request: RegisterRequest): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/users/register', request);
    await AsyncStorage.setItem('accessToken', data.accessToken);
    return data;
  },

  async getMe(): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>('/users/me');
    return data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('accessToken');
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }
};
