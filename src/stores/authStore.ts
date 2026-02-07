import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

interface AuthStore extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            initialize: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // Fetch profile if exists
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    const user: User = {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
                        role: profile?.role || 'customer',
                        createdAt: new Date(session.user.created_at),
                    };

                    set({ user, token: session.access_token, isAuthenticated: true });
                }

                // Listen for auth changes
                supabase.auth.onAuthStateChange(async (_event, session) => {
                    if (session?.user) {
                         const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();
                            
                        const user: User = {
                            id: session.user.id,
                            email: session.user.email || '',
                            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
                            role: profile?.role || 'customer',
                            createdAt: new Date(session.user.created_at),
                        };
                        set({ user, token: session.access_token, isAuthenticated: true });
                    } else {
                        set({ user: null, token: null, isAuthenticated: false });
                    }
                });
            },

            login: async (email, password) => {
                set({ isLoading: true });
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    console.error('Login error:', error);
                    set({ isLoading: false });
                    return false;
                }

                if (data.user) {
                    // Profile will be handled by the listener or we can fetch it here
                    // For now, let's rely on listener or just return true and let state update
                }

                set({ isLoading: false });
                return true;
            },

            register: async (name, email, password) => {
                set({ isLoading: true });
                
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        }
                    }
                });

                if (error) {
                    console.error('Register error:', error);
                    set({ isLoading: false });
                    return false;
                }
                
                // Note: user might need to confirm email if configured in Supabase
                if (data.user) {
                    // Create profile entry
                    await supabase.from('profiles').insert({
                        id: data.user.id,
                        full_name: name,
                        email: email,
                        role: 'customer'
                    });
                }

                set({ isLoading: false });
                return true;
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            updateUser: async (updates) => {
                const { user } = get();
                if (!user) return;
                
                // Update profile in DB
                if (updates.name) {
                     await supabase.from('profiles').update({ full_name: updates.name }).eq('id', user.id);
                }
                
                set({ user: { ...user, ...updates } });
            },
        }),
        {
            name: 'bookflow-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
