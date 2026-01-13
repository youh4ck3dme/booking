import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployees } from './useEmployees';
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

describe('useEmployees Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch employees from supabase', async () => {
        const mockData = [{
            id: 'e1',
            name: 'Emp 1',
            email: 'e@test.com',
            working_hours: {},
            is_active: true
        }];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockResult: any = {
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
                }))
            }))
        };

        vi.mocked(supabase.from).mockReturnValue(mockResult);

        const { result } = renderHook(() => useEmployees(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.length).toBe(1);
        expect(result.current.data?.[0].name).toBe('Emp 1');
    });
});
