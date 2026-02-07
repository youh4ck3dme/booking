import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking, BookingFormData, Service, Employee, TimeSlot } from '../types';
import { format, parse, addMinutes } from 'date-fns';
import { useToast } from './useToast';
import { bookingService } from '../services/bookingService';

export function useBookings(userId?: string) {
    return useQuery<Booking[]>({
        queryKey: ['bookings', userId],
        queryFn: async () => {
            const allBookings: Booking[] = JSON.parse(localStorage.getItem('bf_bookings') || '[]');
            if (userId) {
                return allBookings.filter(b => b.customerId === userId).sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
            }
            return allBookings.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: async (data: { formData: BookingFormData; service: Service; userId?: string }) => {
            const { formData, service, userId } = data;

            const startTimeStr = formData.timeSlot;
            if (!startTimeStr || !formData.date) {
                throw new Error('Chýba čas alebo dátum rezervácie');
            }

            const baseDate = new Date(formData.date);
            if (isNaN(baseDate.getTime())) throw new Error('Neplatný dátum');

            const startDate = parse(startTimeStr, 'HH:mm', baseDate);
            if (isNaN(startDate.getTime())) throw new Error('Neplatný čas');

            const endDate = addMinutes(startDate, service.duration);
            const endTimeStr = format(endDate, 'HH:mm');

            return bookingService.createBooking({
                customerId: userId || 'guest-' + Math.random().toString(36).substr(2, 5),
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                employeeId: formData.employeeId || 'any',
                employeeName: 'Zamestnanec', // Fallback, could be refined
                serviceId: formData.serviceId,
                serviceName: service.name,
                locationId: formData.locationId,
                date: formData.date!,
                startTime: startTimeStr,
                endTime: endTimeStr,
                duration: service.duration,
                price: service.price,
                notes: formData.notes,
            });
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
            const allBookings: Booking[] = JSON.parse(localStorage.getItem('bf_bookings') || '[]');
            const updated = allBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
            localStorage.setItem('bf_bookings', JSON.stringify(updated));
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
            const { employeeId, date, startTime, duration } = data;
            const startDate = parse(startTime, 'HH:mm', date);
            const endDate = addMinutes(startDate, duration);
            const endTimeStr = format(endDate, 'HH:mm');

            return bookingService.createBooking({
                customerId: 'admin-block',
                customerName: 'BLOKOVANÉ',
                customerEmail: 'blocked@bookflow.sk',
                customerPhone: '',
                employeeId: employeeId,
                employeeName: 'Administrátor',
                serviceId: 'blocked',
                serviceName: 'Blokovaný čas',
                locationId: 'admin',
                date: date,
                startTime: startTime,
                endTime: endTimeStr,
                duration: duration,
                price: 0,
                notes: 'Administratívne blokovanie termínu',
            });
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
