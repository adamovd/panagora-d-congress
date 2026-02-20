import { useState, useCallback, useRef, useEffect } from 'react';
import type { AppState, Message, VideoInfo, AppConfig } from '@/types';
import {
  fetchRandomMessage,
  fetchTransitionVideo,
  fetchIdleVideo,
  fetchConfig,
} from '@/services/api';

interface UseAppStateReturn {
  state: AppState;
  message: Message | null;
  videoUrl: string | null;
  config: AppConfig | null;
  handleButtonPress: () => void;
  handleVideoEnd: () => void;
  handleIdleTimeout: () => void;
}

export function useAppState(): UseAppStateReturn {
  const [state, setState] = useState<AppState>('idle');
  const [message, setMessage] = useState<Message | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const lastMessageIdRef = useRef<number | null>(null);

  // Pre-fetched data for smoother transitions
  const nextMessageRef = useRef<Message | null>(null);
  const nextTransitionRef = useRef<VideoInfo | null>(null);

  // Load config on mount
  useEffect(() => {
    fetchConfig()
      .then(setConfig)
      .catch((err) => console.error('Failed to load config:', err));
  }, []);

  // Pre-fetch the next message and transition video in the background
  const prefetch = useCallback(async () => {
    try {
      const [msg, vid] = await Promise.all([
        fetchRandomMessage(lastMessageIdRef.current ?? undefined),
        fetchTransitionVideo(),
      ]);
      nextMessageRef.current = msg;
      nextTransitionRef.current = vid;
    } catch (err) {
      console.error('Prefetch failed:', err);
    }
  }, []);

  // Pre-fetch on mount and after showing a message
  useEffect(() => {
    prefetch();
  }, [prefetch]);

  // Button press → start transition video
  const handleButtonPress = useCallback(async () => {
    // Don't respond during transition video (let it finish)
    if (state === 'playing-transition') return;

    try {
      // Use pre-fetched data if available, otherwise fetch now
      let transitionVideo = nextTransitionRef.current;
      if (!transitionVideo) {
        transitionVideo = await fetchTransitionVideo();
      }
      nextTransitionRef.current = null;

      setVideoUrl(transitionVideo.url);
      setState('playing-transition');
    } catch (err) {
      console.error('Failed to start transition:', err);
      // Fallback: skip video and show message directly
      showNextMessage();
    }
  }, [state]);

  // When transition video ends → show message
  const showNextMessage = useCallback(async () => {
    try {
      let msg = nextMessageRef.current;
      if (!msg) {
        msg = await fetchRandomMessage(lastMessageIdRef.current ?? undefined);
      }
      nextMessageRef.current = null;

      setMessage(msg);
      lastMessageIdRef.current = msg.id;
      setVideoUrl(null);
      setState('showing-message');

      // Pre-fetch next batch
      prefetch();
    } catch (err) {
      console.error('Failed to show message:', err);
      setState('idle');
    }
  }, [prefetch]);

  // Transition video ended
  const handleVideoEnd = useCallback(() => {
    if (state === 'playing-transition') {
      showNextMessage();
    } else if (state === 'playing-idle-video') {
      setState('idle');
      setVideoUrl(null);
      prefetch();
    }
  }, [state, showNextMessage, prefetch]);

  // Idle timeout → play idle video
  const handleIdleTimeout = useCallback(async () => {
    try {
      const idleVideo = await fetchIdleVideo();
      setVideoUrl(idleVideo.url);
      setState('playing-idle-video');
    } catch (err) {
      console.error('Failed to play idle video:', err);
      // Stay in current state
    }
  }, []);

  return {
    state,
    message,
    videoUrl,
    config,
    handleButtonPress,
    handleVideoEnd,
    handleIdleTimeout,
  };
}
