import { create } from 'zustand';

export interface Car {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  mileage: string;
  seats: number;
  fuelType: string;
  transmission: string;
  category: string;
  description: string;
  owner: {
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
  addCar: (car: Car) => void;
  removeCar: (id: string) => void;
  updateCar: (id: string, updates: Partial<Car>) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  searchCars: (query: string) => void;
  filterByBudget: (budget: string) => void;
  getCars: () => Car[];
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
  addCar: (car: Car) => {
    set((state) => ({ cars: [...state.cars, car] }));
  },
  removeCar: (id: string) => {
    set((state) => ({ cars: state.cars.filter((car) => car.id !== id) }));
  },
  updateCar: (id: string, updates: Partial<Car>) => {
    set((state) => ({
      cars: state.cars.map((car) => (car.id === id ? { ...car, ...updates } : car)),
    }));
  },
  toggleFavorite: (id: string) => {
    set((state) => {
      const isFav = state.favorites.includes(id);
      return {
        favorites: isFav ? state.favorites.filter((fav) => fav !== id) : [...state.favorites, id],
      };
    });
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
              car.category.toLowerCase().includes(query.toLowerCase())
          )
        : state.cars,
    }));
  },
  filterByBudget: (budget: string) => {
    set((state) => {
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
