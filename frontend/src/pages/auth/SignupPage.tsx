import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const { signUp, demoLogin, isSupabaseLive } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await signUp(email, password, name, organization || 'Litigation Systems Inc.');
      if (res?.needsEmailVerification) {
        setVerificationSent(true);
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your details.');
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
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F5]">Create Account</h1>
          <p className="text-xs text-[#737373]">Access full synthetic dataset generation & exports</p>
        </div>

        {/* Demo Fast Track */}
        <div className="p-3 bg-[#161616] rounded-lg border border-[#2B2B2B] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#A3A3A3]">
            <span className="font-medium text-[#F5F5F5]">Isolated Demo Evaluation</span>
            <span className="font-mono text-[10px] text-[#737373]">No password</span>
          </div>
          <p className="text-[11px] text-[#737373] leading-relaxed">
            Instantly explore synthetic generation and quality checks in an isolated session.
          </p>
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 bg-[#202020] hover:bg-[#282828] text-[#F5F5F5] rounded-md text-xs font-semibold border border-[#383838] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Launch Demo Mode</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#262626] w-full" />
          <span className="bg-[#111111] px-3 text-[11px] font-mono text-[#737373] uppercase tracking-wider">
            {isSupabaseLive ? 'Or Real Account' : 'Credentials'}
          </span>
          <div className="border-t border-[#262626] w-full" />
        </div>

        {verificationSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <Check className="h-4 w-4" />
                <span>Verification Email Dispatched</span>
              </div>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                We sent a confirmation link to <span className="font-mono text-white">{email}</span>. Click the link in your email to activate your account, then sign in.
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 bg-white text-[#080808] text-center text-xs font-semibold rounded-lg hover:bg-[#E5E5E5] transition-all"
            >
              Go to Sign In &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#A3A3A3] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full bg-[#191919] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#A3A3A3] mb-1 uppercase tracking-wider">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full bg-[#191919] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#A3A3A3] mb-1 uppercase tracking-wider">
                Organization / Practice (Optional)
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Apex Litigation Group"
                className="w-full bg-[#191919] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#A3A3A3] mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#191919] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-[#080808] text-xs font-semibold rounded-lg hover:bg-[#E5E5E5] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[#737373]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#F5F5F5] hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-[11px] text-[#555]">
        All generated records are strictly synthetic &bull; No genuine client data ingested
      </div>
    </div>
  );
}
