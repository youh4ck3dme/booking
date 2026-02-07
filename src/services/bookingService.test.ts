import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingService } from './bookingService';
import { addDays, format } from 'date-fns';
import type { Employee, Service } from '../types';

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    neq: vi.fn(() => ({
                        data: [],
                        error: null
                    })),
                    gte: vi.fn(() => ({
                        lte: vi.fn(() => ({
                            neq: vi.fn(() => ({
                                data: [],
                                error: null
                            }))
                        }))
                    }))
                })),
                gte: vi.fn(() => ({
                    lte: vi.fn(() => ({
                        neq: vi.fn(() => ({
                            data: [],
                            error: null
                        }))
                    }))
                }))
            }))
        }))
    }
}));

const mockService: Service = {
    id: 's1',
    name: 'Strihanie',
    description: 'Klasický strih',
    duration: 30,
    price: 20,
    category: 'vlasy',
    icon: '✂️',
    color: '#6366f1'
};

const mockEmployees: Employee[] = [
    {
        id: 'e1',
        name: 'Tomáš',
        email: 'tomas@test.sk',
        phone: '',
        avatar: '',
        color: '#6366f1',
        services: ['s1'],
        workingHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' }
        }
    }
];

describe('bookingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate slots for an employee', async () => {
        // Next Monday
        let testDate = new Date();
        while (format(testDate, 'EEEE') !== 'Monday') {
            testDate = addDays(testDate, 1);
        }

        const slots = await bookingService.getAvailableSlots(testDate, mockService, mockEmployees);

        expect(slots.length).toBeGreaterThan(0);
        expect(slots[0].startTime.getHours()).toBe(9);
        expect(slots[0].isAvailable).toBe(true);
    });

    it('should mark slots as unavailable if there is a conflict', async () => {
        let testDate = new Date();
        while (format(testDate, 'EEEE') !== 'Monday') {
            testDate = addDays(testDate, 1);
        }

        // Create a conflicting booking mock response from Supabase
        const conflictBooking = {
            id: 'b-conflict',
            employee_id: 'e1',
            start_time: new Date(testDate.setHours(10, 0, 0, 0)).toISOString(),
            end_time: new Date(testDate.setHours(10, 30, 0, 0)).toISOString(),
            status: 'confirmed',
            price: 20
        };

        // Update the mock to return this booking
        const { supabase } = await import('../lib/supabase');
        
        // We need to carefully mock the chain: .from().select().gte().lte().neq()
        // The current top-level mock returns empty list by default.
        // We override the implementation for this test.
        
        const mockSelect = vi.fn().mockImplementation(() => ({
            gte: vi.fn().mockImplementation(() => ({
                lte: vi.fn().mockImplementation(() => ({
                    neq: vi.fn().mockReturnValue({
                        data: [conflictBooking],
                        error: null
                    })
                }))
            }))
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockImplementation(() => ({
            select: mockSelect
        }));

        const slots = await bookingService.getAvailableSlots(testDate, mockService, mockEmployees);

        const slotAt10 = slots.find(s => format(s.startTime, 'HH:mm') === '10:00');
        expect(slotAt10?.isAvailable).toBe(false);

        const slotAt09 = slots.find(s => format(s.startTime, 'HH:mm') === '09:00');
        expect(slotAt09?.isAvailable).toBe(true);
    });
});
