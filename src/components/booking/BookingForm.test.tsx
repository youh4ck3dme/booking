import { render, screen } from '@testing-library/react';
import { BookingForm } from './BookingForm';
import { useServices } from '../../hooks/useServices';
import { useEmployees } from '../../hooks/useEmployees';
import { useAvailableSlots, useCreateBooking } from '../../hooks/useBookings';
import { vi, describe, it, expect } from 'vitest';

// Mock all hooks
vi.mock('../../hooks/useServices', () => ({ useServices: vi.fn() }));
vi.mock('../../hooks/useEmployees', () => ({ useEmployees: vi.fn() }));
vi.mock('../../hooks/useBookings', () => ({
    useAvailableSlots: vi.fn(),
    useCreateBooking: vi.fn()
}));

describe('BookingForm Integration', () => {
    it('should render the first step (Service selection)', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(useServices).mockReturnValue({ data: [{ id: 's1', name: 'Service 1', icon: '✂️' }], isLoading: false } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(useEmployees).mockReturnValue({ data: [], isLoading: false } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(useAvailableSlots).mockReturnValue({ data: [], isLoading: false } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(useCreateBooking).mockReturnValue({ isPending: false } as any);

        render(<BookingForm />);

        expect(screen.getByText('Vyberte si službu')).toBeInTheDocument();
        expect(screen.getByText('Service 1')).toBeInTheDocument();
    });

    it('should show loading state', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(useServices).mockReturnValue({ data: [], isLoading: true } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(useEmployees).mockReturnValue({ data: [], isLoading: true } as any);

        render(<BookingForm />);

        expect(screen.getByText('Načítavam ponuku...')).toBeInTheDocument();
    });
});
