// ============================================
// BookFlow Pro - TypeScript Type Definitions
// ============================================

// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  points?: number; // Loyalty points
  createdAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'customer';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  businessHours: WorkingHours;
  coordinates?: { lat: number; lng: number };
  distance?: number; // km
}

// ... existing types ...
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
  color: string;
  icon?: string;
  locationId?: string;
  imageUrl?: string;
  employeeIds?: string[];
  // Deposit Configuration
  requireDeposit?: boolean;
  depositAmount?: number; // If fixed amount
  depositPercentage?: number; // If percentage (e.g. 20 for 20%)
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  services: string[]; // service IDs
  workingHours: WorkingHours;
  color: string;
  locationId?: string;
}

export interface WorkingHours {
  [key: string]: { start: string; end: string; breaks?: { start: string; end: string }[] } | null;
  // null = day off
}

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  employeeId: string;
  isAvailable: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string; // duplicate for display ease
  employeeId: string;
  serviceId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  customerId: string;
  employeeId: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  locationId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  // Payment Details
  depositPaid?: number;
  
  notes?: string;
  reviewId?: string; // Optional link to a review
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'sumup' | 'cash';
  transactionId?: string;
  createdAt: Date;
}

// Booking Form Types
export interface BookingFormData {
  locationId: string;
  locationName?: string;
  serviceId: string;
  employeeId?: string;
  date: Date | null;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'book' | 'cancel' | 'reschedule' | 'info';
  label: string;
  data?: Record<string, unknown>;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;
}

// Dashboard Types
export interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  occupancyRate: number;
  topServices: { name: string; count: number }[];
}

export interface BookingFilter {
  status?: BookingStatus[];
  employeeId?: string;
  serviceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// Notification Types
export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// UI Types
export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

export interface UIState {
  theme: Theme;
  notifications: AppNotification[];
}
