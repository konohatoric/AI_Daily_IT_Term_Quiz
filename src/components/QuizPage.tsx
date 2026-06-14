import { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { Term } from '../types';

interface Props {
  terms: Term[];
  onComplete: (results: { termId: string; correct: boolean; category: string }[]) => void;
}

export default function QuizPage({ terms, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<{ termId: string; correct: boolean; category: string }[]>([]);
  const [showResult, setShowResult] = useState(false);

  const current = terms[currentIndex];
  const isCorrect = selected === current?.quiz.answer;

  function handleSelect(choice: string) {
    if (selected !== null) return;
    setSelected(choice);
    setShowResult(true);
  }

  function handleNext() {
    const newResults = [...results, { termId: current.id, correct: isCorrect, category: current.category }];
    setResults(newResults);

    if (currentIndex + 1 >= terms.length) {
      onComplete(newResults);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setShowResult(false);
    }
  }

  if (!current) return null;

  const progress = ((currentIndex) / terms.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-sky-600">🎯 クイズタイム</span>
            <span className="text-sm text-gray-500">{currentIndex + 1} / {terms.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Question card */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{current.icon}</span>
            <p className="text-xs font-medium text-gray-500">{current.category}</p>
          </div>
          <p className="text-gray-800 font-semibold text-base leading-relaxed">{current.quiz.question}</p>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          {current.quiz.choices.map((choice) => {
            let style = 'bg-white border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50';
            if (selected !== null) {
              if (choice === current.quiz.answer) {
                style = 'bg-green-50 border-green-400 text-green-800';
              } else if (choice === selected && choice !== current.quiz.answer) {
                style = 'bg-red-50 border-red-400 text-red-800';
              } else {
                style = 'bg-white border-gray-200 text-gray-400';
              }
            }

            return (
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                disabled={selected !== null}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${style} ${selected === null ? 'active:scale-98' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {selected !== null && choice === current.quiz.answer && (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  )}
                  {selected !== null && choice === selected && choice !== current.quiz.answer && (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <span>{choice}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className={`rounded-2xl p-4 border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`font-bold text-sm mb-1 ${isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
              {isCorrect ? '🎉 正解！すばらしい！' : '😊 惜しい！正解は「' + current.quiz.answer + '」でした'}
            </p>
            <p className={`text-xs leading-relaxed ${isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
              {current.quiz.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {currentIndex + 1 >= terms.length ? '結果を見る' : '次の問題へ'}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </main>
    </div>
  );
}
