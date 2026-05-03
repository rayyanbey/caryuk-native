import { create } from 'zustand';
import { apiService } from '@/service/api';

export interface Car {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  mileage?: string;
  seats?: number;
  fuelType?: string;
  transmission?: string;
  category?: string;
  description?: string;
  color?: string;
  owner?: {
    name: string;
    role: string;
    avatar: string;
  };
  isFavorite?: boolean;
}

interface CarStore {
  cars: Car[];
  favorites: string[];
  filteredCars: Car[];
  searchQuery: string;
  selectedBudget: string;
  isLoading: boolean;
  error: string | null;
  fetchCars: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addCar: (car: Car) => void;
  removeCar: (id: string) => void;
  updateCar: (id: string, updates: Partial<Car>) => void;
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  searchCars: (query: string) => void;
  filterByBudget: (budget: string) => void;
  getCars: () => Car[];
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const mockCars: Car[] = [
  {
    id: '1',
    name: 'Nissan Skyline 90s',
    price: 90000,
    image: '🚗',
    rating: 5.0,
    reviews: 12,
    mileage: '5000km',
    seats: 2,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    category: 'Sportscar',
    description:
      'Classic 90s Nissan Skyline in excellent condition. Fully restored with original engine. Perfect for collectors and enthusiasts.',
    owner: {
      name: 'Caryuk Store',
      role: 'Owner',
      avatar: 'R',
    },
  },
  {
    id: '2',
    name: 'Mazda RX-7',
    price: 85000,
    image: '🏎️',
    rating: 4.8,
    reviews: 8,
    mileage: '8000km',
    seats: 2,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    category: 'Sportscar',
    description: 'Legendary Mazda RX-7 with rotary engine. Smooth handling and classic design.',
    owner: {
      name: 'Caryuk Store',
      role: 'Owner',
      avatar: 'R',
    },
  },
  {
    id: '3',
    name: 'Mustang Valentine',
    price: 75000,
    image: '🐎',
    rating: 4.9,
    reviews: 15,
    mileage: '12000km',
    seats: 4,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    category: 'Muscle Car',
    description: 'American classic with powerful V8 engine. Great cruiser for road trips.',
    owner: {
      name: 'Caryuk Store',
      role: 'Owner',
      avatar: 'R',
    },
  },
  {
    id: '4',
    name: 'Toyota Supra',
    price: 95000,
    image: '⚡',
    rating: 5.0,
    reviews: 20,
    mileage: '3000km',
    seats: 2,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    category: 'Sportscar',
    description: 'Iconic Toyota Supra with twin-turbo engine. Perfect performance machine.',
    owner: {
      name: 'Caryuk Store',
      role: 'Owner',
      avatar: 'R',
    },
  },
  {
    id: '5',
    name: 'Lancer EVO',
    price: 70000,
    image: '🚙',
    rating: 4.7,
    reviews: 10,
    mileage: '15000km',
    seats: 4,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    category: 'Sports Sedan',
    description: 'Mitsubishi Lancer Evolution with excellent handling dynamics.',
    owner: {
      name: 'Caryuk Store',
      role: 'Owner',
      avatar: 'R',
    },
  },
];

export const useCarStore = create<CarStore>((set, get) => ({
  cars: mockCars,
  favorites: [],
  filteredCars: mockCars,
  searchQuery: '',
  selectedBudget: '',
  isLoading: false,
  error: null,
  searchHistory: ['Nissan GTR', 'Toyota Scar', 'Toyota Supra', 'Mazda RX-7', 'Supra MK4', 'Lancer Tokyo'],

  addSearchHistory: (query: string) => {
    set((state) => ({
      searchHistory: [query, ...state.searchHistory.filter((item) => item !== query)].slice(0, 10),
    }));
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
  },

  fetchCars: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getCars();
      const apiCars = response.data.data || response.data;
      let normalizedCars = Array.isArray(apiCars) ? apiCars : mockCars;
      
      // Ensure all cars have required frontend fields, mapping from MongoDB schema
      normalizedCars = normalizedCars.map((car: any) => ({ 
        ...car, 
        id: car.id || car._id,
        name: car.name || car.title || `${car.brand} ${car.model}`,
        rating: typeof car.rating === 'number' ? car.rating : 5.0,
        price: typeof car.price === 'number' ? car.price : 0,
        image: car.image || '🚗'
      }));
      
      set({ cars: normalizedCars, filteredCars: normalizedCars, isLoading: false });
    } catch (error: any) {
      console.warn('Failed to fetch cars, using mock data:', error.message);
      set({ cars: mockCars, filteredCars: mockCars, isLoading: false });
    }
  },

  fetchFavorites: async () => {
    try {
      const response = await apiService.getFavorites();
      const favCars = response.data.data;
      if (favCars && Array.isArray(favCars)) {
         set({ favorites: favCars.map((c: any) => c._id || c.id) });
      }
    } catch (error: any) {
      console.warn('Failed to fetch favorites:', error.message);
    }
  },

  addCar: (car: Car) => {
    set((state) => ({ cars: [...state.cars, car] }));
  },

  removeCar: (id: string) => {
    set((state) => ({ cars: state.cars.filter((car) => car.id !== id && car._id !== id) }));
  },

  updateCar: (id: string, updates: Partial<Car>) => {
    set((state) => ({
      cars: state.cars.map((car) => (car.id === id || car._id === id ? { ...car, ...updates } : car)),
    }));
  },

  toggleFavorite: async (id: string) => {
    const isFav = get().isFavorite(id);
    try {
      if (isFav) {
        await apiService.removeFromFavorites(id);
      } else {
        await apiService.addToFavorites(id);
      }
      set((state) => ({
        favorites: isFav ? state.favorites.filter((fav) => fav !== id) : [...state.favorites, id],
      }));
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error.message);
      set((state) => ({
        favorites: isFav ? state.favorites.filter((fav) => fav !== id) : [...state.favorites, id],
      }));
    }
  },

  isFavorite: (id: string) => {
    return get().favorites.includes(id);
  },

  searchCars: (query: string) => {
    set((state) => ({
      searchQuery: query,
      filteredCars: query
        ? state.cars.filter(
            (car) =>
              car.name.toLowerCase().includes(query.toLowerCase()) ||
              car.category?.toLowerCase().includes(query.toLowerCase())
          )
        : state.cars,
    }));
  },

  filterByBudget: (budget: string) => {
    set((state) => {
      if (state.selectedBudget === budget) {
        return { selectedBudget: '', filteredCars: state.cars };
      }
      
      let filtered = state.cars;
      if (budget === 'Under $30k') {
        filtered = filtered.filter((car) => car.price < 30000);
      } else if (budget === 'From $40k-90k') {
        filtered = filtered.filter((car) => car.price >= 40000 && car.price <= 90000);
      }
      return { selectedBudget: budget, filteredCars: filtered };
    });
  },

  getCars: () => get().filteredCars,
}));
