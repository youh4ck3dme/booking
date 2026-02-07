import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types';

export function useEmployees(locationId?: string) {
    return useQuery<Employee[]>({
        queryKey: ['employees', locationId],
        queryFn: async () => {
            let query = supabase.from('employees').select('*');

            if (locationId) {
                query = query.eq('location_id', locationId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase Error (Employees):', error);
                throw new Error(error.message);
            }

            return data as Employee[];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useCreateEmployee() {
    return useMutation({
        mutationFn: async (data: Omit<Employee, 'id'>) => {
            console.warn('Create employee not yet implemented for WP API', data);
            return { id: 'temp-id', ...data } as Employee;
        }
    });
}

export function useUpdateEmployee() {
    return useMutation({
        mutationFn: async (data: Partial<Employee>) => {
            console.warn('Update employee not yet implemented for WP API', data);
            return data;
        }
    });
}

export function useDeleteEmployee() {
    return useMutation({
        mutationFn: async (id: string) => {
            console.warn('Delete employee not yet implemented for WP API', id);
            return id;
        }
    });
}
