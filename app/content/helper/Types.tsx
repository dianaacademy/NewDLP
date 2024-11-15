export interface QuizOption {
  option: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  hint: string;
  options: QuizOption[];
}

export interface AnswerArea {
  x: number;
  y: number;
}

export interface ChapterDetails {
  content?: string;
  questions?: QuizQuestion[];
  videoUrl?: string;
  imageUrl?: string;
  question?: string;
  answerArea?: AnswerArea;
}

export interface Chapter {
  id: string;
  chapterno: number;
  chapterName: string;
  type: 'text' | 'video' | 'quiz' | 'match' | 'lab';
  content: string;
  details?: ChapterDetails;
}