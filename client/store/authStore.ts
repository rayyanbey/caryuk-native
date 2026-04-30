import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  bio?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Mock login
    const mockUser: User = {
      id: '1',
      name: 'Justin Kayla',
      email,
      phone: '+1 234 567 8900',
      avatar: '👤',
      location: 'Semarang, Indonesia',
      bio: 'Car enthusiast',
    };
    set({ user: mockUser, isAuthenticated: true });
  },
  signup: async (name: string, email: string, password: string) => {
    const mockUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone: '+1 234 567 8900',
      avatar: '👤',
      location: 'Your Location',
    };
    set({ user: mockUser, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  updateUser: (updates: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
