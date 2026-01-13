import { useUIStore } from '../stores/uiStore';

// Helper hook
export const useToast = () => {
    const { addNotification } = useUIStore();

    return {
        success: (title: string, message = '') =>
            addNotification({ type: 'success', title, message }),
        error: (title: string, message = '') =>
            addNotification({ type: 'error', title, message }),
        warning: (title: string, message = '') =>
            addNotification({ type: 'warning', title, message }),
        info: (title: string, message = '') =>
            addNotification({ type: 'info', title, message }),
    };
};
