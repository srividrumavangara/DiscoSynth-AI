import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Scale, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both legal counsel email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      const detail = err?.response?.data?.detail;
      setError(detail || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#070A0F] text-slate-100">
      {/* Editorial Legal-Tech Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#0B0F19] to-slate-900/60 relative overflow-hidden">
        {/* Subtle grid pattern background */}
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero Confidential Data Exposure</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
              Realistic Litigation Metadata. <br />
              <span className="text-slate-400 font-medium">
                Without Real-World Risk.
              </span>
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Empowering e-discovery engineers, legal scholars, and corporate counsel to benchmark classification pipelines with mathematically grounded, fictional case metadata.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 pt-12 border-t border-slate-800/60">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Gemini 3.8 Flash structured multi-batch generation</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Sequential Bates stamping (ACC-000001) & custodian graphs</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Pydantic v2 automated schema enforcement & repair</span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          EDRM Phase 3 & 4 Compliant • Enterprise MongoDB Persistence
        </div>
      </div>

      {/* Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex lg:hidden items-center gap-2 mb-4">
              <Scale className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-bold text-white">DiscoSynth AI</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Litigation Counsel Portal
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Sign in to manage synthetic metadata repositories and generation parameters.
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
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counsel@legal-tech.org"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot credentials?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember_me" className="ml-2 block text-xs text-slate-400">
                Retain authentication session on this terminal
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span>Validating credentials...</span>
              ) : (
                <>
                  <span>Sign In to Repository</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>New e-discovery researcher? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-400 hover:text-indigo-300 font-medium ml-1 transition-colors underline-offset-4 hover:underline"
            >
              Request researcher credentials
            </button>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSwitchToLogin={() => setShowForgotModal(false)}
      />
    </div>
  );
};
