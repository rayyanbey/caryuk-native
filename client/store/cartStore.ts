import { create } from 'zustand';
import { apiService } from '@/service/api';
import { Car } from './carStore';

export interface CartItem {
  _id?: string;
  car: Car;
  quantity: number;
  addedAt: Date;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (car: Car) => Promise<void>;
  removeFromCart: (carId: string) => Promise<void>;
  updateQuantity: (carId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  addToCart: async (car: Car) => {
    try {
      set({ isLoading: true, error: null });
      const carId = car._id || car.id;
      
      const existingItem = get().items.find((item) => (item.car._id || item.car.id) === carId);
      if (existingItem) {
        set({ isLoading: false });
        return; // Already in cart, do nothing
      }

      await apiService.addToCart(carId, 1);

      set((state) => ({
        items: [...state.items, { car, quantity: 1, addedAt: new Date() }],
        isLoading: false,
      }));
    } catch (error: any) {
      console.warn('Failed to add to cart via API, using local state:', error.message);
      set((state) => {
        const existingItem = state.items.find((item) => (item.car._id || item.car.id) === (car._id || car.id));
        if (existingItem) return { isLoading: false };
        return {
          items: [...state.items, { car, quantity: 1, addedAt: new Date() }],
          isLoading: false,
        };
      });
    }
  },

  removeFromCart: async (carId: string) => {
    try {
      set({ isLoading: true, error: null });
      await apiService.removeFromCart(carId);
      set((state) => ({
        items: state.items.filter((item) => (item.car._id || item.car.id) !== carId),
        isLoading: false,
      }));
    } catch (error: any) {
      console.warn('Failed to remove from cart via API, using local state:', error.message);
      set((state) => ({
        items: state.items.filter((item) => (item.car._id || item.car.id) !== carId),
        isLoading: false,
      }));
    }
  },

  updateQuantity: (carId: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        (item.car._id || item.car.id) === carId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },

  clearCart: async () => {
    try {
      set({ isLoading: true, error: null });
      await apiService.clearCart();
      set({ items: [], isLoading: false });
    } catch (error: any) {
      console.warn('Failed to clear cart via API, using local state:', error.message);
      set({ items: [], isLoading: false });
    }
  },

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getCart();
      const cartData = response.data.data || response.data;
      const items = Array.isArray(cartData) ? cartData : cartData.items || [];
      set({ items, isLoading: false });
    } catch (error: any) {
      console.warn('Failed to fetch cart:', error.message);
      set({ isLoading: false });
    }
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.car.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
