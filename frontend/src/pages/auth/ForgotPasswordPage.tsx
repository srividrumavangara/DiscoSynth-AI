import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process password recovery request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] font-sans flex flex-col justify-between p-6">
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-[#F5F5F5]">DiscoSynth</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
            AI
          </span>
        </Link>
        <Link to="/login" className="text-xs text-[#737373] hover:text-[#A3A3A3] transition-colors">
          &larr; Back to Sign In
        </Link>
      </div>

      <div className="w-full max-w-sm mx-auto my-12 bg-[#111111] border border-[#262626] rounded-xl p-8 space-y-6 shadow-2xl">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F5]">Reset Password</h1>
          <p className="text-xs text-[#737373]">
            Enter your institutional email to receive a recovery link
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-[#141A14] border border-[#204020] rounded-lg text-xs space-y-3">
            <p className="font-semibold text-[#80FF80]">Recovery Link Dispatched</p>
            <p className="text-[#A3A3A3] leading-relaxed">
              If an enterprise workspace exists for <strong className="text-white">{email}</strong>, you will receive password reset instructions.
            </p>
            <Link
              to="/login"
              className="inline-block pt-2 text-xs text-[#F5F5F5] hover:underline font-semibold"
            >
              Return to Sign In &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 bg-[#1F1414] border border-[#402020] rounded text-[11px] text-[#FF8080]">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[#A3A3A3] font-medium">Institutional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="counsel@firm-ediscovery.com"
                className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#303030] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#737373] text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-[#F5F5F5] hover:bg-white text-[#080808] font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer mt-2"
            >
              {loading ? 'Sending...' : 'Send Recovery Instructions'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[#737373] pt-2 border-t border-[#1C1C1C]">
          <Link to="/login" className="text-[#A3A3A3] hover:text-[#F5F5F5] font-medium">
            Remembered your password? Sign in
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#555555] font-mono">
        <span>&copy; {new Date().getFullYear()} DiscoSynth AI &middot; Synthetic Litigation Metadata Only</span>
      </div>
    </div>
  );
}
