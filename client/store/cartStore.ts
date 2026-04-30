import { create } from 'zustand';
import { Car } from './carStore';

export interface CartItem {
  car: Car;
  quantity: number;
  addedAt: Date;
}

interface CartStore {
  items: CartItem[];
  addToCart: (car: Car) => void;
  removeFromCart: (carId: string) => void;
  updateQuantity: (carId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addToCart: (car: Car) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.car.id === car.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.car.id === car.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        items: [...state.items, { car, quantity: 1, addedAt: new Date() }],
      };
    });
  },
  removeFromCart: (carId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.car.id !== carId),
    }));
  },
  updateQuantity: (carId: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.car.id === carId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },
  clearCart: () => {
    set({ items: [] });
  },
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.car.price * item.quantity, 0);
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
