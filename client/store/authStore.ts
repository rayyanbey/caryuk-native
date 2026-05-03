import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/service/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  favourites?: string[];
  isActive?: boolean;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string, confirmPassword: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  restoreToken: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.login(email, password);

      const userData = response.data.data?.user || response.data.data;
      set({ user: userData, isAuthenticated: true, isLoading: false });

      // Store user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      return { success: false, message: errorMessage };
    }
  },

  signup: async (name: string, email: string, password: string, confirmPassword: string, phone?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.signup(name, email, password, confirmPassword, phone);

      const userData = response.data.data?.user || response.data.data;
      set({ user: userData, isAuthenticated: true, isLoading: false });

      // Store user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return { success: true, message: 'Signup successful' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Signup failed';
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      return { success: false, message: errorMessage };
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await apiService.logout();
      set({ user: null, isAuthenticated: false, error: null, isLoading: false });
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...updates } : null;
      if (updatedUser) {
        AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },

  restoreToken: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        const user = JSON.parse(userData);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error restoring token:', error);
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
