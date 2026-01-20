import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { supabase, isDemoMode } from '../lib/supabase';
import type { Service } from '../types';

const DEMO_SERVICES: Service[] = [
    { id: 's1', name: 'Strih', description: 'Klasický strih vlasov', duration: 30, price: 15, category: 'hair', color: 'var(--color-secondary)', icon: '✂️' },
    { id: 's2', name: 'Farbenie', description: 'Profesionálne farbenie', duration: 90, price: 45, category: 'hair', color: 'var(--color-secondary-light)', icon: '🎨' },
    { id: 's3', name: 'Styling', description: 'Úprava účesu na udalosť', duration: 45, price: 25, category: 'hair', color: 'var(--color-secondary-dark)', icon: '💇' },
    { id: 's4', name: 'Holenie', description: 'Tradičné holenie britvou', duration: 20, price: 12, category: 'barber', color: 'var(--color-success)', icon: '🪒' },
    { id: 's5', name: 'Manikúra', description: 'Kompletná starostlivosť o nechty', duration: 60, price: 30, category: 'nails', color: 'var(--color-accent)', icon: '💅' },
    { id: 's6', name: 'Masáž', description: 'Relaxačná masáž', duration: 60, price: 40, category: 'wellness', color: 'var(--color-secondary)', icon: '💆' },
];

export function useServices(locationId?: string): UseQueryResult<Service[], Error> {
    return useQuery<Service[]>({
        queryKey: ['services', locationId],
        queryFn: async () => {
            if (isDemoMode) return DEMO_SERVICES;

            let query = supabase
                .from('services')
                .select('*')
                .eq('is_active', true);

            if (locationId) {
                query = query.eq('location_id', locationId);
            }

            const { data, error } = await query.order('name');

            if (error) throw error;
            return data as Service[];
        },
        staleTime: 1000 * 60 * 60, // 1 hour (services don't change often)
    });
}
