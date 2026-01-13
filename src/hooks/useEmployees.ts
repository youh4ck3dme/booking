import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isDemoMode } from '../lib/supabase';
import type { Employee, WorkingHours } from '../types';

interface SupabaseEmployee {
    id: string;
    user_id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    color: string | null;
    services: string[];
    working_hours: WorkingHours;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
}

const DEMO_EMPLOYEES: Employee[] = [
    { id: 'e1', name: 'Alena Smith', email: 'alena@bookflow.sk', phone: '+421900111222', avatar: '', services: ['s1', 's2', 's4'], color: '#ec4899', workingHours: { monday: { start: '09:00', end: '17:00' }, tuesday: { start: '09:00', end: '17:00' }, wednesday: { start: '09:00', end: '17:00' }, thursday: { start: '09:00', end: '17:00' }, friday: { start: '09:00', end: '15:00' } } },
    { id: 'e2', name: 'Michal Kováč', email: 'michal@bookflow.sk', phone: '+421900333444', avatar: '', services: ['s2', 's3', 's5'], color: '#3b82f6', workingHours: { monday: { start: '10:00', end: '18:00' }, tuesday: { start: '10:00', end: '18:00' }, wednesday: { start: '10:00', end: '18:00' }, thursday: { start: '10:00', end: '18:00' }, friday: { start: '10:00', end: '16:00' } } },
    { id: 'e3', name: 'Peter Horváth', email: 'peter@bookflow.sk', phone: '+421900555666', avatar: '', services: ['s1', 's4', 's6'], color: '#10b981', workingHours: { monday: { start: '08:00', end: '16:00' }, tuesday: { start: '08:00', end: '16:00' }, wednesday: { start: '08:00', end: '16:00' }, thursday: { start: '08:00', end: '16:00' }, friday: { start: '08:00', end: '14:00' } } },
];

export function useEmployees(locationId?: string) {
    return useQuery<Employee[]>({
        queryKey: ['employees', locationId],
        queryFn: async () => {
            if (isDemoMode) return DEMO_EMPLOYEES;

            let query = supabase
                .from('employees')
                .select('*')
                .eq('is_active', true);

            if (locationId) {
                query = query.eq('location_id', locationId);
            }

            const { data, error } = await query.order('name');

            if (error) throw error;

            return (data as SupabaseEmployee[]).map(e => ({
                id: e.id,
                name: e.name,
                email: e.email || '',
                phone: e.phone || '',
                color: e.color || '#6366f1',
                services: e.services || [],
                workingHours: e.working_hours,
                avatar: e.avatar_url || ''
            })) as Employee[];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newEmployee: Omit<Employee, 'id'>) => {
            if (isDemoMode) {
                const id = 'e' + Math.random().toString(36).substr(2, 9);
                return { ...newEmployee, id };
            }

            const { data, error } = await supabase
                .from('employees')
                .insert([{
                    name: newEmployee.name,
                    email: newEmployee.email,
                    phone: newEmployee.phone,
                    color: newEmployee.color,
                    services: newEmployee.services,
                    working_hours: newEmployee.workingHours,
                    avatar_url: newEmployee.avatar,
                    is_active: true
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (employee: Employee) => {
            if (isDemoMode) return employee;

            const { error } = await supabase
                .from('employees')
                .update({
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    color: employee.color,
                    services: employee.services,
                    working_hours: employee.workingHours,
                    avatar_url: employee.avatar
                })
                .eq('id', employee.id);

            if (error) throw error;
            return employee;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

export function useDeleteEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            if (isDemoMode) return id;

            const { error } = await supabase
                .from('employees')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}
