import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { supabase, isDemoMode } from '../lib/supabase';
import type { Booking, BookingFormData, Service, Employee, TimeSlot, BookingStatus } from '../types';
import { format, parse, addMinutes } from 'date-fns';
import { useToast } from './useToast';
import { bookingService } from '../services/bookingService';

interface SupabaseBooking {
    id: string;
    customer_id: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    employee_id: string;
    employee_name: string;
    service_id: string;
    service_name: string;
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    price: number;
    status: BookingStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// In-memory storage for demo mode
const DEMO_BOOKINGS: Booking[] = [
    {
        id: 'b1',
        customerId: 'demo-user',
        customerName: 'Test Customer',
        customerEmail: 'demo@bookflow.sk',
        customerPhone: '+421900111222',
        employeeId: 'e1',
        employeeName: 'Alena Smith',
        serviceId: 's1',
        serviceName: 'Strih',
        date: new Date(),
        startTime: '10:00',
        endTime: '10:30',
        duration: 30,
        price: 15,
        status: 'confirmed',
        paymentStatus: 'pending',
        notes: 'Demo booking',
        createdAt: new Date(),
        updatedAt: new Date(),
        locationId: 'demo-location'
    }
];

export function useBookings(userId?: string): UseQueryResult<Booking[], Error> {
    return useQuery<Booking[]>({
        queryKey: ['bookings', userId],
        queryFn: async () => {
             // Return copy to avoid direct ref issues, filter by userId if needed (mock logic)
            if (isDemoMode) {
                if (userId) {
                    return [...DEMO_BOOKINGS].filter(b => b.customerId === userId || b.customerId === 'demo-user'); // diligent mock
                }
                return [...DEMO_BOOKINGS];
            }

            let query = supabase.from('bookings').select('*');
            if (userId) {
                query = query.eq('customer_id', userId);
            }

            const { data, error } = await query.order('date', { ascending: false });
            if (error) throw error;

            return (data as SupabaseBooking[]).map(b => ({
                id: b.id,
                customerId: b.customer_id || '',
                customerName: b.customer_name,
                customerEmail: b.customer_email,
                customerPhone: b.customer_phone,
                employeeId: b.employee_id,
                employeeName: b.employee_name || 'Zamestnanec',
                serviceId: b.service_id,
                serviceName: b.service_name || 'Služba',
                date: new Date(b.date),
                startTime: b.start_time,
                endTime: b.end_time,
                duration: b.duration,
                price: b.price,
                status: b.status,
                paymentStatus: 'pending', // Default for now until DB field is confirmed/migrated
                notes: b.notes || '',
                createdAt: new Date(b.created_at),
                updatedAt: new Date(b.updated_at),
                locationId: 'default' // Add default if missing in DB mapping
            })) as Booking[];
        },
    });
}

export function useCreateBooking(): UseMutationResult<SupabaseBooking, Error, { formData: BookingFormData; service: Service; userId?: string }, unknown> {
    const queryClient = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: async (data: { formData: BookingFormData; service: Service; userId?: string }) => {
            if (!data.formData.employeeId) {
                throw new Error("Nebol vybraný žiadny zamestnanec.");
            }
            if (isDemoMode) {
                const { formData, service, userId } = data;
                const startTimeStr = formData.timeSlot;
                const startDate = parse(startTimeStr, 'HH:mm', formData.date!); // Ensure date exists
                const endDate = addMinutes(startDate, service.duration);
                const endTimeStr = format(endDate, 'HH:mm');

                const newBooking: Booking = {
                    id: 'b' + Math.random().toString(36).substr(2, 9),
                    customerId: userId || 'guest',
                    customerName: formData.customerName,
                    customerEmail: formData.customerEmail,
                    customerPhone: formData.customerPhone,
                    employeeId: formData.employeeId!,
                    employeeName: 'Demo Employee', // Simplified for demo
                    serviceId: formData.serviceId,
                    serviceName: service.name,
                    date: formData.date!,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    duration: service.duration,
                    price: service.price,
                    status: 'pending',
                    notes: formData.notes || '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    locationId: formData.locationId || 'demo-location'
                };
                
                DEMO_BOOKINGS.unshift(newBooking); // Add to beginning
                
                // Return as SupabaseBooking to match expected type
                return {
                    ...newBooking,
                    customer_id: newBooking.customerId,
                    customer_name: newBooking.customerName,
                    customer_email: newBooking.customerEmail,
                    customer_phone: newBooking.customerPhone,
                    employee_id: newBooking.employeeId,
                    employee_name: newBooking.employeeName,
                    service_id: newBooking.serviceId,
                    service_name: newBooking.serviceName,
                    date: format(newBooking.date, 'yyyy-MM-dd'),
                    start_time: newBooking.startTime,
                    end_time: newBooking.endTime,
                    created_at: newBooking.createdAt.toISOString(),
                    updated_at: newBooking.updatedAt.toISOString(),
                    location_id: newBooking.locationId
                } as unknown as SupabaseBooking;
            }

            const { formData, service, userId } = data;
            const startTimeStr = formData.timeSlot;
            const startDate = parse(startTimeStr, 'HH:mm', formData.date!);
            const endDate = addMinutes(startDate, service.duration);
            const endTimeStr = format(endDate, 'HH:mm');

            const dbBooking = {
                customer_id: userId,
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone,
                employee_id: formData.employeeId,
                service_id: formData.serviceId,
                date: format(formData.date!, 'yyyy-MM-dd'),
                start_time: startTimeStr,
                end_time: endTimeStr,
                duration: service.duration,
                price: service.price,
                status: 'pending',
                notes: formData.notes,
                location_id: formData.locationId,
            };

            const { data: inserted, error } = await supabase
                .from('bookings')
                .insert(dbBooking)
                .select()
                .single();

            if (error) throw error;
            // Match Supabase return type
            return inserted as SupabaseBooking; 
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Rezervácia vytvorená', 'Vaša rezervácia bola úspešne prijatá.');
            
            // Scheduling notification (mocked for now as we don't have the notification service imported here directly to avoid cycles if any, 
            // but normally we would call notificationService.scheduleBookingReminder here or in component)
        },
        onError: (error) => {
             toast.error('Chyba', error.message || 'Nepodarilo sa vytvoriť rezerváciu.');
        }
    });
}

