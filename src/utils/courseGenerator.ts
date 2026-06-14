import { LearningCourse, Term } from '../types';
import { INITIAL_TERMS } from '../data/initialTerms';
import { LearningRecord, getWeakCategories } from './storage';

export function generateFallbackCourse(record: LearningRecord, count = 7): LearningCourse {
  const weakCats = getWeakCategories(record);
  const learnedIds = new Set(record.learnedTermIds);
  const weakTermIds = new Set(record.weakTermIds);

  const unlearned = INITIAL_TERMS.filter((t) => !learnedIds.has(t.id));
  const weakTerms = INITIAL_TERMS.filter((t) => weakTermIds.has(t.id));

  let pool: Term[] = [];

  if (weakCats.length > 0) {
    const weakCatTerms = unlearned.filter((t) => weakCats.includes(t.category));
    const otherTerms = unlearned.filter((t) => !weakCats.includes(t.category));
    const weakCount = Math.min(Math.ceil(count * 0.4), weakCatTerms.length);
    pool = [
      ...shuffle(weakTerms).slice(0, 2),
      ...shuffle(weakCatTerms).slice(0, weakCount),
      ...shuffle(otherTerms),
    ];
  } else {
    pool = [...shuffle(weakTerms).slice(0, 2), ...shuffle(unlearned)];
  }

  if (pool.length === 0) {
    pool = shuffle([...INITIAL_TERMS]);
  }

  const selected = pool.slice(0, count);

  const reason =
    weakCats.length > 0
      ? `${weakCats.slice(0, 2).join('・')}が苦手なので、その分野を中心に選びました。`
      : unlearned.length > 0
      ? 'まだ学習していない用語を優先して選びました。'
      : 'すべての用語を一度学んだので、復習用コースを用意しました。';

  return {
    id: `course-${Date.now()}`,
    date: new Date().toISOString(),
    courseTitle: '今日のIT基礎用語コース',
    targetLevel: 'beginner',
    reason,
    terms: selected,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function generateAICourse(record: LearningRecord): Promise<LearningCourse | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const weakCats = getWeakCategories(record);
  const learnedTerms = INITIAL_TERMS.filter((t) => record.learnedTermIds.includes(t.id)).map((t) => t.term);
  const weakTermNames = INITIAL_TERMS.filter((t) => record.weakTermIds.includes(t.id)).map((t) => t.term);

  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/generate-course`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learnedTerms,
        weakTerms: weakTermNames,
        weakCategories: weakCats,
        recentAccuracy: `${record.totalQuizzes > 0 ? Math.round((record.correctQuizzes / record.totalQuizzes) * 100) : 0}%`,
        dailyGoal: 7,
      }),
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    if (!data.terms || !Array.isArray(data.terms)) return null;

    const terms: Term[] = data.terms.map((t: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx}`,
      term: t.term || '',
      category: t.category || 'Web開発',
      difficulty: t.difficulty || 2,
      explanation: t.explanation || '',
      analogy: t.analogy || '',
      usageExample: t.usageExample || '',
      icon: t.icon || '💡',
      relatedTerms: t.relatedTerms || [],
      quiz: {
        question: t.quiz?.question || '',
        choices: t.quiz?.choices || [],
        answer: t.quiz?.answer || '',
        explanation: t.quiz?.explanation || '',
      },
    }));

    return {
      id: `course-ai-${Date.now()}`,
      date: new Date().toISOString(),
      courseTitle: data.courseTitle || '今日のIT基礎用語コース',
      targetLevel: data.targetLevel || 'beginner',
      reason: data.reason || 'AIが今日学ぶべき用語を選びました。',
      terms,
    };
  } catch {
    return null;
  }
}
