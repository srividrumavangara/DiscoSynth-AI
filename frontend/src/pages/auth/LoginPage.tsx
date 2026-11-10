import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { signIn, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    demoLogin('Lead e-Discovery Counsel');
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] font-sans flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-semibold text-sm tracking-tight text-[#F5F5F5]">DiscoSynth</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
            AI
          </span>
        </Link>
        <Link to="/" className="text-xs text-[#737373] hover:text-[#A3A3A3] transition-colors">
          &larr; Back to Public Website
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-sm mx-auto my-12 bg-[#111111] border border-[#262626] rounded-xl p-8 space-y-6 shadow-2xl">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F5]">Sign In</h1>
          <p className="text-xs text-[#737373]">Access your e-discovery metadata workspace</p>
        </div>

        {/* Demo Fast Track */}
        <div className="p-3 bg-[#161616] rounded-lg border border-[#2B2B2B] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#A3A3A3]">
            <span className="font-medium text-[#F5F5F5]">1-Click Demo Evaluation</span>
            <span className="font-mono text-[10px] text-[#737373]">No password</span>
          </div>
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 px-3 rounded bg-[#222222] hover:bg-[#2B2B2B] text-xs font-semibold text-[#F5F5F5] border border-[#333333] transition-colors flex items-center justify-between"
          >
            <span>Continue as Lead Counsel</span>
            <ArrowRight className="h-3 w-3 text-[#A3A3A3]" />
          </button>
        </div>

        <div className="relative flex py-1 items-center justify-center">
          <div className="grow border-t border-[#222222]" />
          <span className="shrink mx-3 text-[10px] font-mono text-[#555555] uppercase tracking-wider">
            Or credentials
          </span>
          <div className="grow border-t border-[#222222]" />
        </div>

        {error && (
          <div className="p-2.5 bg-[#1F1414] border border-[#402020] rounded text-[11px] text-[#FF8080]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[#A3A3A3] font-medium">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[#737373] hover:text-[#A3A3A3]">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded bg-[#0A0A0A] border border-[#303030] text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#737373] text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-[#F5F5F5] hover:bg-white text-[#080808] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            {loading ? <span>Authenticating...</span> : <span>Sign In to Workspace</span>}
          </button>
        </form>

        <div className="text-center text-xs text-[#737373] pt-2 border-t border-[#1C1C1C]">
          <span>Don't have an account? </span>
          <Link to="/signup" className="text-[#F5F5F5] hover:underline font-semibold ml-1">
            Create Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-[#555555] font-mono">
        <span>&copy; {new Date().getFullYear()} DiscoSynth AI &middot; Synthetic Litigation Metadata Only</span>
      </div>
    </div>
  );
}
