import { CheckCircle, AlertCircle, Clock, ChevronLeft, BookmarkPlus } from 'lucide-react';
import { Term } from '../types';
import { CATEGORY_COLORS } from '../data/initialTerms';

interface Props {
  term: Term;
  index: number;
  total: number;
  onUnderstood: () => void;
  onUnsure: () => void;
  onReviewLater: () => void;
  onBack: () => void;
  isInReviewList: boolean;
}

const DIFFICULTY_LABELS = ['', '★☆☆ やさしい', '★★☆ ふつう', '★★★ むずかしい', '★★★★', '★★★★★'];
const DIFFICULTY_COLORS = ['', 'text-green-600 bg-green-50', 'text-blue-600 bg-blue-50', 'text-orange-600 bg-orange-50', 'text-red-600 bg-red-50', 'text-red-700 bg-red-100'];

export default function LearningCard({ term, index, total, onUnderstood, onUnsure, onReviewLater, onBack, isInReviewList }: Props) {
  const progress = ((index) / total) * 100;
  const catColor = CATEGORY_COLORS[term.category] || 'bg-gray-100 text-gray-800';
  const diffLabel = DIFFICULTY_LABELS[Math.min(term.difficulty, 5)];
  const diffColor = DIFFICULTY_COLORS[Math.min(term.difficulty, 5)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500 font-medium">
              {index + 1} / {total} 単語目
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={onReviewLater}
                title="あとで復習"
                className={`p-1.5 rounded-lg transition-colors ${isInReviewList ? 'text-sky-500 bg-sky-50' : 'text-gray-400 hover:text-sky-500 hover:bg-sky-50'}`}
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Term header */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 p-6 text-center">
          <span className="text-5xl mb-3 block">{term.icon}</span>
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColor}`}>
              {term.category}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${diffColor}`}>
              {diffLabel}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{term.term}</h2>
        </div>

        {/* Explanation */}
        <InfoCard icon="💡" title="どういう意味？" accent="sky">
          <p className="text-gray-700 text-sm leading-relaxed">{term.explanation}</p>
        </InfoCard>

        {/* Analogy */}
        <InfoCard icon="🤔" title="身近な例えで言うと？" accent="amber">
          <p className="text-gray-700 text-sm leading-relaxed">{term.analogy}</p>
        </InfoCard>

        {/* Usage */}
        <InfoCard icon="💼" title="実際の使われ方" accent="teal">
          <p className="text-gray-700 text-sm leading-relaxed">{term.usageExample}</p>
        </InfoCard>

        {/* Related terms */}
        {term.relatedTerms.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">関連する用語</p>
            <div className="flex flex-wrap gap-2">
              {term.relatedTerms.map((rt) => (
                <span key={rt} className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
                  {rt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mt-2 pb-6">
          <button
            onClick={onUnsure}
            className="flex items-center justify-center gap-2 py-4 px-4 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-2xl font-semibold transition-all duration-200 active:scale-95"
          >
            <AlertCircle className="w-5 h-5" />
            まだ不安
          </button>
          <button
            onClick={onUnderstood}
            className="flex items-center justify-center gap-2 py-4 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-semibold shadow-md shadow-sky-200 transition-all duration-200 active:scale-95"
          >
            <CheckCircle className="w-5 h-5" />
            理解した！
          </button>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, title, accent, children }: { icon: string; title: string; accent: string; children: React.ReactNode }) {
  const accentMap: Record<string, string> = {
    sky: 'border-sky-200 bg-sky-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
    teal: 'border-teal-200 bg-teal-50/50',
  };

  return (
    <div className={`rounded-2xl border p-4 ${accentMap[accent] || 'border-gray-200 bg-gray-50'}`}>
      <p className="text-xs font-semibold text-gray-500 mb-2">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}
