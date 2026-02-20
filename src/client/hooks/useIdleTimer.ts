import { useEffect, useRef, useCallback } from 'react';

/**
 * Calls onIdle after `timeoutSeconds` of no activity.
 * Call `resetTimer()` whenever there's user interaction.
 */
export function useIdleTimer(
  onIdle: () => void,
  timeoutSeconds: number,
  enabled: boolean = true
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    if (enabled) {
      timerRef.current = setTimeout(() => {
        onIdleRef.current();
      }, timeoutSeconds * 1000);
    }
  }, [timeoutSeconds, enabled, clearTimer]);

  // Start/restart timer when enabled changes
  useEffect(() => {
    if (enabled) {
      resetTimer();
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [enabled, resetTimer, clearTimer]);

  return { resetTimer, clearTimer };
}
