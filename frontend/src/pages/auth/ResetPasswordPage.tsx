import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
      setSuccess(true);
      setTimeout(() => navigate('/app/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
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
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F5]">Set New Password</h1>
          <p className="text-xs text-[#737373]">
            Choose a secure password for your workspace account
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-3 bg-[#191919] border border-[#303030] rounded-lg text-xs text-[#A3A3A3]">
              Password updated successfully. Redirecting you to the workspace...
            </div>
            <Link
              to="/app/dashboard"
              className="block w-full py-2.5 bg-white text-[#080808] text-center text-xs font-semibold rounded-lg hover:bg-[#E5E5E5] transition-all"
            >
              Continue to Workspace &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#A3A3A3] mb-1 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#191919] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#A3A3A3] mb-1 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-[#191919] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-[#080808] text-xs font-semibold rounded-lg hover:bg-[#E5E5E5] transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-[11px] text-[#555]">
        Synthetic litigation metadata bench &bull; All data synthetic
      </div>
    </div>
  );
}
