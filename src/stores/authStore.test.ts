import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { act } from '@testing-library/react';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                })),
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({})),
            })),
        })),
    },
    isDemoMode: false,
}));

// Import mocked supabase to provide implementations
import { supabase } from '../lib/supabase';

describe('useAuthStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        act(() => {
            useAuthStore.setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        });
    });

    it('should have initial state', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    it('should login successfully with valid credentials', async () => {
        // Mock successful login
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: {
                user: { id: '1', email: 'admin@bookflow.sk', created_at: new Date().toISOString(), user_metadata: { full_name: 'Admin' } },
                session: { access_token: 'fake-token' },
            },
            error: null,
        });

        // Mock profile fetch
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockImplementation(() => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: { role: 'admin', full_name: 'Admin', phone: '123' } }),
                }),
            }),
        }));

        const success = await useAuthStore.getState().login('admin@bookflow.sk', 'admin123');
        expect(success).toBe(true);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user?.role).toBe('admin');
    });

    it('should fail login with invalid credentials', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: { user: null, session: null },
            error: new Error('Invalid credentials'),
        });

        const success = await useAuthStore.getState().login('invalid', 'invalid');
        expect(success).toBe(false);
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should logout correctly', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: {
                user: { id: '1', email: 'admin@bookflow.sk', created_at: new Date().toISOString(), user_metadata: {} },
                session: { access_token: 'fake-token' },
            },
            error: null,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockImplementation(() => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: { role: 'admin' } }),
                }),
            }),
        }));

        await useAuthStore.getState().login('admin@bookflow.sk', 'admin123');

        await useAuthStore.getState().logout();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().user).toBeNull();
        expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should register new user', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signUp as any).mockResolvedValue({
            data: {
                user: { id: '2', email: 'new@test.com', created_at: new Date().toISOString() },
                session: { access_token: 'new-token' },
            },
            error: null,
        });

        const success = await useAuthStore.getState().register('New User', 'new@test.com', 'password');
        expect(success).toBe(true);
        expect(useAuthStore.getState().user?.email).toBe('new@test.com');
    });

    it('should update user profile', async () => {
        useAuthStore.setState({
            user: { id: '1', name: 'Old Name', email: 'test@test.com', role: 'customer', createdAt: new Date() }
        });

        // Mock update
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockImplementation(() => ({
            update: () => ({
                eq: () => Promise.resolve({ error: null }),
            }),
        }));

        await useAuthStore.getState().updateUser({ name: 'New Name' });
        expect(useAuthStore.getState().user?.name).toBe('New Name');
    });

    it('should persist token', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: {
                user: { id: '1', email: 'admin@bookflow.sk', created_at: new Date().toISOString(), user_metadata: {} },
                session: { access_token: 'fake-token' },
            },
            error: null,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockImplementation(() => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: { role: 'admin' } }),
                }),
            }),
        }));

        await useAuthStore.getState().login('admin@bookflow.sk', 'admin123');
        expect(useAuthStore.getState().token).toBeTruthy();
    });
});
