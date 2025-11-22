
export interface Vocabulary {
  id?: string; // Optional unique ID
  lessonId: string; // 'L11' | 'L12' etc
  word: string;
  reading: string;
  meaning: string;
  type: 'noun' | 'na-adj' | 'i-adj' | 'phrase' | 'verb' | 'adverb' | 'counter';
}

export interface GrammarRule {
  lessonId: string;
  title: string;
  description: string;
  pattern: string;
  example: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  section: number;
  prompt: string; 
  answer: string;
  hint: string;
}

export interface LessonInfo {
  id: string;
  title: string;
  description: string;
  topics: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface SRSStatus {
  id: string;
  nextReview: number; // timestamp
  interval: number; // days
  ease: number;
  streak: number;
}

export type AIProvider = 'gemini' | 'siliconflow';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}
