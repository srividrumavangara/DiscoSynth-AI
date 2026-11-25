import React, { useState } from 'react';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, Scale, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('All fields are required for researcher account creation.');
      return;
    }

    if (password.length < 6) {
      setError('Security policy requires at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password
      });
      onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      const detail = err?.response?.data?.detail;
      setError(detail || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#070A0F] text-slate-100">
      {/* Editorial Legal-Tech Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0B0F19] to-slate-900/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                DiscoSynth <span className="text-indigo-400 font-mono text-base font-medium">AI</span>
              </span>
              <p className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">
                Synthetic Litigation Metadata Platform
              </p>
            </div>
          </div>

          <div className="mt-16 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 mb-6">
              <Shield className="w-3.5 h-3.5" />
              <span>Researcher Workspace Registration</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
              Join the Synthetic <br />
              <span className="text-slate-400 font-medium">
                Litigation Benchmark.
              </span>
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Create a personalized environment to store synthetic discovery datasets, fine-tune scenario prompts with Gemini 3.8 Flash, and export Bates-sequenced corpus for testing.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 pt-12 border-t border-slate-800/60">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Dedicated user catalog with individual dataset isolation</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Full compatibility with legacy and demonstration datasets</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Secure JWT bearer token authentication session</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          Antigravity Academic Edition • Production Legal Architecture
        </div>
      </div>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex lg:hidden items-center gap-2 mb-4">
              <Scale className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-bold text-white">DiscoSynth AI</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Create Researcher Account
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Register to start generating synthetic litigation metadata.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name & Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Attorney Sarah Chen, Lead Litigation Counsel"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.chen@law.university.edu"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span>Registering account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Already have an authenticated workspace? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-indigo-400 hover:text-indigo-300 font-medium ml-1 transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
