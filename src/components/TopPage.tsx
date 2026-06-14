import { BookOpen, Trophy, Flame, Sparkles, ChevronRight, BarChart2, LogOut } from 'lucide-react';
import { LearningRecord } from '../types';
import { getAccuracy } from '../utils/storage';

interface Props {
  record: LearningRecord;
  userEmail: string;
  onStart: () => void;
  onGoRecord: () => void;
  onLogout: () => void;
  isGenerating: boolean;
}

export default function TopPage({ record, userEmail, onStart, onGoRecord, onLogout, isGenerating }: Props) {
  const accuracy = getAccuracy(record);
  const today = new Date().toISOString().split('T')[0];
  const todayCount = record.studyDates.includes(today) ? record.learnedTermIds.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">IT用語マスター</span>
          </div>
          <button
            onClick={onGoRecord}
            className="flex items-center gap-1 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            学習記録
          </button>
          <button
            onClick={onLogout}
            title={userEmail}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Hero section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AIがあなたに合った用語を選ぶ
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            今日のIT用語、<br />
            <span className="text-sky-500">一緒に覚えよう</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            IT用語をAIが初心者に合わせて選んで学習コースを作ります
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-sky-500" />}
            label="学習単語"
            value={`${record.learnedTermIds.length}語`}
            bg="bg-sky-50"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-amber-500" />}
            label="正解率"
            value={record.totalQuizzes > 0 ? `${accuracy}%` : '---'}
            bg="bg-amber-50"
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="連続学習"
            value={`${record.streak}日`}
            bg="bg-orange-50"
          />
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            onClick={onStart}
            disabled={isGenerating}
            className="w-full py-4 px-6 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold rounded-2xl shadow-lg shadow-sky-200 transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AIが用語を選んでいます...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                今日のコースを始める
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            onClick={onGoRecord}
            className="w-full py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-200 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-5 h-5 text-sky-500" />
            学習記録を確認する
          </button>
        </div>

        {/* Weak category hint */}
        {record.weakTermIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-800 text-sm font-medium">
              💪 苦手な用語が {record.weakTermIds.length}個 あります
            </p>
            <p className="text-amber-600 text-xs mt-1">
              次のコースで重点的に復習できます
            </p>
          </div>
        )}

        {/* Feature cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">このアプリでできること</h2>
          <div className="grid gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-3 text-center`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-gray-800 text-sm">{value}</p>
    </div>
  );
}

const FEATURES = [
  { icon: '🤖', title: 'AIが今日の用語を自動選択', desc: 'あなたの学習履歴と苦手を分析して最適な用語を選びます' },
  { icon: '🃏', title: 'カード形式でわかりやすく学習', desc: '例え・使用例・関連用語で初心者でもイメージしやすい' },
  { icon: '🎯', title: '3択クイズで理解を確認', desc: '学習後すぐにクイズで定着度をチェックできます' },
  { icon: '📊', title: '学習記録で成長を実感', desc: '苦手カテゴリや正解率を可視化して学習を最適化' },
];
