
export type ModuleStatus = 'locked' | 'active' | 'completed' | 'pending_review'; // pending_review = Devoir envoyé
export type ViewType = 'dashboard' | 'classroom' | 'games';
export type LessonType = 'standard' | 'practice'; // Théorie ou Pratique

export interface ModuleContent {
  heading: string;
  description: string;
  videoId?: string;
  tips: string[];
}

export interface Module {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  status: ModuleStatus;
  type: LessonType; // Nouveau champ
  validationStatus?: 'none' | 'submitted' | 'approved'; // État du devoir
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
  target: string;
  time: string;
  type: 'achievement' | 'progress';
}
