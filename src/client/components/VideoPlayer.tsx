import { useRef, useEffect } from 'react';
import '@/styles/VideoPlayer.scss';

interface VideoPlayerProps {
  src: string;
  onEnded: () => void;
  loop?: boolean;
}

/**
 * Full-screen video player.
 * Plays the video and calls onEnded when done.
 */
export default function VideoPlayer({ src, onEnded, loop = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset and play
    video.currentTime = 0;
    video.play().catch((err) => {
      console.error('Video play failed:', err);
      // If video can't play, skip it
      onEnded();
    });
  }, [src, onEnded]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        className="video-player__video"
        src={src}
        onEnded={onEnded}
        loop={loop}
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
