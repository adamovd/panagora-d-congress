// App states for the main state machine
export type AppState =
  | 'idle'
  | 'playing-transition'
  | 'showing-message'
  | 'playing-idle-video';

// Message from the database
export interface Message {
  id: number;
  text: string;
  category: 'normal' | 'unusual' | 'triggered';
  created_at: string;
}

// Video info from the API
export interface VideoInfo {
  filename: string;
  url: string;
}

// App config from the database
export interface AppConfig {
  idle_timeout_seconds: string;
  message_display_seconds: string;
}
