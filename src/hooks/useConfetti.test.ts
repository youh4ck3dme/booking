import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useConfetti } from './useConfetti';
import confetti from 'canvas-confetti';

vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}));

describe('useConfetti hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock navigator.vibrate
        Object.defineProperty(navigator, 'vibrate', {
            value: vi.fn(),
            configurable: true
        });
    });

    it('triggers quick confetti', () => {
        const { result } = renderHook(() => useConfetti());
        result.current.quick();

        expect(confetti).toHaveBeenCalled();
        expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it('triggers celebrate animation', () => {
        const { result } = renderHook(() => useConfetti());
        result.current.celebrate();

        // Should trigger initial burst
        expect(confetti).toHaveBeenCalled();
        expect(navigator.vibrate).toHaveBeenCalled();
    });
});
