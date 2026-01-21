import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import { useAuthStore } from '../stores/authStore';
import { useEmployees } from '../hooks/useEmployees';
import { useBookings } from '../hooks/useBookings';

vi.mock('../stores/authStore');
vi.mock('../hooks/useEmployees');

// Mock global Notification API
Object.defineProperty(window, 'Notification', {
    value: {
        permission: 'default',
        requestPermission: vi.fn(),
    },
    writable: true
});
vi.mock('../hooks/useBookings', () => ({
    useBookings: vi.fn(),
    useCreateEmployee: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
    useBlockTime: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));
vi.mock('../components/dashboard/DashboardStats', () => ({
    DashboardStats: () => <div data-testid="dashboard-stats" />
}));
vi.mock('../components/dashboard/DashboardBookings', () => ({
    DashboardBookings: () => <div data-testid="dashboard-bookings" />
}));

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

describe('Dashboard Page', () => {
    const mockUser = { id: '1', name: 'Admin User', role: 'admin' };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuthStore).mockReturnValue({
            user: mockUser,
        } as unknown as ReturnType<typeof useAuthStore>);
        vi.mocked(useEmployees).mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useEmployees>);
        vi.mocked(useBookings).mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useBookings>);
    });

    it('renders admin dashboard correctly', () => {
        render(<Dashboard />, { wrapper: createWrapper() });
        expect(screen.getByText(/Vitajte, Admin/i)).toBeInTheDocument();
        expect(screen.getByText(/Administrátorský prehľad/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Nastavenia/i).length).toBeGreaterThan(0);
        expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-bookings')).toBeInTheDocument();
    });

    it('renders employee dashboard correctly', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: { ...mockUser, role: 'employee', name: 'Staff Member' },
        } as unknown as ReturnType<typeof useAuthStore>);

        render(<Dashboard />, { wrapper: createWrapper() });
        expect(screen.getByText(/Vitajte, Staff/i)).toBeInTheDocument();
        expect(screen.getByText(/Zamestnanecký portál/i)).toBeInTheDocument();
        expect(screen.queryByText(/Administrátorský prehľad/i)).not.toBeInTheDocument();
    });

    it('redirects customers to my-bookings', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: { ...mockUser, role: 'customer' },
        } as unknown as ReturnType<typeof useAuthStore>);

        render(<Dashboard />, { wrapper: createWrapper() });
        // Since Dashboard returns <Navigate />, we can check if it rendered nothing or just mock Navigate
        expect(screen.queryByText(/Vitajte/i)).not.toBeInTheDocument();
    });
});
