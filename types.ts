export type ModuleStatus = 'locked' | 'active' | 'completed';
export type ViewType = 'dashboard' | 'classroom' | 'games';

export interface ModuleContent {
  heading: string;
  description: string;
  videoId?: string; // Placeholder for video ID
  tips: string[];
}

export interface Module {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  status: ModuleStatus;
  content: ModuleContent;
}

export interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface Activity {
  id: number;
  user: string;
  action: string;
  target: string; // "Module 1", "Badge Rythme"
  time: string;
  type: 'achievement' | 'progress';
}