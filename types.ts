
export type LessonStatus = 'locked' | 'active' | 'completed' | 'pending_review';
// Export ModuleStatus for use in components like ModuleCard
export type ModuleStatus = 'locked' | 'active' | 'completed';
export type ViewType = 'dashboard' | 'classroom' | 'games';
export type LessonType = 'standard' | 'practice' | 'text';

export interface LessonContent {
  heading: string;
  description: string;
  tips: string[];
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  subtitle: string;
  duration: string;
  status: LessonStatus;
  type: LessonType;
  hasVideo: boolean;
  validationStatus?: 'none' | 'submitted' | 'approved';
  content: LessonContent;
}

export interface Module {
  id: number;
  title: string;
  // Optional properties for UI display and module-level status
  subtitle?: string;
  status?: ModuleStatus;
  lessons: Lesson[];
}
