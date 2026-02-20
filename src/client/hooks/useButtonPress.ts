import { useEffect, useCallback, useRef } from 'react';

/**
 * Listens for a button press — works with:
 * 1. USB physical buttons that emulate keyboard keys (default: Space)
 * 2. Mouse clicks (for development/testing)
 *
 * The triggerKey can be configured to match whatever key
 * the USB button sends.
 */
export function useButtonPress(
  onPress: () => void,
  triggerKey: string = ' ' // Space bar by default
) {
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;

  // Debounce to prevent rapid double-presses
  const lastPressRef = useRef(0);
  const DEBOUNCE_MS = 500;

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastPressRef.current < DEBOUNCE_MS) return;
    lastPressRef.current = now;
    onPressRef.current();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === triggerKey) {
        e.preventDefault();
        handlePress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerKey, handlePress]);

  // Return handlePress so it can be called from on-screen button too
  return handlePress;
}
