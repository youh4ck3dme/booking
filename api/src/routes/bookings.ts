// BookFlow API - Bookings Routes
import { Router, Request, Response } from 'express';
import { supabase, isDemoMode } from '../config/database.js';
import {
    TimeSlotResponse,
    BookingResponse,
    GetSlotsSchema,
    CreateBookingSchema
} from '../types/api.js';
import { bookingRateLimiter } from '../middleware/rateLimit.js';

const router: Router = Router();

// Demo working hours
const DEMO_WORKING_HOURS = {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '10:00', end: '14:00' },
    sunday: null
};

/**
 * Generate time slots for a given date and duration
 */
function generateTimeSlots(
    date: string,
    duration: number,
    workingHours: typeof DEMO_WORKING_HOURS,
    existingBookings: Array<{ start_time: string; end_time: string }> = []
): Array<{ start: string; end: string; available: boolean }> {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof DEMO_WORKING_HOURS;
    const hours = workingHours[dayName];

    if (!hours) return [];

    const slots: Array<{ start: string; end: string; available: boolean }> = [];
    const [startHour, startMin] = hours.start.split(':').map(Number);
    const [endHour, endMin] = hours.end.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + duration <= endMinutes) {
        const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
        const slotEndMin = currentMinutes + duration;
        const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`;

        // Check if slot conflicts with existing bookings
        const isAvailable = !existingBookings.some(booking => {
            const bookingStart = booking.start_time;
            const bookingEnd = booking.end_time;
            return (slotStart < bookingEnd && slotEnd > bookingStart);
        });

        slots.push({ start: slotStart, end: slotEnd, available: isAvailable });
        currentMinutes += 30; // 30 min intervals
    }

    return slots;
}

/**
 * GET /api/v1/slots
 * Returns available time slots for a date/service/employee
 */
router.get('/slots', async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = GetSlotsSchema.safeParse(req.query);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: validation.error.errors[0].message
            });
            return;
        }

        const { date, serviceId, employeeId, locationId } = validation.data;

        if (isDemoMode) {
            // Demo mode: return sample slots
            const slots = generateTimeSlots(date, 45, DEMO_WORKING_HOURS);
            const response: TimeSlotResponse[] = slots.map((slot, idx) => ({
                id: `demo-${idx}`,
                startTime: slot.start,
                endTime: slot.end,
                employeeId: employeeId || '1',
                employeeName: 'Demo Employee',
                isAvailable: slot.available
            }));
            res.json({ success: true, data: response });
            return;
        }

        // Fetch service to get duration and location_id
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('duration, location_id')
            .eq('id', serviceId)
            .single();

        if (serviceError || !service) {
            res.status(404).json({ success: false, error: 'Service not found' });
            return;
        }

        // Fetch employees that can perform this service
        let employeeQuery = supabase
            .from('employees')
            .select('id, name, working_hours, location_id')
            .eq('is_active', true)
            .contains('services', [serviceId]);

        if (employeeId) {
            employeeQuery = employeeQuery.eq('id', employeeId);
        }

        if (locationId) {
            employeeQuery = employeeQuery.eq('location_id', locationId);
        } else if (service?.location_id) {
            employeeQuery = employeeQuery.eq('location_id', service.location_id);
        }

        const { data: employees, error: employeeError } = await employeeQuery;

        if (employeeError) throw employeeError;

        // Fetch existing bookings for this date and optionally location
        let bookingQuery = supabase
            .from('bookings')
            .select('employee_id, start_time, end_time')
            .eq('date', date)
            .neq('status', 'cancelled');

        if (locationId) {
            bookingQuery = bookingQuery.eq('location_id', locationId);
        } else if (service?.location_id) {
            bookingQuery = bookingQuery.eq('location_id', service.location_id);
        }

        const { data: bookings, error: bookingError } = await bookingQuery;

        if (bookingError) throw bookingError;

        // Generate slots for each employee
        const allSlots: TimeSlotResponse[] = [];

        for (const emp of employees || []) {
            const empBookings = (bookings || [])
                .filter(b => b.employee_id === emp.id)
                .map(b => ({ start_time: b.start_time, end_time: b.end_time }));

            const slots = generateTimeSlots(date, service.duration, emp.working_hours, empBookings);

            slots.forEach((slot) => {
                allSlots.push({
                    id: `${emp.id}-${slot.start}`,
                    startTime: slot.start,
                    endTime: slot.end,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    isAvailable: slot.available
                });
            });
        }

        res.json({ success: true, data: allSlots });

    } catch (err) {
        console.error('Slots fetch error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch slots'
        });
    }
});

/**
 * POST /api/v1/bookings
 * Create a new booking
 */
router.post('/', bookingRateLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = CreateBookingSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: validation.error.errors[0].message
            });
            return;
        }

        const data = validation.data;

        if (isDemoMode) {
            // Demo mode: return fake booking confirmation
            const demoBooking: BookingResponse = {
                id: `demo-${Date.now()}`,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                serviceName: 'Demo Service',
                employeeName: 'Demo Employee',
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                status: 'confirmed',
                createdAt: new Date().toISOString(),
                locationId: data.locationId
            };
            res.status(201).json({ success: true, data: demoBooking });
            return;
        }

        // Fetch service and employee details
        const [{ data: service }, { data: employee }] = await Promise.all([
            supabase.from('services').select('name, duration, price, location_id').eq('id', data.serviceId).single(),
            supabase.from('employees').select('name, location_id').eq('id', data.employeeId).single()
        ]);

        if (!service || !employee) {
            res.status(400).json({ success: false, error: 'Invalid service or employee' });
            return;
        }

        // Check slot availability
        const { data: conflictingBookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('employee_id', data.employeeId)
            .eq('date', data.date)
            .neq('status', 'cancelled')
            .or(`start_time.lt.${data.endTime},end_time.gt.${data.startTime}`);

        if (conflictingBookings && conflictingBookings.length > 0) {
            res.status(409).json({
                success: false,
                error: 'Slot no longer available',
                message: 'This time slot has been booked by someone else'
            });
            return;
        }

        // Create booking
        const { data: newBooking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                service_id: data.serviceId,
                employee_id: data.employeeId,
                location_id: data.locationId || service.location_id,
                date: data.date,
                start_time: data.startTime,
                end_time: data.endTime,
                duration: service.duration,
                price: service.price,
                customer_name: data.customerName,
                customer_email: data.customerEmail,
                customer_phone: data.customerPhone,
                notes: data.notes,
                status: 'confirmed'
            })
            .select()
            .single();

        if (bookingError) throw bookingError;

        const response: BookingResponse = {
            id: newBooking.id,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            serviceName: service.name,
            employeeName: employee.name,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            status: 'confirmed',
            createdAt: newBooking.created_at,
            locationId: newBooking.location_id
        };

        res.status(201).json({ success: true, data: response });

    } catch (err) {
        console.error('Booking creation error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking'
        });
    }
});

/**
 * GET /api/v1/bookings/:id
 * Get booking by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (isDemoMode) {
            res.json({
                success: true,
                data: {
                    id,
                    customerName: 'Demo Customer',
                    customerEmail: 'demo@example.com',
                    serviceName: 'Demo Service',
                    employeeName: 'Demo Employee',
                    date: new Date().toISOString().split('T')[0],
                    startTime: '10:00',
                    endTime: '10:45',
                    status: 'confirmed',
                    createdAt: new Date().toISOString()
                }
            });
            return;
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id, customer_name, customer_email, date, start_time, end_time, status, created_at, location_id,
                services(name),
                employees(name)
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            res.status(404).json({ success: false, error: 'Booking not found' });
            return;
        }

        res.json({
            success: true,
            data: {
                id: data.id,
                customerName: data.customer_name,
                customerEmail: data.customer_email,
                serviceName: (data.services as unknown as { name: string })?.name,
                employeeName: (data.employees as unknown as { name: string })?.name,
                date: data.date,
                startTime: data.start_time,
                endTime: data.end_time,
                status: data.status,
                createdAt: data.created_at,
                locationId: data.location_id
            }
        });

    } catch (err) {
        console.error('Booking fetch error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking'
        });
    }
});

/**
 * PUT /api/v1/bookings/:id/cancel
 * Cancel a booking
 */
router.put('/:id/cancel', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (isDemoMode) {
            res.json({ success: true, message: 'Booking cancelled successfully' });
            return;
        }

        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Booking cancelled successfully' });

    } catch (err) {
        console.error('Booking cancellation error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking'
        });
    }
});

export default router;
