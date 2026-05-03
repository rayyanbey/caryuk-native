// Shared types used across the app

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Car {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  mileage: string;
  seats: number;
  fuelType: string;
  transmission: string;
  description?: string;
  features?: string[];
}

export interface CartItem {
  carId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'succeeded' | 'processing';
  clientSecret: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchParams {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  page?: number;
  limit?: number;
}

export interface FilterParams {
  budget?: number;
  category?: string;
  rating?: number;
}

export type TabType = 'home' | 'search' | 'favorites' | 'profile';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
  loading: boolean;
  error: string | null;
}

export interface CarState {
  cars: Car[];
  filteredCars: Car[];
  favorites: string[];
  searchQuery: string;
  selectedBudget: number | null;
  loading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  loading: boolean;
  error: string | null;
}