export function useUpdateBooking(): UseMutationResult<Booking, Error, Partial<Booking> & { id: string }, unknown> {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (bookingUpdate: Partial<Booking> & { id: string }) => {
            if (isDemoMode) {
                const index = DEMO_BOOKINGS.findIndex(b => b.id === bookingUpdate.id);
                if (index !== -1) {
                    const updatedBooking = { ...DEMO_BOOKINGS[index], ...bookingUpdate, updatedAt: new Date() };
                    DEMO_BOOKINGS[index] = updatedBooking;
                    return updatedBooking;
                }
                throw new Error("Booking not found");
            }

            // Map frontend naming to DB naming
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUpdate: any = { updated_at: new Date() };
            if (bookingUpdate.date) dbUpdate.date = format(bookingUpdate.date, 'yyyy-MM-dd');
            if (bookingUpdate.startTime) dbUpdate.start_time = bookingUpdate.startTime;
            if (bookingUpdate.endTime) dbUpdate.end_time = bookingUpdate.endTime;
            if (bookingUpdate.status) dbUpdate.status = bookingUpdate.status;
            if (bookingUpdate.notes) dbUpdate.notes = bookingUpdate.notes;
            if (bookingUpdate.employeeId) dbUpdate.employee_id = bookingUpdate.employeeId;
            if (bookingUpdate.serviceId) dbUpdate.service_id = bookingUpdate.serviceId;

            const { data, error } = await supabase
                .from('bookings')
                .update(dbUpdate)
                .eq('id', bookingUpdate.id)
                .select()
                .single();

            if (error) throw error;
            
             return {
                id: data.id,
                customerId: data.customer_id || '',
                customerName: data.customer_name,
                customerEmail: data.customer_email,
                customerPhone: data.customer_phone,
                employeeId: data.employee_id,
                employeeName: data.employee_name || 'Zamestnanec',
                serviceId: data.service_id,
                serviceName: data.service_name || 'Služba',
                date: new Date(data.date),
                startTime: data.start_time,
                endTime: data.end_time,
                duration: data.duration,
                price: data.price,
                status: data.status,
                notes: data.notes || '',
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                locationId: 'default' 
            } as Booking;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Rezervácia upravená', 'Zmeny boli úspešne uložené.');
        },
        onError: () => {
            toast.error('Chyba', 'Nepodarilo sa upraviť rezerváciu.');
        }
    });
}

