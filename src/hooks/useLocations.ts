import { useQuery } from '@tanstack/react-query';
import { supabase, isDemoMode } from '../lib/supabase';
import type { Location } from '../types';

const DEMO_LOCATIONS: Location[] = [
    {
        id: 'l1',
        name: 'Klientske centrum Bratislava',
        address: 'Tomášikova 46, 831 04 Bratislava',
        phone: '+421 2 123 4567',
        email: 'bratislava@bookflow.pro',
        businessHours: {
            monday: { start: '08:00', end: '16:00' },
            tuesday: { start: '08:00', end: '16:00' },
            wednesday: { start: '08:00', end: '20:00' },
            thursday: { start: '08:00', end: '16:00' },
            friday: { start: '08:00', end: '14:00' },
        }
    },
    {
        id: 'l2',
        name: 'Pobočka Košice',
        address: 'Komenského 52, 040 01 Košice',
        phone: '+421 55 987 6543',
        email: 'kosice@bookflow.pro',
        businessHours: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
        }
    }
];

export function useLocations() {
    return useQuery<Location[]>({
        queryKey: ['locations'],
        queryFn: async () => {
            if (isDemoMode) return DEMO_LOCATIONS;

            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .order('name');

            if (error) throw error;

            // Map Snake Case from DB to Camel Case for UI
            return data.map(loc => ({
                id: loc.id,
                name: loc.name,
                address: loc.address,
                phone: loc.phone,
                email: loc.email,
                businessHours: loc.business_hours,
                coordinates: loc.coordinates
            })) as Location[];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
