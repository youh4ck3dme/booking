import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingService } from './bookingService';
import { supabase } from '../lib/supabase';
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

        // 09:00 to 17:00 = 8 hours
        // 8 hours / 30 mins = 16 slots
        // Actually we step by 30 mins, but the loop ends when slotEnd > workEnd
        expect(slots.length).toBeGreaterThan(0);
        expect(slots[0].startTime.getHours()).toBe(9);
        expect(slots[0].isAvailable).toBe(true);
    });

    it('should mark slots as unavailable if there is a conflict', async () => {
        let testDate = new Date();
        while (format(testDate, 'EEEE') !== 'Monday') {
            testDate = addDays(testDate, 1);
        }

        // Mock a booking at 10:00
        vi.mocked(supabase.from).mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    neq: vi.fn(() => ({
                        data: [{
                            employee_id: 'e1',
                            start_time: '10:00',
                            end_time: '10:30',
                            status: 'confirmed'
                        }],
                        error: null
                    }))
                }))
            }))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const slots = await bookingService.getAvailableSlots(testDate, mockService, mockEmployees);

        const slotAt10 = slots.find(s => format(s.startTime, 'HH:mm') === '10:00');
        expect(slotAt10?.isAvailable).toBe(false);

        const slotAt09 = slots.find(s => format(s.startTime, 'HH:mm') === '09:00');
        expect(slotAt09?.isAvailable).toBe(true);
    });
});
