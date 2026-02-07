import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Service } from '../types';

export function useServices(locationId?: string) {
    return useQuery<Service[]>({
        queryKey: ['services', locationId],
        queryFn: async () => {
            let query = supabase.from('services').select('*');
            
            if (locationId) {
                query = query.eq('location_id', locationId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase Error (Services):', error);
                throw new Error(error.message);
            }

            return data as Service[];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useCreateService() {
    return useMutation({
        mutationFn: async (data: Omit<Service, 'id'>) => {
            console.warn('Create service not yet implemented for WP API', data);
            return { id: 'temp-id', ...data } as Service;
        }
    });
}

export function useUpdateService() {
    return useMutation({
        mutationFn: async (data: Partial<Service>) => {
            console.warn('Update service not yet implemented for WP API', data);
            return data;
        }
    });
}

export function useDeleteService() {
    return useMutation({
        mutationFn: async (id: string) => {
            console.warn('Delete service not yet implemented for WP API', id);
            return id;
        }
    });
}
