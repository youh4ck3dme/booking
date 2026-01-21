import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './Home';
import { useServices } from '../hooks/useServices';

vi.mock('../hooks/useServices');

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

describe('Home Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useServices).mockReturnValue({
            data: [
                { id: 's1', name: 'Test Služba', price: 10, duration: 30, category: 'hair', description: 'Desc', isActive: true, color: '#000' }
            ],
            isLoading: false,
        } as unknown as ReturnType<typeof useServices>);
    });

    it('renders hero section with CTA', () => {
        render(<Home />, { wrapper: createWrapper() });
        // The H1 has "Rezervujte si termín" and "okamžite" in a span
        // Use a more specific query to avoid collisions
        const mainTitle = screen.getByRole('heading', { level: 1 });
        expect(mainTitle).toHaveTextContent(/Rezervujte si termín/i);
        expect(mainTitle).toHaveTextContent(/okamžite/i);
    });

    it('renders features section', () => {
        render(<Home />, { wrapper: createWrapper() });
        expect(screen.getByText(/Jednoduché rezervácie/i)).toBeInTheDocument();
        expect(screen.getByText(/AI asistent/i)).toBeInTheDocument();
    });

    it('renders services from the hook', () => {
        render(<Home />, { wrapper: createWrapper() });
        expect(screen.getByText(/Test Služba/i)).toBeInTheDocument();
        expect(screen.getByText('10€')).toBeInTheDocument();
    });
});
