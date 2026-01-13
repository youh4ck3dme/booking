import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, UIState, AppNotification } from '../types';

interface UIStore extends UIState {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    addNotification: (notification: Omit<AppNotification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

const defaultTheme: Theme = {
    mode: 'dark',
    primaryColor: '#6366f1',
    accentColor: '#06b6d4',
};

export const useUIStore = create<UIStore>()(
    persist(
        (set, get) => ({
            theme: defaultTheme,
            notifications: [],

            setTheme: (theme) => {
                set({ theme });
                document.documentElement.setAttribute('data-theme', theme.mode);
            },

            toggleTheme: () => {
                const { theme } = get();
                const newMode = theme.mode === 'dark' ? 'light' : 'dark';
                set({ theme: { ...theme, mode: newMode } });
                document.documentElement.setAttribute('data-theme', newMode);
            },

            addNotification: (notification) => {
                const id = `notif-${Date.now()}`;
                const newNotification: AppNotification = {
                    ...notification,
                    id,
                    duration: notification.duration || 5000,
                };

                set((state) => ({
                    notifications: [...state.notifications, newNotification],
                }));

                // Auto remove
                if (newNotification.duration && newNotification.duration > 0) {
                    setTimeout(() => {
                        get().removeNotification(id);
                    }, newNotification.duration);
                }
            },

            removeNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            },

            clearNotifications: () => set({ notifications: [] }),
        }),
        {
            name: 'bookflow-ui',
            partialize: (state) => ({
                theme: state.theme,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.theme) {
                    document.documentElement.setAttribute('data-theme', state.theme.mode);
                }
            },
        }
    )
);
