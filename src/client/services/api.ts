import type { Message, VideoInfo, AppConfig } from '@/types';

const BASE_URL = '/api';

export async function fetchRandomMessage(
  excludeId?: number
): Promise<Message> {
  const params = new URLSearchParams();
  if (excludeId) {
    params.set('exclude', String(excludeId));
  }

  const url = `${BASE_URL}/messages/random${params.toString() ? '?' + params : ''}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch message: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchTransitionVideo(): Promise<VideoInfo> {
  const res = await fetch(`${BASE_URL}/videos/transition`);

  if (!res.ok) {
    throw new Error(`Failed to fetch transition video: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchIdleVideo(): Promise<VideoInfo> {
  const res = await fetch(`${BASE_URL}/videos/idle`);

  if (!res.ok) {
    throw new Error(`Failed to fetch idle video: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch(`${BASE_URL}/messages/config`);

  if (!res.ok) {
    throw new Error(`Failed to fetch config: ${res.statusText}`);
  }

  return res.json();
}
