import { useQuery } from '@tanstack/react-query';
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
    { id: 'e1', name: 'Tomáš Novák', email: 'tomas@bookflow.sk', phone: '+421900111222', avatar: '', services: ['s1', 's4'], color: '#6366f1', workingHours: { monday: { start: '09:00', end: '17:00' }, tuesday: { start: '09:00', end: '17:00' }, wednesday: { start: '09:00', end: '17:00' }, thursday: { start: '09:00', end: '17:00' }, friday: { start: '09:00', end: '15:00' } } },
    { id: 'e2', name: 'Mária Kováčová', email: 'maria@bookflow.sk', phone: '+421900333444', avatar: '', services: ['s2', 's3', 's5'], color: '#8b5cf6', workingHours: { monday: { start: '10:00', end: '18:00' }, tuesday: { start: '10:00', end: '18:00' }, wednesday: { start: '10:00', end: '18:00' }, thursday: { start: '10:00', end: '18:00' }, friday: { start: '10:00', end: '16:00' } } },
    { id: 'e3', name: 'Peter Horváth', email: 'peter@bookflow.sk', phone: '+421900555666', avatar: '', services: ['s1', 's4', 's6'], color: '#10b981', workingHours: { monday: { start: '08:00', end: '16:00' }, tuesday: { start: '08:00', end: '16:00' }, wednesday: { start: '08:00', end: '16:00' }, thursday: { start: '08:00', end: '16:00' }, friday: { start: '08:00', end: '14:00' } } },
];

export function useEmployees() {
    return useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            if (isDemoMode) return DEMO_EMPLOYEES;

            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('is_active', true)
                .order('name');

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
