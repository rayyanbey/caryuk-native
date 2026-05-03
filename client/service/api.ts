import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  token?: string;
  refreshToken?: string;
}

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              const newToken = response.data.data?.token || response.data.token;
              await AsyncStorage.setItem('authToken', newToken);

              this.isRefreshing = false;
              this.processQueue(null, newToken);

              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            } else {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('refreshToken');
              this.isRefreshing = false;
              this.processQueue(new Error('Refresh token not found'), null);
              return Promise.reject(error);
            }
          } catch (err) {
            this.isRefreshing = false;
            this.processQueue(err, null);
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('refreshToken');
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  async login(email: string, password: string) {
    try {
      const response = await this.api.post<ApiResponse<any>>('/auth/login', {
        email,
        password,
      });

      if (response.data.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
      }
      if (response.data.data?.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone?: string
  ) {
    try {
      const response = await this.api.post<ApiResponse<any>>('/auth/signup', {
        name,
        email,
        password,
        confirmPassword,
        phone,
      });

      if (response.data.data?.token) {
        await AsyncStorage.setItem('authToken', response.data.data.token);
      }
      if (response.data.data?.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
    }
  }

  async getCars(limit?: number, skip?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (skip) params.append('skip', String(skip));

    return this.api.get(`/cars?${params.toString()}`);
  }

  async getCarById(id: string) {
    return this.api.get(`/cars/${id}`);
  }

  async searchCars(query: string) {
    return this.api.get('/cars/search', { params: { q: query } });
  }

  async filterCars(filters: any) {
    return this.api.post('/cars/filter', filters);
  }

  async addToCart(carId: string, quantity: number = 1) {
    return this.api.post('/cart', { carId, quantity });
  }

  async removeFromCart(carId: string) {
    return this.api.delete(`/cart/${carId}`);
  }

  async getCart() {
    return this.api.get('/cart');
  }

  async clearCart() {
    return this.api.delete('/cart');
  }

  async addToFavorites(carId: string) {
    return this.api.post(`/user/favorites/${carId}`);
  }

  async removeFromFavorites(carId: string) {
    return this.api.delete(`/user/favorites/${carId}`);
  }

  async getFavorites() {
    return this.api.get('/user/favorites');
  }

  async getUserProfile() {
    return this.api.get('/user/profile');
  }

  async updateUserProfile(data: any) {
    return this.api.put('/user/profile', data);
  }

  async getOrders() {
    return this.api.get('/orders');
  }

  async getOrderById(id: string) {
    return this.api.get(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.api.post('/orders', data);
  }

  async createPaymentIntent(amount: number) {
    return this.api.post('/payment/create-intent', { amount });
  }

  async getSearchHistory() {
    return this.api.get('/search-history');
  }

  async addSearchHistory(query: string) {
    return this.api.post('/search-history', { query });
  }
}

export const apiService = new ApiService();