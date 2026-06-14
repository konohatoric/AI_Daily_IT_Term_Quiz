import { Trophy, RotateCcw, Home, Star } from 'lucide-react';

interface Props {
  results: { termId: string; correct: boolean; category: string }[];
  termNames: Record<string, string>;
  onContinue: () => void;
  onGoHome: () => void;
}

export default function QuizResult({ results, termNames, onContinue, onGoHome }: Props) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);

  let message = '';
  let emoji = '';
  if (pct === 100) { message = '完璧です！素晴らしい！'; emoji = '🏆'; }
  else if (pct >= 70) { message = 'よくできました！'; emoji = '🌟'; }
  else if (pct >= 50) { message = 'もう少しで完璧！'; emoji = '💪'; }
  else { message = 'もう一度復習しよう！'; emoji = '📖'; }

  const wrongTerms = results.filter((r) => !r.correct).map((r) => termNames[r.termId] || r.termId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-5">
        {/* Score card */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-sky-200">
          <p className="text-4xl mb-2">{emoji}</p>
          <h1 className="text-2xl font-bold mb-1">クイズ結果</h1>
          <p className="text-white/80 text-sm mb-4">{message}</p>
          <div className="text-6xl font-black mb-2">{pct}%</div>
          <p className="text-white/80 text-sm">{total}問中 {correct}問 正解</p>

          {/* Score bar */}
          <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <ScoreItem label="正解" value={correct} color="text-green-600 bg-green-50" />
          <ScoreItem label="不正解" value={total - correct} color="text-red-500 bg-red-50" />
          <ScoreItem label="正解率" value={`${pct}%`} color="text-sky-600 bg-sky-50" />
        </div>

        {/* Wrong terms */}
        {wrongTerms.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-800 font-semibold text-sm mb-2">😊 苦手として記録した用語</p>
            <div className="flex flex-wrap gap-2">
              {wrongTerms.map((t) => (
                <span key={t} className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-amber-600 text-xs mt-2">次回のコースで重点的に復習できます</p>
          </div>
        )}

        {pct === 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
            <p className="text-yellow-800 font-bold">全問正解おめでとう！</p>
            <p className="text-yellow-600 text-xs mt-1">今日のクイズは完璧でした！</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            次の用語を学ぶ
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5 text-sky-500" />
            トップに戻る
          </button>
        </div>
      </main>
    </div>
  );
}

function ScoreItem({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-3 text-center`}>
      <p className="text-xs opacity-70 mb-0.5">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  );
}
