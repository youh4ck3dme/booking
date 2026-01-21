import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToast } from './useToast';
import { useUIStore } from '../stores/uiStore';

// Mock uiStore
vi.mock('../stores/uiStore', () => ({
    useUIStore: vi.fn()
}));

describe('useToast hook', () => {
    const mockAddNotification = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useUIStore).mockReturnValue({
            addNotification: mockAddNotification
        } as unknown as ReturnType<typeof useUIStore>);
    });

    it('triggers success notification', () => {
        const { result } = renderHook(() => useToast());
        result.current.success('Success Title', 'Success Message');

        expect(mockAddNotification).toHaveBeenCalledWith({
            type: 'success',
            title: 'Success Title',
            message: 'Success Message'
        });
    });

    it('triggers error notification', () => {
        const { result } = renderHook(() => useToast());
        result.current.error('Error Title');

        expect(mockAddNotification).toHaveBeenCalledWith({
            type: 'error',
            title: 'Error Title',
            message: ''
        });
    });

    it('triggers warning notification', () => {
        const { result } = renderHook(() => useToast());
        result.current.warning('Warning');

        expect(mockAddNotification).toHaveBeenCalledWith({
            type: 'warning',
            title: 'Warning',
            message: ''
        });
    });

    it('triggers info notification', () => {
        const { result } = renderHook(() => useToast());
        result.current.info('Info');

        expect(mockAddNotification).toHaveBeenCalledWith({
            type: 'info',
            title: 'Info',
            message: ''
        });
    });
});
