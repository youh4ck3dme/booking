// BookFlow API - Type Definitions
import { z } from 'zod';

// ===========================================
// Request Schemas (Zod Validation)
// ===========================================

export const GetSlotsSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    serviceId: z.string().uuid('Invalid service ID'),
    employeeId: z.string().uuid('Invalid employee ID').optional(),
    locationId: z.string().uuid('Invalid location ID').optional()
});

export const CreateBookingSchema = z.object({
    serviceId: z.string().uuid('Invalid service ID'),
    employeeId: z.string().uuid('Invalid employee ID'),
    locationId: z.string().uuid('Invalid location ID').optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
    customerName: z.string().min(2, 'Name is required'),
    customerEmail: z.string().email('Invalid email'),
    customerPhone: z.string().min(6, 'Phone is required'),
    notes: z.string().optional()
});

export type GetSlotsInput = z.infer<typeof GetSlotsSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

// ===========================================
// Response Types
// ===========================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ServiceResponse {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
    color: string;
    icon?: string;
    locationId?: string;
}

export interface EmployeeResponse {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    services: string[];
    locationId?: string;
}

export interface TimeSlotResponse {
    id: string;
    startTime: string;
    endTime: string;
    employeeId: string;
    employeeName: string;
    isAvailable: boolean;
}

export interface BookingResponse {
    id: string;
    customerName: string;
    customerEmail: string;
    serviceName: string;
    employeeName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
    locationId?: string;
}

export interface WidgetConfigResponse {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    showEmployees: boolean;
    showPrices: boolean;
    locale: string;
    customCss?: string;
}
