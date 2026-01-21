import { useQuery, type UseQueryResult } from '@tanstack/react-query';
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

// Helper to calculate distance between two coordinates (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function useLocations(userCoords?: { lat: number, lng: number }): UseQueryResult<Location[], Error> {
    return useQuery<Location[]>({
        queryKey: ['locations', userCoords],
        queryFn: async () => {
            let locations: Location[] = [];

            if (isDemoMode) {
                // Return fresh copies to avoid polluting constant references across renders/tests
                locations = DEMO_LOCATIONS.map((loc, idx) => ({
                    ...loc,
                    coordinates: idx === 0 ? { lat: 48.148, lng: 17.107 } : 
                              idx === 1 ? { lat: 48.716, lng: 21.261 } : 
                              undefined
                }));
            } else {
                const { data, error } = await supabase
                    .from('locations')
                    .select('*')
                    .order('name');

                if (error) throw error;

                locations = data.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    address: loc.address,
                    phone: loc.phone,
                    email: loc.email,
                    businessHours: loc.business_hours,
                    coordinates: loc.coordinates
                })) as Location[];
            }

            // Calculate distances and sort if user coordinates are available
            if (userCoords && locations.length > 0) {
                return locations.map(loc => {
                    if (loc.coordinates) {
                        return {
                            ...loc,
                            distance: getDistance(
                                userCoords.lat,
                                userCoords.lng,
                                loc.coordinates.lat,
                                loc.coordinates.lng
                            )
                        };
                    }
                    return loc;
                }).sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
            }

            return locations;
        },
        staleTime: 1000 * 60 * 6, // 6 minutes
    });
}
