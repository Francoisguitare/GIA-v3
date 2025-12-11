export type ModuleStatus = 'locked' | 'active' | 'completed';

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