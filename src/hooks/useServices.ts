import { useQuery } from '@tanstack/react-query';
import { supabase, isDemoMode } from '../lib/supabase';
import type { Service } from '../types';

const DEMO_SERVICES: Service[] = [
    { id: 's1', name: 'Strih', description: 'Klasický strih vlasov', duration: 30, price: 15, category: 'hair', color: '#6366f1', icon: '✂️' },
    { id: 's2', name: 'Farbenie', description: 'Profesionálne farbenie', duration: 90, price: 45, category: 'hair', color: '#8b5cf6', icon: '🎨' },
    { id: 's3', name: 'Styling', description: 'Úprava účesu na udalosť', duration: 45, price: 25, category: 'hair', color: '#06b6d4', icon: '💇' },
    { id: 's4', name: 'Holenie', description: 'Tradičné holenie britvou', duration: 20, price: 12, category: 'barber', color: '#10b981', icon: '🪒' },
    { id: 's5', name: 'Manikúra', description: 'Kompletná starostlivosť o nechty', duration: 60, price: 30, category: 'nails', color: '#f59e0b', icon: '💅' },
    { id: 's6', name: 'Masáž', description: 'Relaxačná masáž', duration: 60, price: 40, category: 'wellness', color: '#ef4444', icon: '💆' },
];

export function useServices(locationId?: string) {
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
