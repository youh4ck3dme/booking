
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Demo Data
import type { Review, Favorite, Service } from '../types';

export const DEMO_REVIEWS: Review[] = [
  {
    id: 'r1',
    bookingId: 'b_past_1',
    customerId: 'guest',
    customerName: 'Jozef Mak',
    employeeId: 'e1',
    serviceId: 's1',
    rating: 5,
    comment: 'Skvelý strih, som veľmi spokojný!',
    createdAt: new Date('2024-03-10'),
  }
];

export const DEMO_FAVORITES: Favorite[] = [
  { id: 'f1', customerId: 'guest', employeeId: 'e2' }
];

export const DEMO_SERVICES: Omit<Service, 'locationId'>[] = [
  {
    id: 's1',
    name: 'Pánsky strih',
    duration: 30,
    price: 15,
    description: 'Klasický pánsky strih s umytím a stylingom.',
    employeeIds: ['e1', 'e2'],
    category: 'Haircut',
    imageUrl: '/images/services/mens-haircut.jpg',
    color: 'blue'
  },
  {
    id: 's2',
    name: 'Dámsky strih',
    duration: 60,
    price: 30,
    description: 'Dámsky strih s umytím, ošetrením a fúkanou.',
    employeeIds: ['e1', 'e3'],
    category: 'Haircut',
    imageUrl: '/images/services/womens-haircut.jpg',
    color: 'pink'
  },
  {
    id: 's3',
    name: 'Farbenie vlasov',
    duration: 120,
    price: 60,
    description: 'Kompletné farbenie vlasov s konzultáciou.',
    employeeIds: ['e3'],
    category: 'Coloring',
    imageUrl: '/images/services/hair-coloring.jpg',
    color: 'purple'
  },
  {
    id: 's4',
    name: 'Melír',
    duration: 150,
    price: 75,
    description: 'Melírovanie vlasov pre prirodzený vzhľad.',
    employeeIds: ['e3'],
    category: 'Coloring',
    imageUrl: '/images/services/highlights.jpg',
    color: 'yellow'
  },
  {
    id: 's5',
    name: 'Úprava brady',
    duration: 20,
    price: 10,
    description: 'Profesionálna úprava a styling brady.',
    employeeIds: ['e1', 'e2'],
    category: 'Beard',
    imageUrl: '/images/services/beard-trim.jpg',
    color: 'orange'
  },
  {
    id: 's6',
    name: 'Svadobný účes',
    duration: 180,
    price: 100,
    description: 'Komplexný svadobný účes vrátane skúšky.',
    employeeIds: ['e3'],
    category: 'Special Occasion',
    imageUrl: '/images/services/wedding-hair.jpg',
    color: 'red',
    requireDeposit: true,
    depositPercentage: 50 // 50% deposit required
  }
];

// Check if we're in demo mode (no valid Supabase credentials OR forced via localStorage for E2E)
const forceDemo = typeof window !== 'undefined' && window.localStorage.getItem('FORCE_DEMO_MODE') === 'true';

export const isDemoMode = forceDemo || !supabaseUrl ||
    supabaseUrl === 'YOUR_SUPABASE_URL' ||
    !supabaseAnonKey ||
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY';

// Use a valid URL for demo mode to prevent supabase-js from throwing an error
const validSupabaseUrl = isDemoMode ? 'https://placeholder.supabase.co' : supabaseUrl;
const validSupabaseKey = isDemoMode ? 'placeholder' : supabaseAnonKey;

export const supabase = createClient(validSupabaseUrl, validSupabaseKey);
