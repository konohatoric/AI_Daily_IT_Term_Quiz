import { useState } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onAuth: () => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onAuth();
    } catch (err: any) {
      const msg: Record<string, string> = {
        'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
        'User already registered': 'このメールアドレスはすでに登録されています',
        'Password should be at least 6 characters': 'パスワードは6文字以上にしてください',
        'Unable to validate email address: invalid format': 'メールアドレスの形式が正しくありません',
      };
      setError(msg[err.message] ?? err.message ?? '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-500 rounded-2xl shadow-lg shadow-sky-200 mb-1">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">IT用語マスター</h1>
          <div className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            AIが今日の学習用語を選んでくれる
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '6文字以上' : 'パスワード'}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold rounded-xl shadow-md shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                'ログイン'
              ) : (
                'アカウントを作成'
              )}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              アカウントをお持ちでない方は{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className="text-sky-600 hover:text-sky-700 font-semibold"
              >
                新規登録
              </button>
            </>
          ) : (
            <>
              すでにアカウントをお持ちの方は{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-sky-600 hover:text-sky-700 font-semibold"
              >
                ログイン
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
