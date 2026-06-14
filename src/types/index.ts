export interface Quiz {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface Term {
  id: string;
  term: string;
  category: string;
  difficulty: number;
  explanation: string;
  analogy: string;
  usageExample: string;
  icon: string;
  relatedTerms: string[];
  quiz: Quiz;
}

export interface LearningCourse {
  id: string;
  date: string;
  courseTitle: string;
  targetLevel: string;
  reason: string;
  terms: Term[];
}

export interface QuizResult {
  date: string;
  termId: string;
  term: string;
  correct: boolean;
  category: string;
}

export interface LearningRecord {
  learnedTermIds: string[];
  weakTermIds: string[];
  reviewListIds: string[];
  quizHistory: QuizResult[];
  studyDates: string[];
  streak: number;
  lastStudyDate: string;
  totalQuizzes: number;
  correctQuizzes: number;
  weakCategories: Record<string, { total: number; correct: number }>;
}

export type AppPage = 'top' | 'learning' | 'quiz' | 'record' | 'quiz-result' | 'course-complete';

export interface AppState {
  page: AppPage;
  currentCourse: LearningCourse | null;
  currentTermIndex: number;
  quizTerms: Term[];
  currentQuizIndex: number;
  quizAnswers: { termId: string; correct: boolean }[];
}
