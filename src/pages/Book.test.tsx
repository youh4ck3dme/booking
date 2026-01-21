import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Book } from './Book';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../components/booking/BookingForm', () => ({
    BookingForm: () => <div data-testid="booking-form" />
}));

const createWrapper = () => {
    const queryClient = new QueryClient();
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Book Page', () => {
    it('renders page title and booking form', () => {
        render(<Book />, { wrapper: createWrapper() });
        expect(screen.getByText('Nová rezervácia')).toBeInTheDocument();
        expect(screen.getByTestId('booking-form')).toBeInTheDocument();
    });
});
