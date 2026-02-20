import type { ReactNode } from 'react';
import '@/styles/SafeArea.scss';

interface SafeAreaProps {
  children: ReactNode;
}

/**
 * The 1080×1080 dashed-circle safe area, centered
 * on the 1920×1080 canvas. All content sits inside this circle.
 */
export default function SafeArea({ children }: SafeAreaProps) {
  return (
    <div className="safe-area">
      <div className="safe-area__circle">
        <div className="safe-area__content">{children}</div>
      </div>
    </div>
  );
}
