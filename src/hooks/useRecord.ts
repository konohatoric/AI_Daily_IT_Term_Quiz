import { useState, useEffect, useCallback } from 'react';
import { LearningRecord, QuizResult } from '../types';
import {
  defaultRecord,
  fetchRecord,
  persistRecord,
  applyStudyDate,
} from '../utils/storage';

export function useRecord(userId: string) {
  const [record, setRecord] = useState<LearningRecord>(defaultRecord);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRecord(userId).then((r) => {
      setRecord(r);
      setLoading(false);
    });
  }, [userId]);

  const update = useCallback(
    (updater: (r: LearningRecord) => LearningRecord) => {
      setRecord((prev) => {
        const next = updater(prev);
        persistRecord(userId, next);
        return next;
      });
    },
    [userId]
  );

  function markTermLearned(termId: string) {
    update((r) => {
      const next = applyStudyDate(r);
      return {
        ...next,
        learnedTermIds: next.learnedTermIds.includes(termId)
          ? next.learnedTermIds
          : [...next.learnedTermIds, termId],
        weakTermIds: next.weakTermIds.filter((id) => id !== termId),
      };
    });
  }

  function markTermWeak(termId: string) {
    update((r) => {
      const next = applyStudyDate(r);
      return {
        ...next,
        learnedTermIds: next.learnedTermIds.includes(termId)
          ? next.learnedTermIds
          : [...next.learnedTermIds, termId],
        weakTermIds: next.weakTermIds.includes(termId)
          ? next.weakTermIds
          : [...next.weakTermIds, termId],
      };
    });
  }

  function addToReviewList(termId: string) {
    update((r) => ({
      ...r,
      reviewListIds: r.reviewListIds.includes(termId)
        ? r.reviewListIds
        : [...r.reviewListIds, termId],
    }));
  }

  function removeFromReviewList(termId: string) {
    update((r) => ({
      ...r,
      reviewListIds: r.reviewListIds.filter((id) => id !== termId),
    }));
  }

  function recordQuiz(result: QuizResult) {
    update((r) => {
      const next = applyStudyDate(r);
      const weakTermIds = result.correct
        ? next.weakTermIds
        : next.weakTermIds.includes(result.termId)
        ? next.weakTermIds
        : [...next.weakTermIds, result.termId];

      const cat = result.category;
      const prev = next.weakCategories[cat] ?? { total: 0, correct: 0 };
      const weakCategories = {
        ...next.weakCategories,
        [cat]: {
          total: prev.total + 1,
          correct: prev.correct + (result.correct ? 1 : 0),
        },
      };

      return {
        ...next,
        quizHistory: [...next.quizHistory, result],
        totalQuizzes: next.totalQuizzes + 1,
        correctQuizzes: next.correctQuizzes + (result.correct ? 1 : 0),
        weakTermIds,
        weakCategories,
      };
    });
  }

  return { record, loading, markTermLearned, markTermWeak, addToReviewList, removeFromReviewList, recordQuiz };
}
