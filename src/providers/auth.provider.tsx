import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthService } from '../services/auth.service';
import { UserResponse } from '../types/auth.types';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isWelcome = segments.length <= 1;

    if (!user && !inAuthGroup && !isWelcome) {
      router.replace('/(auth)/login');
    } else if (user && (inAuthGroup || isWelcome)) {
      router.replace('/(main)');
    }
  }, [user, segments, isLoading]);

  const checkAuth = async () => {
    try {
      const token = await AuthService.getStoredToken();
      if (token) {
        const userData = await AuthService.getMe();
        setUser(userData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string) => {
    const userData = await AuthService.getMe();
    setUser(userData);
  };

  const signOut = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
