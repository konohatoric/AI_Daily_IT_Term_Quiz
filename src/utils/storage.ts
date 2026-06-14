import { LearningRecord, QuizResult } from '../types';
import { supabase } from '../lib/supabase';

export const defaultRecord: LearningRecord = {
  learnedTermIds: [],
  weakTermIds: [],
  reviewListIds: [],
  quizHistory: [],
  studyDates: [],
  streak: 0,
  lastStudyDate: '',
  totalQuizzes: 0,
  correctQuizzes: 0,
  weakCategories: {},
};

export async function fetchRecord(userId: string): Promise<LearningRecord> {
  const { data, error } = await supabase
    .from('user_records')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { ...defaultRecord };

  return {
    learnedTermIds: data.learned_term_ids ?? [],
    weakTermIds: data.weak_term_ids ?? [],
    reviewListIds: data.review_list_ids ?? [],
    quizHistory: (data.quiz_history as QuizResult[]) ?? [],
    studyDates: data.study_dates ?? [],
    streak: data.streak ?? 0,
    lastStudyDate: data.last_study_date ?? '',
    totalQuizzes: data.total_quizzes ?? 0,
    correctQuizzes: data.correct_quizzes ?? 0,
    weakCategories: (data.weak_categories as Record<string, { total: number; correct: number }>) ?? {},
  };
}

export async function persistRecord(userId: string, record: LearningRecord): Promise<void> {
  await supabase.from('user_records').upsert(
    {
      user_id: userId,
      learned_term_ids: record.learnedTermIds,
      weak_term_ids: record.weakTermIds,
      review_list_ids: record.reviewListIds,
      quiz_history: record.quizHistory,
      study_dates: record.studyDates,
      streak: record.streak,
      last_study_date: record.lastStudyDate,
      total_quizzes: record.totalQuizzes,
      correct_quizzes: record.correctQuizzes,
      weak_categories: record.weakCategories,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

export function applyStudyDate(record: LearningRecord): LearningRecord {
  const today = new Date().toISOString().split('T')[0];
  const studyDates = record.studyDates.includes(today)
    ? record.studyDates
    : [...record.studyDates, today];

  let streak = record.streak;
  if (record.lastStudyDate) {
    const last = new Date(record.lastStudyDate);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak = record.streak + 1;
    else if (diffDays > 1) streak = 1;
  } else {
    streak = 1;
  }

  return { ...record, studyDates, streak, lastStudyDate: today };
}

export function getWeakCategories(record: LearningRecord): string[] {
  return Object.entries(record.weakCategories)
    .filter(([, stats]) => stats.total >= 2 && stats.correct / stats.total < 0.6)
    .sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)
    .map(([cat]) => cat);
}

export function getAccuracy(record: LearningRecord): number {
  if (record.totalQuizzes === 0) return 0;
  return Math.round((record.correctQuizzes / record.totalQuizzes) * 100);
}
