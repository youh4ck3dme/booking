import { render, screen } from '@testing-library/react';
import { DashboardStats } from './DashboardStats';
import { useBookings } from '../../hooks/useBookings';
import { vi, describe, it, expect } from 'vitest';

// Mock the hook
vi.mock('../../hooks/useBookings', () => ({
    useBookings: vi.fn()
}));

describe('DashboardStats Component', () => {
    it('should calculate and display stats correctly', () => {
        const mockBookings = [
            {
                id: '1',
                customerEmail: 'a@test.com',
                price: 50,
                date: new Date().toISOString(), // today
                status: 'confirmed'
            },
            {
                id: '2',
                customerEmail: 'b@test.com',
                price: 100,
                date: new Date().toISOString(), // today
                status: 'confirmed'
            },
            {
                id: '3',
                customerEmail: 'a@test.com', // same customer
                price: 30,
                date: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
                status: 'confirmed'
            }
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockResult: any = {
            data: mockBookings,
            isLoading: false
        };
        vi.mocked(useBookings).mockReturnValue(mockResult);

        render(<DashboardStats />);

        // Today's bookings: 2
        expect(screen.getByTestId('stat-today-bookings')).toHaveTextContent('2');

        // Unique customers: 2 (a@test.com, b@test.com)
        expect(screen.getByTestId('stat-total-customers')).toHaveTextContent('2');

        // Tržba (Week): id 1 and 2 are today, id 3 is 10 days ago (ignored)
        // Total should be 150
        expect(screen.getByTestId('stat-weekly-revenue')).toHaveTextContent('150€');
    });

    it('should show skeletons when loading', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const loadingResult: any = {
            data: [],
            isLoading: true
        };
        vi.mocked(useBookings).mockReturnValue(loadingResult);

        const { container } = render(<DashboardStats />);
        expect(container.querySelectorAll('.skeleton').length).toBe(4);
    });
});
