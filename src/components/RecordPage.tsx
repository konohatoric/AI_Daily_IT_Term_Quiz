import { useState } from 'react';
import { ChevronLeft, BookOpen, Trophy, Flame, Target, AlertCircle, BookmarkCheck, BarChart2, X, ChevronRight } from 'lucide-react';
import { LearningRecord } from '../types';
import { Term } from '../types';
import { INITIAL_TERMS, CATEGORY_COLORS } from '../data/initialTerms';
import { getAccuracy, getWeakCategories } from '../utils/storage';

interface Props {
  record: LearningRecord;
  onBack: () => void;
  onReview: () => void;
}

export default function RecordPage({ record, onBack, onReview }: Props) {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showAllLearned, setShowAllLearned] = useState(false);
  const accuracy = getAccuracy(record);
  const weakCats = getWeakCategories(record);

  const learnedTerms = INITIAL_TERMS.filter((t) => record.learnedTermIds.includes(t.id));
  const weakTerms = INITIAL_TERMS.filter((t) => record.weakTermIds.includes(t.id));
  const reviewTerms = INITIAL_TERMS.filter((t) => record.reviewListIds.includes(t.id));

  const today = new Date().toISOString().split('T')[0];
  const recentDates = record.studyDates.slice(-14).reverse();

  const categoryStats = Object.entries(record.weakCategories)
    .filter(([, s]) => s.total > 0)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-800">学習記録</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-10">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <BigStatCard icon={<BookOpen className="w-6 h-6 text-sky-500" />} label="学習した単語数" value={`${record.learnedTermIds.length}語`} bg="bg-sky-50" />
          <BigStatCard icon={<Trophy className="w-6 h-6 text-amber-500" />} label="クイズ正解率" value={record.totalQuizzes > 0 ? `${accuracy}%` : '---'} bg="bg-amber-50" />
          <BigStatCard icon={<Flame className="w-6 h-6 text-orange-500" />} label="連続学習日数" value={`${record.streak}日`} bg="bg-orange-50" />
          <BigStatCard icon={<Target className="w-6 h-6 text-green-500" />} label="クイズ受験数" value={`${record.totalQuizzes}問`} bg="bg-green-50" />
        </div>

        {/* Accuracy bar */}
        {record.totalQuizzes > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">総合正解率</p>
              <p className="text-sm font-bold text-sky-600">{accuracy}%</p>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{record.correctQuizzes} / {record.totalQuizzes} 問正解</p>
          </div>
        )}

        {/* Study calendar */}
        {recentDates.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">学習履歴（直近14日）</p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 14 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (13 - i));
                const dateStr = d.toISOString().split('T')[0];
                const studied = record.studyDates.includes(dateStr);
                const isToday = dateStr === today;
                return (
                  <div
                    key={dateStr}
                    title={dateStr}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${studied ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'} ${isToday ? 'ring-2 ring-sky-400 ring-offset-1' : ''}`}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">青い日 = 学習済み</p>
          </div>
        )}

        {/* Category accuracy */}
        {categoryStats.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              <p className="text-sm font-semibold text-gray-700">カテゴリ別正解率</p>
            </div>
            <div className="space-y-3">
              {categoryStats.map(([cat, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                const catColor = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700';
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>{cat}</span>
                      <span className={`text-xs font-bold ${pct < 60 ? 'text-red-500' : 'text-green-600'}`}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct < 60 ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weak categories */}
        {weakCats.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-red-700">苦手カテゴリ</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {weakCats.map((cat) => (
                <span key={cat} className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weak terms */}
        {weakTerms.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-semibold text-gray-700">苦手な用語</p>
              </div>
              <span className="text-xs text-gray-400">{weakTerms.length}語</span>
            </div>
            <div className="space-y-2">
              {weakTerms.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-1">
                  <span className="text-lg">{t.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{t.term}</p>
                    <p className="text-xs text-gray-500 truncate">{t.explanation}</p>
                  </div>
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">{t.category}</span>
                </div>
              ))}
            </div>
            {weakTerms.length > 8 && (
              <p className="text-xs text-gray-400 mt-2 text-center">他 {weakTerms.length - 8}語...</p>
            )}
          </div>
        )}

        {/* Review list */}
        {reviewTerms.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookmarkCheck className="w-4 h-4 text-sky-500" />
              <p className="text-sm font-semibold text-gray-700">復習リスト</p>
            </div>
            <div className="space-y-2">
              {reviewTerms.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-1">
                  <span className="text-lg">{t.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{t.term}</p>
                    <p className="text-xs text-gray-500 truncate">{t.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learned terms list */}
        {learnedTerms.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">学習済みの用語</p>
              <span className="text-xs text-gray-400">{learnedTerms.length}語</span>
            </div>
            <div className="space-y-1">
              {(showAllLearned ? learnedTerms : learnedTerms.slice(0, 8)).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTerm(t)}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-sky-50 transition-colors text-left"
                >
                  <span className="text-xl shrink-0">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{t.term}</p>
                    <p className="text-xs text-gray-500 truncate">{t.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {record.weakTermIds.includes(t.id) && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">苦手</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
            {learnedTerms.length > 8 && (
              <button
                onClick={() => setShowAllLearned((v) => !v)}
                className="mt-2 w-full text-xs text-sky-600 hover:text-sky-700 font-medium py-2 text-center transition-colors"
              >
                {showAllLearned ? '閉じる' : `さらに ${learnedTerms.length - 8}語 を見る`}
              </button>
            )}
          </div>
        )}

        {/* Review button */}
        {(weakTerms.length > 0 || reviewTerms.length > 0) && (
          <button
            onClick={onReview}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-5 h-5" />
            苦手・復習リストを学習する
          </button>
        )}

        {record.learnedTermIds.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">まだ学習記録がありません</p>
            <p className="text-xs mt-1">「今日のコース」を始めてみましょう！</p>
          </div>
        )}
      </main>

      {/* Term detail modal */}
      {selectedTerm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedTerm(null); }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 pt-4 pb-3 flex items-center justify-between rounded-t-3xl sm:rounded-t-3xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTerm.icon}</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{selectedTerm.term}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[selectedTerm.category] || 'bg-gray-100 text-gray-700'}`}>
                      {selectedTerm.category}
                    </span>
                    {record.weakTermIds.includes(selectedTerm.id) && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">苦手</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTerm(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <ModalSection icon="💡" title="どういう意味？" accent="sky">
                <p className="text-gray-700 text-sm leading-relaxed">{selectedTerm.explanation}</p>
              </ModalSection>

              <ModalSection icon="🤔" title="身近な例えで言うと？" accent="amber">
                <p className="text-gray-700 text-sm leading-relaxed">{selectedTerm.analogy}</p>
              </ModalSection>

              <ModalSection icon="💼" title="実際の使われ方" accent="teal">
                <p className="text-gray-700 text-sm leading-relaxed">{selectedTerm.usageExample}</p>
              </ModalSection>

              {selectedTerm.relatedTerms.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">関連する用語</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.relatedTerms.map((rt) => (
                      <span key={rt} className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
                        {rt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pb-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">クイズ問題</p>
                <div className="bg-sky-50 rounded-xl p-4">
                  <p className="text-sm text-gray-800 font-medium mb-3">{selectedTerm.quiz.question}</p>
                  <div className="space-y-2">
                    {selectedTerm.quiz.choices.map((c) => (
                      <div
                        key={c}
                        className={`text-sm px-3 py-2 rounded-lg border ${c === selectedTerm.quiz.answer ? 'bg-green-50 border-green-300 text-green-800 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        {c === selectedTerm.quiz.answer && '✓ '}{c}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">{selectedTerm.quiz.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BigStatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function ModalSection({ icon, title, accent, children }: { icon: string; title: string; accent: string; children: React.ReactNode }) {
  const accentMap: Record<string, string> = {
    sky: 'border-sky-200 bg-sky-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
    teal: 'border-teal-200 bg-teal-50/50',
  };
  return (
    <div className={`rounded-xl border p-4 ${accentMap[accent] || 'border-gray-200 bg-gray-50'}`}>
      <p className="text-xs font-semibold text-gray-500 mb-2">{icon} {title}</p>
      {children}
    </div>
  );
}
