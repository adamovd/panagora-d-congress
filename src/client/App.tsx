import { useAppState } from '@/hooks/useAppState';
import { useButtonPress } from '@/hooks/useButtonPress';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import IdleScreen from '@/components/IdleScreen';
import MessageScreen from '@/components/MessageScreen';
import VideoPlayer from '@/components/VideoPlayer';
import '@/styles/App.scss';

export default function App() {
  const {
    state,
    message,
    videoUrl,
    config,
    handleButtonPress,
    handleVideoEnd,
    handleIdleTimeout,
  } = useAppState();

  // Listen for USB button / keyboard press
  const triggerPress = useButtonPress(handleButtonPress);

  // Idle timer — triggers idle video after no interaction
  const idleTimeoutSeconds = config
    ? Number(config.idle_timeout_seconds)
    : 60;

  const { resetTimer } = useIdleTimer(
    handleIdleTimeout,
    idleTimeoutSeconds,
    // Only run idle timer when we're on idle or showing-message screens
    state === 'idle' || state === 'showing-message'
  );

  // Reset idle timer whenever button is pressed
  const onButtonPress = () => {
    resetTimer();
    handleButtonPress();
  };

  // Re-register button press with idle timer reset
  useButtonPress(onButtonPress);

  return (
    <div className="app">
      {/* Idle screen — green background with logo */}
      {state === 'idle' && <IdleScreen />}

      {/* Transition video — short clip between messages */}
      {state === 'playing-transition' && videoUrl && (
        <VideoPlayer src={videoUrl} onEnded={handleVideoEnd} />
      )}

      {/* Message display — black background with green text */}
      {state === 'showing-message' && message && (
        <MessageScreen message={message} />
      )}

      {/* Idle video — long ambient video when nobody interacts */}
      {state === 'playing-idle-video' && videoUrl && (
        <VideoPlayer src={videoUrl} onEnded={handleVideoEnd} />
      )}

      {/* Dev-only on-screen trigger button */}
      {import.meta.env.DEV && (
        <button className="dev-trigger" onClick={triggerPress}>
          Click me
        </button>
      )}
    </div>
  );
}
