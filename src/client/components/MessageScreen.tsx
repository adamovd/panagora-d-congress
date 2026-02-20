import { useEffect, useState } from 'react';
import SafeArea from '@/components/SafeArea';
import type { Message } from '@/types';
import '@/styles/MessageScreen.scss';

interface MessageScreenProps {
  message: Message;
}

/**
 * The message display — black background with green text.
 * Text fades in with a subtle animation.
 */
export default function MessageScreen({ message }: MessageScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay then fade in
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [message.id]);

  // Split message text on newlines to preserve formatting
  const lines = message.text.split('\n');

  return (
    <div className="message-screen">
      <SafeArea>
        <div
          className={`message-screen__content ${visible ? 'message-screen__content--visible' : ''}`}
        >
          <div className="message-screen__text">
            {lines.map((line, i) => (
              <p key={i} className={line.trim() === '' ? 'message-screen__spacer' : ''}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>
      </SafeArea>
    </div>
  );
}
