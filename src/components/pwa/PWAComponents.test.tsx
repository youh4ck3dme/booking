import { render, screen, act } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import { InstallPrompt } from './InstallPrompt';
import { vi, describe, it, expect } from 'vitest';

describe('PWA UI Components', () => {
    describe('OfflineBanner', () => {
        it('should show when offline', () => {
            // Mock navigator.onLine
            Object.defineProperty(navigator, 'onLine', {
                configurable: true,
                value: false,
            });

            render(<OfflineBanner />);

            // Dispatch online/offline events
            act(() => {
                window.dispatchEvent(new Event('offline'));
            });

            expect(screen.getByText(/Ste offline/i)).toBeInTheDocument();
        });

        it('should not show when online', () => {
            Object.defineProperty(navigator, 'onLine', {
                configurable: true,
                value: true,
            });

            render(<OfflineBanner />);

            act(() => {
                window.dispatchEvent(new Event('online'));
            });

            expect(screen.queryByText(/Ste offline/i)).not.toBeInTheDocument();
        });
    });

    describe('InstallPrompt', () => {
        it('should show when beforeinstallprompt is fired', async () => {
            render(<InstallPrompt />);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mockEvent = new Event('beforeinstallprompt') as any;
            mockEvent.preventDefault = vi.fn();

            act(() => {
                window.dispatchEvent(mockEvent);
            });

            expect(screen.getByText(/Inštalovať aplikáciu/i)).toBeInTheDocument();
        });
    });
});
