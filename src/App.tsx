import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { useRecord } from './hooks/useRecord';
import AuthPage from './components/AuthPage';
import TopPage from './components/TopPage';
import CoursePreview from './components/CoursePreview';
import LearningCard from './components/LearningCard';
import CourseComplete from './components/CourseComplete';
import QuizPage from './components/QuizPage';
import QuizResult from './components/QuizResult';
import RecordPage from './components/RecordPage';
import { LearningCourse, AppPage } from './types';
import { INITIAL_TERMS } from './data/initialTerms';
import { generateFallbackCourse, generateAICourse } from './utils/courseGenerator';
import { getWeakCategories } from './utils/storage';

const QUIZ_INTERVAL = 3;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={() => {}} />;
  }

  return <MainApp user={user} />;
}

function MainApp({ user }: { user: User }) {
  const { record, loading, markTermLearned, markTermWeak, addToReviewList, removeFromReviewList, recordQuiz } = useRecord(user.id);

  const [page, setPage] = useState<AppPage>('top');
  const [course, setCourse] = useState<LearningCourse | null>(null);
  const [isAICourse, setIsAICourse] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [sessionLearned, setSessionLearned] = useState<string[]>([]);
  const [sessionWeak, setSessionWeak] = useState<string[]>([]);
  const [quizTerms, setQuizTerms] = useState<LearningCourse['terms']>([]);
  const [quizResults, setQuizResults] = useState<{ termId: string; correct: boolean; category: string }[]>([]);

  async function handleStartCourse() {
    setIsGenerating(true);

    let newCourse: LearningCourse | null = null;
    let aiUsed = false;

    try {
      newCourse = await generateAICourse(record);
      if (newCourse) aiUsed = true;
    } catch {
      newCourse = null;
    }

    if (!newCourse) {
      newCourse = generateFallbackCourse(record);
    }

    setCourse(newCourse);
    setIsAICourse(aiUsed);
    setCurrentTermIndex(0);
    setSessionLearned([]);
    setSessionWeak([]);
    setIsGenerating(false);
    setPage('course-preview');
  }

  function handleReviewCourse() {
    const reviewIds = new Set([...record.weakTermIds, ...record.reviewListIds]);
    const reviewTerms = INITIAL_TERMS.filter((t) => reviewIds.has(t.id));
    if (reviewTerms.length === 0) return;

    setCourse({
      id: `review-${Date.now()}`,
      date: new Date().toISOString(),
      courseTitle: '苦手・復習コース',
      targetLevel: 'beginner',
      reason: '苦手単語と復習リストの用語を中心に選びました。',
      terms: reviewTerms.slice(0, 10),
    });
    setIsAICourse(false);
    setCurrentTermIndex(0);
    setSessionLearned([]);
    setSessionWeak([]);
    setPage('course-preview');
  }

  function handleUnderstood() {
    if (!course) return;
    const termId = course.terms[currentTermIndex].id;
    markTermLearned(termId);
    setSessionLearned((prev) => [...prev, termId]);
    advanceTerm();
  }

  function handleUnsure() {
    if (!course) return;
    const termId = course.terms[currentTermIndex].id;
    markTermWeak(termId);
    setSessionWeak((prev) => [...prev, termId]);
    setSessionLearned((prev) => [...prev, termId]);
    advanceTerm();
  }

  function handleReviewLater() {
    if (!course) return;
    const termId = course.terms[currentTermIndex].id;
    if (record.reviewListIds.includes(termId)) {
      removeFromReviewList(termId);
    } else {
      addToReviewList(termId);
    }
  }

  function advanceTerm() {
    if (!course) return;
    const nextIndex = currentTermIndex + 1;
    const shouldQuiz = nextIndex > 0 && nextIndex % QUIZ_INTERVAL === 0 && nextIndex < course.terms.length;

    if (nextIndex >= course.terms.length) {
      setPage('course-complete');
    } else if (shouldQuiz) {
      const start = Math.max(0, nextIndex - QUIZ_INTERVAL);
      setQuizTerms(course.terms.slice(start, nextIndex));
      setQuizResults([]);
      setCurrentTermIndex(nextIndex);
      setPage('quiz');
    } else {
      setCurrentTermIndex(nextIndex);
    }
  }

  function handleQuizComplete(results: { termId: string; correct: boolean; category: string }[]) {
    results.forEach((r) => {
      recordQuiz({
        date: new Date().toISOString(),
        termId: r.termId,
        term: course?.terms.find((t) => t.id === r.termId)?.term ?? r.termId,
        correct: r.correct,
        category: r.category,
      });
    });
    setQuizResults(results);
    setPage('quiz-result');
  }

  function handleAfterQuizResult() {
    if (!course) return;
    setPage(currentTermIndex >= course.terms.length ? 'course-complete' : 'learning');
  }

  function handleFinalQuiz() {
    if (!course) return;
    setQuizTerms(course.terms);
    setQuizResults([]);
    setPage('quiz');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const termNames = course
    ? Object.fromEntries(course.terms.map((t) => [t.id, t.term]))
    : {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (page === 'top') {
    return (
      <TopPage
        record={record}
        userEmail={user.email ?? ''}
        onStart={handleStartCourse}
        onGoRecord={() => setPage('record')}
        onLogout={handleLogout}
        isGenerating={isGenerating}
      />
    );
  }

  if (page === 'record') {
    return (
      <RecordPage
        record={record}
        onBack={() => setPage('top')}
        onReview={handleReviewCourse}
      />
    );
  }

  if (page === 'course-preview' && course) {
    return (
      <CoursePreview
        course={course}
        onStart={() => setPage('learning')}
        onBack={() => setPage('top')}
        isAI={isAICourse}
      />
    );
  }

  if (page === 'learning' && course) {
    const term = course.terms[currentTermIndex];
    if (!term) return null;
    return (
      <LearningCard
        term={term}
        index={currentTermIndex}
        total={course.terms.length}
        onUnderstood={handleUnderstood}
        onUnsure={handleUnsure}
        onReviewLater={handleReviewLater}
        onBack={() => setPage('course-preview')}
        isInReviewList={record.reviewListIds.includes(term.id)}
      />
    );
  }

  if (page === 'quiz' && quizTerms.length > 0) {
    return <QuizPage terms={quizTerms} onComplete={handleQuizComplete} />;
  }

  if (page === 'quiz-result') {
    return (
      <QuizResult
        results={quizResults}
        termNames={termNames}
        onContinue={handleAfterQuizResult}
        onGoHome={() => setPage('top')}
      />
    );
  }

  if (page === 'course-complete' && course) {
    return (
      <CourseComplete
        course={course}
        learnedCount={sessionLearned.filter((id) => !sessionWeak.includes(id)).length}
        weakCount={sessionWeak.length}
        onStartQuiz={handleFinalQuiz}
        onGoHome={() => setPage('top')}
      />
    );
  }

  return null;
}
