import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyBookings } from './MyBookings';
import { useAuthStore } from '../stores/authStore';
import { useBookings, useCancelBooking } from '../hooks/useBookings';

vi.mock('../stores/authStore');
vi.mock('../hooks/useBookings');

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
    );
};

describe('MyBookings Page', () => {
    const mockUser = { id: 'u1', name: 'Test User' };
    const mockBookings = [
        {
            id: 'b1',
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            startTime: '10:00',
            endTime: '11:00',
            serviceName: 'Cut',
            employeeName: 'John',
            status: 'confirmed'
        },
        {
            id: 'b2',
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            startTime: '14:00',
            endTime: '15:00',
            serviceName: 'Color',
            employeeName: 'Jane',
            status: 'confirmed'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuthStore).mockReturnValue({ user: mockUser } as unknown as ReturnType<typeof useAuthStore>);
        vi.mocked(useBookings).mockReturnValue({ data: mockBookings, isLoading: false } as unknown as ReturnType<typeof useBookings>);
        vi.mocked(useCancelBooking).mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as unknown as ReturnType<typeof useCancelBooking>);
        
        // Mock window.confirm
        window.confirm = vi.fn(() => true);
    });

    it('renders upcoming and past bookings', () => {
        render(<MyBookings />, { wrapper: createWrapper() });
        expect(screen.getByText(/Nadchádzajúce/i)).toBeInTheDocument();
        expect(screen.getByText(/História/i)).toBeInTheDocument();
        expect(screen.getByText('Cut s John')).toBeInTheDocument();
        expect(screen.getByText('Color s Jane')).toBeInTheDocument();
    });

    it('calls cancel mutation when cancel button clicked', async () => {
        const cancelMutation = { mutateAsync: vi.fn(), isPending: false };
        vi.mocked(useCancelBooking).mockReturnValue(cancelMutation as unknown as ReturnType<typeof useCancelBooking>);

        render(<MyBookings />, { wrapper: createWrapper() });
        const cancelButtons = screen.getAllByText(/Zrušiť/i);
        fireEvent.click(cancelButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
        expect(cancelMutation.mutateAsync).toHaveBeenCalledWith('b1');
    });

    it('shows empty state when no bookings', () => {
        vi.mocked(useBookings).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useBookings>);
        render(<MyBookings />, { wrapper: createWrapper() });
        expect(screen.getByText(/Zatiaľ žiadne rezervácie/i)).toBeInTheDocument();
    });
});
