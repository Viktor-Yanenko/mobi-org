'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { refreshSession } from '@/lib/client-api';
import {
  getCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '@/lib/auth';
import type { RegisterData, User } from '@/types/api';

interface AuthContextValue {
  user: User | null;
  // true, поки перевіряємо, чи є збережена сесія
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (changes: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // при відкритті сайту пробуємо відновити сесію з refresh-cookie
  useEffect(() => {
    refreshSession()
      .then((token) => (token ? getCurrentUser() : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await loginRequest(email, password);
    setUser(await getCurrentUser());
  };

  const register = async (data: RegisterData) => {
    await registerRequest(data);
    setUser(await getCurrentUser());
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  const updateUser = (changes: Partial<User>) =>
    setUser((current) => current && { ...current, ...changes });

  return (
    <AuthContext
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth можна викликати лише всередині AuthProvider');
  }
  return context;
};
