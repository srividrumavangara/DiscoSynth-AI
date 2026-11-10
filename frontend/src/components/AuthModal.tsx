import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Shield, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, signIn, signUp, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (authModalMode === 'signup') {
        await signUp(email, name || 'Litigation Researcher', organization);
      } else {
        await signIn(email, password);
      }
      navigate('/app');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (role: string) => {
    demoLogin(role);
    navigate('/app');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeAuthModal}
      />

      <div className="relative w-full max-w-md bg-[#101A2C] border border-slate-700/60 rounded-3xl shadow-2xl text-white p-7 z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[11px] font-mono font-medium mb-3">
            <Lock className="h-3 w-3" />
            <span>Secure Workspace Access</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {authModalMode === 'signup' ? 'Create Counsel Workspace' : 'Welcome to DiscoSynth AI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'signup'
              ? 'Join litigation data science teams generating benchmark sets.'
              : 'Sign in to access your saved datasets, custom generators, and audit logs.'}
          </p>
        </div>

        {/* 1-Click Fast Track / Demo Access */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Instant Portfolio Access
            </span>
            <span className="text-[10px] text-slate-400 font-mono">No password required</span>
          </div>
          <button
            type="button"
            onClick={() => handleDemoSignIn('Lead e-Discovery Counsel')}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs flex items-center justify-between transition-all shadow-md shadow-indigo-600/20"
          >
            <span>Explore as Lead e-Discovery Counsel</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative flex py-2 items-center justify-center mb-4">
          <div className="grow border-t border-slate-800" />
          <span className="shrink mx-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Or with email credentials
          </span>
          <div className="grow border-t border-slate-800" />
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal / Technical Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jonathan Vance, Esq."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Firm or Enterprise Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Morrison & Partners E-Discovery Group"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Institutional Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="counsel@firm-litigation.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : authModalMode === 'signup' ? (
              <span>Create Account & Launch Workspace</span>
            ) : (
              <span>Sign In to Workspace</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {authModalMode === 'signup' ? (
            <p>
              Already have an enterprise account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('signin')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to DiscoSynth AI?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
              >
                Create an Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
