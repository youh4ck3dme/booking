import { format, parse, addMinutes, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { TimeSlot, Employee, Service, Booking } from '../types';

export const bookingService = {
    /**
     * Get available slots for a specific date and service
     * Uses Supabase for real booking data
     */
    async getAvailableSlots(date: Date, service: Service, employees: Employee[]): Promise<TimeSlot[]> {
        
        // Calculate range for database query to fetch relevant bookings
        // We fetch bookings that overlap with the day
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();

        // Fetch bookings from Supabase
        const { data: sbBookings, error } = await supabase
            .from('bookings')
            .select('*')
            .gte('start_time', dayStart)
            .lte('start_time', dayEnd)
            .neq('status', 'cancelled');

        if (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }

        // Map Supabase rows to app Booking type for compatibility with existing logic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dateBookings: Booking[] = sbBookings.map((b: any) => ({
            id: b.id,
            customerId: b.customer_id,
            customerName: b.customer_name,
            customerEmail: b.customer_email,
            customerPhone: b.customer_phone,
            employeeId: b.employee_id,
            employeeName: 'Unknown', // Not joined in this query, but ID is enough for conflict check
            serviceId: b.service_id,
            serviceName: 'Service',
            locationId: b.location_id,
            date: new Date(b.start_time),
            startTime: format(new Date(b.start_time), 'HH:mm'),
            endTime: format(new Date(b.end_time), 'HH:mm'),
            duration: 0, // Not needed for conflict check
            price: b.price,
            status: b.status,
            createdAt: new Date(b.created_at),
            updatedAt: new Date(b.created_at)
        }));

        const dayName = format(date, 'EEEE').toLowerCase();
        const slots: TimeSlot[] = [];

        for (const emp of employees) {
            // Check if employee provides the service
            if (!emp.services.includes(service.id)) continue;

            // Get working hours (fallback to default if not present)
            const hours = emp.workingHours?.[dayName] || { start: '09:00', end: '17:00' };
            if (!hours || !hours.start || !hours.end) continue;

            const workStart = parse(hours.start, 'HH:mm', date);
            const workEnd = parse(hours.end, 'HH:mm', date);

            let currentTime = workStart;
            while (currentTime < workEnd) {
                const slotEnd = addMinutes(currentTime, service.duration);

                if (slotEnd > workEnd) break;

                const hasConflict = dateBookings.some((booking) => {
                    if (booking.employeeId !== emp.id) return false;

                    const bookingStart = parse(booking.startTime, 'HH:mm', date);
                    const bookingEnd = parse(booking.endTime, 'HH:mm', date);

                    return (
                        isWithinInterval(currentTime, { start: bookingStart, end: bookingEnd }) ||
                        isWithinInterval(slotEnd, { start: bookingStart, end: bookingEnd }) ||
                        (currentTime <= bookingStart && slotEnd >= bookingEnd)
                    );
                });

                slots.push({
                    id: `${emp.id}-${format(date, 'yyyyMMdd')}-${format(currentTime, 'HH:mm')}`,
                    startTime: currentTime,
                    endTime: slotEnd,
                    employeeId: emp.id,
                    isAvailable: !hasConflict,
                });

                currentTime = addMinutes(currentTime, 30); // 30min step
            }
        }

        return slots;
    },

    /**
     * Save a new booking to Supabase
     */
    async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Booking> {
        // Construct timestamps
        const baseDate = new Date(bookingData.date);
        const startTimeDate = parse(bookingData.startTime, 'HH:mm', baseDate);
        const endTimeDate = parse(bookingData.endTime, 'HH:mm', baseDate);

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                customer_id: bookingData.customerId.includes('guest') ? null : bookingData.customerId,
                customer_name: bookingData.customerName,
                customer_email: bookingData.customerEmail,
                customer_phone: bookingData.customerPhone,
                employee_id: bookingData.employeeId,
                service_id: bookingData.serviceId,
                location_id: bookingData.locationId,
                start_time: startTimeDate.toISOString(),
                end_time: endTimeDate.toISOString(),
                status: 'confirmed',
                price: bookingData.price,
                notes: bookingData.notes
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Create Booking Error:', error);
            throw new Error(error.message);
        }

        // Map back to internal type
        return {
            ...bookingData,
            id: data.id,
            status: data.status,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.created_at)
        };
    },

    /**
     * Initiates a booking with payment via Supabase Edge Function
     */
    async initiatePaymentBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
        const { data, error } = await supabase.functions.invoke('create-booking', {
            body: {
                bookingData,
                successUrl: `${window.location.origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/book`
            }
        });

        if (error) throw error;
        return data; // contains url for redirect
    }
};
