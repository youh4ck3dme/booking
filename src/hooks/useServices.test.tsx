import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useServices } from './useServices';
import { supabase } from '../lib/supabase';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
            }))
        })),
    },
    isDemoMode: false
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useServices Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch services', async () => {
        const mockData = [{ id: 's1', name: 'Service 1', is_active: true }];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockResult: any = {
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
                }))
            }))
        };

        vi.mocked(supabase.from).mockReturnValue(mockResult);

        const { result } = renderHook(() => useServices(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.length).toBe(1);
    });
});
