
export type LessonStatus = 'locked' | 'active' | 'completed' | 'pending_review';
export type ModuleStatus = 'locked' | 'active' | 'completed';
export type ViewType = 'dashboard' | 'classroom' | 'games';
export type LessonType = 'standard' | 'practice';

export interface LessonContent {
  heading: string;
  description: string;
  videoId?: string;
  tips: string[];
}

export interface Lesson {
  id: number;
  moduleId: number; // Lien vers le parent
  title: string;
  subtitle: string;
  duration: string;
  status: LessonStatus;
  type: LessonType;
  validationStatus?: 'none' | 'submitted' | 'approved';
  content: LessonContent;
}

export interface Module {
  id: number;
  title: string;
  subtitle?: string;
  lessons: Lesson[];
  status?: ModuleStatus;
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
  target: string;
  time: string;
  type: 'achievement' | 'progress';
}