export function useCancelBooking(): UseMutationResult<boolean, Error, string, unknown> {
    const queryClient = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: async (bookingId: string) => {
            if (isDemoMode) {
                const index = DEMO_BOOKINGS.findIndex(b => b.id === bookingId);
                if (index !== -1) {
                    DEMO_BOOKINGS[index].status = 'cancelled';
                }
                return true;
            }

            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', bookingId);

            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.info('Rezervácia bola zrušená.');
        },
        onError: (error: Error) => {
            toast.error('Nepodarilo sa zrušiť rezerváciu', error.message);
        },
    });
}

export function useAvailableSlots(date: Date | null, service: Service | undefined, employees: Employee[] | undefined): UseQueryResult<TimeSlot[], Error> {
    return useQuery<TimeSlot[]>({
        queryKey: ['slots', date ? format(date, 'yyyy-MM-dd') : null, service?.id, employees?.length],
        queryFn: async () => {
            if (!date || !service || !employees) return [];
            if (isDemoMode) {
                // Return always available slots for demo testing ease
                return [
                    { id: '1', startTime: parse('09:00', 'HH:mm', date), endTime: parse('09:30', 'HH:mm', date), employeeId: 'e1', isAvailable: true },
                    { id: '2', startTime: parse('10:00', 'HH:mm', date), endTime: parse('10:30', 'HH:mm', date), employeeId: 'e1', isAvailable: true },
                    { id: '3', startTime: parse('11:00', 'HH:mm', date), endTime: parse('11:30', 'HH:mm', date), employeeId: 'e1', isAvailable: true },
                    { id: '4', startTime: parse('12:00', 'HH:mm', date), endTime: parse('12:30', 'HH:mm', date), employeeId: 'e1', isAvailable: true },
                ];
            }
            return bookingService.getAvailableSlots(date, service, employees);
        },
        enabled: !!date && !!service && !!employees,
        staleTime: 1000 * 30, // 30 seconds
    });
}
export function useBlockTime(): UseMutationResult<boolean | SupabaseBooking, Error, { employeeId: string; date: Date; startTime: string; duration: number }, unknown> {
    const queryClient = useQueryClient();
    const toast = useToast();
    return useMutation({
        mutationFn: async (data: { employeeId: string; date: Date; startTime: string; duration: number }) => {
            if (isDemoMode) {
                // Mock blocking logic could go here, for now just succeed
                 return true; 
            }

            const { employeeId, date, startTime, duration } = data;
            const startDate = parse(startTime, 'HH:mm', date);
            const endDate = addMinutes(startDate, duration);
            const endTimeStr = format(endDate, 'HH:mm');

            const dbBooking = {
                customer_name: 'BLOKOVANÉ',
                customer_email: 'blocked@bookflow.sk',
                customer_phone: '',
                employee_id: employeeId,
                service_id: 'blocked', // Placeholder for blocked time
                date: format(date, 'yyyy-MM-dd'),
                start_time: startTime,
                end_time: endTimeStr,
                duration: duration,
                price: 0,
                status: 'confirmed', // Blocked time is auto-confirmed
                notes: 'Administratívne blokovanie termínu',
            };

            const { data: inserted, error } = await supabase
                .from('bookings')
                .insert(dbBooking)
                .select()
                .single();

            if (error) throw error;
            return inserted;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.info('Termín bol úspešne zablokovaný.');
        },
        onError: (error: Error) => {
            toast.error('Chyba pri blokovaní termínu', error.message);
        },
    });
}
