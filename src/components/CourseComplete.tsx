import { CheckCircle, Sparkles, Home, ChevronRight } from 'lucide-react';
import { LearningCourse } from '../types';

interface Props {
  course: LearningCourse;
  learnedCount: number;
  weakCount: number;
  onStartQuiz: () => void;
  onGoHome: () => void;
}

export default function CourseComplete({ course, learnedCount, weakCount, onStartQuiz, onGoHome }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full space-y-5">
        {/* Complete card */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            学習コース完了！
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {course.terms.length}語を学習しました。<br />クイズで理解度を確認しましょう。
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-sky-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-sky-600">{learnedCount}</p>
              <p className="text-xs text-sky-500">理解した用語</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-amber-600">{weakCount}</p>
              <p className="text-xs text-amber-500">要復習の用語</p>
            </div>
          </div>

          <button
            onClick={onStartQuiz}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
          >
            <Sparkles className="w-5 h-5" />
            クイズに挑戦する
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onGoHome}
          className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5 text-sky-500" />
          クイズをスキップしてトップへ
        </button>
      </div>
    </div>
  );
}
