import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            signUp: vi.fn(),
            getUser: vi.fn(),
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                })),
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(),
                    })),
                })),
            })),
            insert: vi.fn(() => ({
                 select: vi.fn(() => ({
                    single: vi.fn(),
                }))
            }))
        })),
    }
}));

describe('useAuthStore (Supabase)', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        // Reset store state
        useAuthStore.setState({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
        });
        // Initialize store to set up listeners
        await useAuthStore.getState().initialize();
    });

    it('should login successfully', async () => {
        const mockUser = { id: '123', email: 'test@test.com', created_at: new Date().toISOString() };
        // Mock signIn response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: { user: mockUser, session: { access_token: 'token' } },
            error: null
        });

        // Mock profile fetch
        const mockProfile = { id: '123', role: 'customer', full_name: 'Test User' };
        const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: mockSingle
                }))
            }))
        });

        const success = await useAuthStore.getState().login('test@test.com', 'password');

        expect(success).toBe(true);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user?.email).toBe('test@test.com');
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    });

    it('should handle login failure', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login' }
        });

        const success = await useAuthStore.getState().login('fail@test.com', 'password');

        expect(success).toBe(false);
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should logout correctly', async () => {
        // Mock signOut
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signOut as any).mockResolvedValue({ error: null });

        // Set initial state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useAuthStore.setState({ isAuthenticated: true, user: { id: '1', role: 'admin' } as any });

        await useAuthStore.getState().logout();

        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().user).toBeNull();
        expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should register new user', async () => {
        const mockUser = { id: 'new', email: 'new@test.com' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.signUp as any).mockResolvedValue({
            data: { user: mockUser, session: null }, // Session null often requires email confirmation
            error: null
        });
        
        // Mock insert for profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockReturnValue({
            insert: vi.fn().mockResolvedValue({ data: null, error: null })
        });

        const success = await useAuthStore.getState().register('New User', 'new@test.com', 'password');

        expect(success).toBe(true);
        expect(supabase.auth.signUp).toHaveBeenCalled();
        expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should update user profile', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useAuthStore.setState({ isAuthenticated: true, user: { id: '1', email: 'u@t.c' } as any });

        const updatedProfile = { id: '1', full_name: 'Updated Name', phone: '0900123456' };
        const mockSingle = vi.fn().mockResolvedValue({ data: updatedProfile, error: null });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from as any).mockReturnValue({
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: mockSingle
                    }))
                }))
            }))
        });

        await useAuthStore.getState().updateUser({ name: 'Updated Name', phone: '0900123456' });

        expect(useAuthStore.getState().user?.name).toBe('Updated Name');
        expect(useAuthStore.getState().user?.phone).toBe('0900123456');
    });
});
