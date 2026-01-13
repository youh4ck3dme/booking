import { format, parse, addMinutes, isWithinInterval } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { TimeSlot, Employee, Service } from '../types';

export const bookingService = {
    async getAvailableSlots(date: Date, service: Service, employees: Employee[]): Promise<TimeSlot[]> {
        const dateStr = format(date, 'yyyy-MM-dd');

        // Fetch bookings for this date
        const { data: dateBookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('date', dateStr)
            .neq('status', 'cancelled');

        if (error) throw error;

        const dayName = format(date, 'EEEE').toLowerCase();
        const slots: TimeSlot[] = [];

        for (const emp of employees) {
            if (!emp.services.includes(service.id)) continue;

            const hours = emp.workingHours[dayName as keyof typeof emp.workingHours];
            if (!hours || !hours.start || !hours.end) continue;

            const workStart = parse(hours.start, 'HH:mm', date);
            const workEnd = parse(hours.end, 'HH:mm', date);

            let currentTime = workStart;
            while (currentTime < workEnd) {
                const slotEnd = addMinutes(currentTime, service.duration);

                if (slotEnd > workEnd) break;

                const hasConflict = (dateBookings || []).some((booking) => {
                    if (booking.employee_id !== emp.id) return false;

                    const bookingStart = parse(booking.start_time, 'HH:mm', date);
                    const bookingEnd = parse(booking.end_time, 'HH:mm', date);

                    return (
                        isWithinInterval(currentTime, { start: bookingStart, end: bookingEnd }) ||
                        isWithinInterval(slotEnd, { start: bookingStart, end: bookingEnd }) ||
                        (currentTime <= bookingStart && slotEnd >= bookingEnd)
                    );
                });

                slots.push({
                    id: `${emp.id}-${format(currentTime, 'HH:mm')}`,
                    startTime: currentTime,
                    endTime: slotEnd,
                    employeeId: emp.id,
                    isAvailable: !hasConflict,
                });

                currentTime = addMinutes(currentTime, 30); // 30min step
            }
        }

        return slots;
    }
};
