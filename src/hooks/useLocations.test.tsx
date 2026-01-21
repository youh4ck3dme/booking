import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLocations } from './useLocations';

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
        }))
    },
    isDemoMode: true
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useLocations hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns demo locations when in demo mode', async () => {
        const { result } = renderHook(() => useLocations(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.length).toBeGreaterThan(0);
        // Default order should be the one in DEMO_LOCATIONS
        expect(result.current.data?.[0].name).toBe('Klientske centrum Bratislava');
    });

    it('calculates distance and sorts when coords provided', async () => {
        // User in Košice: 48.716, 21.261
        const userInKosice = { lat: 48.716, lng: 21.261 };
        
        const { result } = renderHook(() => useLocations(userInKosice), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        
        const data = result.current.data;
        expect(data).toBeDefined();
        if (data) {
            // Košice branch should be first because distance is 0
            expect(data[0].name).toBe('Pobočka Košice');
            expect(data[0].distance).toBeLessThan(1);
            // Bratislava should be second
            expect(data[1].name).toBe('Klientske centrum Bratislava');
            expect(data[1].distance).toBeGreaterThan(300);
        }
    });
});
