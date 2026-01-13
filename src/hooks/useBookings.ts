import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useBookings(userId?: string) {
    return useQuery<Booking[]>({
        queryKey: ['bookings', userId],
        queryFn: async () => {
            if (isDemoMode) return [];

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
                notes: b.notes || '',
                createdAt: new Date(b.created_at),
                updatedAt: new Date(b.updated_at),
            })) as Booking[];
        },
        enabled: !isDemoMode,
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (data: { formData: BookingFormData; service: Service; userId?: string }) => {
            if (isDemoMode) throw new Error('Cannot create booking in demo mode');

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
            return inserted as SupabaseBooking;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('Rezervácia bola úspešne vytvorená!');
        },
        onError: (error: Error) => {
            toast.error('Chyba pri vytváraní rezervácie', error.message);
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (bookingId: string) => {
            if (isDemoMode) return true;

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

export function useAvailableSlots(date: Date | null, service: Service | undefined, employees: Employee[] | undefined) {
    return useQuery<TimeSlot[]>({
        queryKey: ['slots', date ? format(date, 'yyyy-MM-dd') : null, service?.id, employees?.length],
        queryFn: async () => {
            if (!date || !service || !employees) return [];
            if (isDemoMode) {
                // Simple demo slots
                return [
                    { id: '1', startTime: parse('09:00', 'HH:mm', date), endTime: parse('09:30', 'HH:mm', date), employeeId: 'e1', isAvailable: true },
                    { id: '2', startTime: parse('10:00', 'HH:mm', date), endTime: parse('10:30', 'HH:mm', date), employeeId: 'e1', isAvailable: false },
                    { id: '3', startTime: parse('11:00', 'HH:mm', date), endTime: parse('11:30', 'HH:mm', date), employeeId: 'e1', isAvailable: true },
                ];
            }
            return bookingService.getAvailableSlots(date, service, employees);
        },
        enabled: !!date && !!service && !!employees,
        staleTime: 1000 * 30, // 30 seconds
    });
}
export function useBlockTime() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (data: { employeeId: string; date: Date; startTime: string; duration: number }) => {
            if (isDemoMode) return true;

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
