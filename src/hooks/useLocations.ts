import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Location } from '../types';

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

export function useLocations(userCoords?: { lat: number, lng: number }) {
    return useQuery<Location[]>({
        queryKey: ['locations', userCoords],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('locations')
                .select('*');

            if (error) {
                console.error('Supabase Error (Locations):', error);
                throw new Error(error.message);
            }

            const locations = data as Location[];

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
                }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
            }

            return locations;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
