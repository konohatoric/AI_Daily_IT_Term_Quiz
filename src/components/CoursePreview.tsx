import { Sparkles, BookOpen, ChevronRight, RotateCcw } from 'lucide-react';
import { LearningCourse } from '../types';
import { CATEGORY_COLORS } from '../data/initialTerms';

interface Props {
  course: LearningCourse;
  onStart: () => void;
  onBack: () => void;
  isAI: boolean;
}

export default function CoursePreview({ course, onStart, onBack, isAI }: Props) {
  const categories = [...new Set(course.terms.map((t) => t.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
            <RotateCcw className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-700">今日のコース</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Course header */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-sky-200">
          <div className="flex items-center gap-2 mb-3">
            {isAI ? (
              <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                AIが選びました
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium">
                <BookOpen className="w-3 h-3" />
                フォールバックコース
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold mb-2">{course.courseTitle}</h1>
          <p className="text-white/80 text-sm leading-relaxed">{course.reason}</p>
          <div className="mt-4 flex items-center gap-4 text-white/90 text-sm">
            <span>📚 {course.terms.length}語</span>
            <span>⏱ 約{Math.ceil(course.terms.length * 1.5)}分</span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">今日のカテゴリ</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700'}`}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Term list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">今日学ぶ用語</p>
          {course.terms.map((term, i) => (
            <div key={term.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
              <span className="text-lg">{term.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{term.term}</p>
                <p className="text-xs text-gray-500 truncate">{term.explanation}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">#{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-4 px-6 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-200 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 text-lg"
        >
          学習スタート
          <ChevronRight className="w-5 h-5" />
        </button>
      </main>
    </div>
  );
}
