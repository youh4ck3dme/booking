import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookings, useCreateBooking, useCancelBooking, useAvailableSlots } from './useBookings';
import { supabase } from '../lib/supabase';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                eq: vi.fn(() => ({
                    order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { id: 'new-id' }, error: null }))
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ error: null }))
            }))
        })),
    },
    isDemoMode: false
}));

vi.mock('./useToast', () => ({
    useToast: () => ({
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    })
}));

vi.mock('../services/bookingService', () => ({
    bookingService: {
        getAvailableSlots: vi.fn(() => Promise.resolve([])),
    }
}));

// Test helper for QueryClientProvider
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useBookings Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryBuilder: any = {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
        };
        vi.mocked(supabase.from).mockImplementation(() => queryBuilder);
    });

    it('useBookings should fetch bookings', async () => {
        const mockData = [{
            id: '1',
            customer_id: 'u1',
            customer_name: 'John',
            customer_email: 'john@example.com',
            customer_phone: '123',
            employee_id: 'e1',
            service_id: 's1',
            date: '2025-01-01',
            start_time: '10:00',
            end_time: '11:00',
            duration: 60,
            price: 50,
            status: 'confirmed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockResult: any = {
            select: vi.fn(() => ({
                eq: vi.fn().mockReturnThis(),
                order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
            }))
        };
        vi.mocked(supabase.from).mockReturnValue(mockResult);

        const { result } = renderHook(() => useBookings('u1'), { wrapper: createWrapper() });

        // Wait for success with ample timeout and error check
        await waitFor(() => {
            if (result.current.isError) throw result.current.error;
            expect(result.current.isSuccess).toBe(true);
        }, { timeout: 8000 });

        expect(result.current.data?.length).toBe(1);
    }, 15000); // 15s test timeout

    it('useCreateBooking should call insert', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockInsert: any = {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: { id: 'new-id' }, error: null }))
        };
        vi.mocked(supabase.from).mockReturnValue(mockInsert);

        const { result } = renderHook(() => useCreateBooking(), { wrapper: createWrapper() });

        const formData = {
            serviceId: 's1',
            employeeId: 'e1',
            date: new Date(),
            timeSlot: '10:00',
            customerName: 'Test',
            customerEmail: 'test@test.com',
            customerPhone: '',
            notes: ''
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = { id: 's1', name: 'Service', duration: 30, price: 10 } as any;

        await result.current.mutateAsync({ formData, service, userId: 'u1' });

        expect(supabase.from).toHaveBeenCalledWith('bookings');
    });

    it('useCancelBooking should call update', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockUpdate: any = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn(() => Promise.resolve({ error: null }))
        };
        vi.mocked(supabase.from).mockReturnValue(mockUpdate);

        const { result } = renderHook(() => useCancelBooking(), { wrapper: createWrapper() });

        await result.current.mutateAsync('booking-id');

        expect(supabase.from).toHaveBeenCalledWith('bookings');
    });

    it('useAvailableSlots should return slots', async () => {
        const testDate = new Date();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const service = { id: 's1', duration: 30 } as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const employees = [{ id: 'e1', name: 'Emp' }] as any;

        // Mock the bookingService call specifically here
        const { bookingService } = await import('../services/bookingService');
        vi.mocked(bookingService.getAvailableSlots).mockResolvedValue([]);

        const { result } = renderHook(() => useAvailableSlots(testDate, service, employees), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(Array.isArray(result.current.data)).toBe(true);
    });
});
