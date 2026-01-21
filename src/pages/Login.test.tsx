import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../hooks/useToast';

vi.mock('../stores/authStore');
vi.mock('../hooks/useToast');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Page', () => {
    const mockLogin = vi.fn();
    const mockToast = { success: vi.fn(), error: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        const mockStore = {
            login: mockLogin,
            isLoading: false,
            isAuthenticated: false,
        };
        vi.mocked(useAuthStore).mockReturnValue(mockStore as unknown as ReturnType<typeof useAuthStore>);
        (useAuthStore as unknown as { getState: () => typeof mockStore }).getState = vi.fn().mockReturnValue(mockStore);
        vi.mocked(useToast).mockReturnValue(mockToast as unknown as ReturnType<typeof useToast>);
    });

    it('renders login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        expect(screen.getByText(/Prihlásenie/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Heslo/i)).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText(/Prihlásiť sa/i));

        expect(screen.getByText(/Email je povinný/i)).toBeInTheDocument();
        expect(screen.getByText(/Heslo je povinné/i)).toBeInTheDocument();
    });

    it('calls login and navigates on success', async () => {
        mockLogin.mockResolvedValue(true);
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Heslo/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByText(/Prihlásiť sa/i));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockToast.success).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    it('shows error toast on failure', async () => {
        mockLogin.mockResolvedValue(false);
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Heslo/i), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByText(/Prihlásiť sa/i));

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
