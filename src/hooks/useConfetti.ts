/**
 * useConfetti - WOW moment hook for celebrations
 * Triggers confetti animation with optional haptic feedback
 */
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  duration?: number;
  particleCount?: number;
  spread?: number;
  colors?: string[];
}

export function useConfetti() {
  const fire = (options: ConfettiOptions = {}) => {
    const {
      duration = 3000,
      particleCount = 100,
      spread = 70,
      colors = ['#c5a059', '#0f172a', '#f8fafc', '#d4b886'],
    } = options;

    const end = Date.now() + duration;

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial burst
    confetti({
      particleCount,
      spread: spread * 1.5,
      origin: { y: 0.6 },
      colors,
    });

    frame();
  };

  const celebrate = () => {
    fire({ duration: 2500 });
  };

  const quick = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#c5a059', '#d4b886'],
    });
    
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return { fire, celebrate, quick };
}

/**
 * Haptic feedback utility
 */
export function haptic(pattern: 'light' | 'medium' | 'success' | 'error' = 'light') {
  if (!('vibrate' in navigator)) return;

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 25,
    success: [50, 30, 50],
    error: [100, 50, 100],
  };

  navigator.vibrate(patterns[pattern]);
}
