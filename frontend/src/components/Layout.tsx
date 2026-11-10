import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Globe, PlusCircle, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { getHealth } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const h = await getHealth();
        if (mounted) {
          setBackendStatus(h.status === 'healthy' || h.status === 'ok' ? 'connected' : 'connected');
        }
      } catch {
        if (mounted) setBackendStatus('error');
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p.includes('/generate')) return 'Generate';
    if (p.includes('/datasets') || p.includes('/explorer')) return 'Datasets';
    if (p.includes('/analytics')) return 'Analytics';
    if (p.includes('/history')) return 'Audit History';
    if (p.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#080808] text-[#F5F5F5] antialiased font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#0d0d0d] border-b border-[#262626] px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-[#737373] hover:text-[#F5F5F5] flex items-center gap-1.5 transition-colors pr-3 border-r border-[#262626]"
              title="Return to Public Website"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Public</span>
            </Link>
            <span className="text-xs font-mono text-[#737373]">
              workspace
            </span>
            <span className="text-[#303030]">/</span>
            <span className="text-xs font-medium text-[#F5F5F5]">{getBreadcrumb()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141414] border border-[#262626] text-xs">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-400'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-[#A3A3A3] text-[11px] font-mono">
                {backendStatus === 'connected'
                  ? 'API 8000 Connected'
                  : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Backend Disconnected'}
              </span>
            </div>

            <Link
              to="/app/generate"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-md text-xs font-semibold transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Generate</span>
            </Link>

            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-[#262626]">
                <div className="h-6 w-6 rounded-full bg-[#262626] text-[#F5F5F5] border border-[#303030] flex items-center justify-center text-[10px] font-mono font-semibold">
                  {user.avatarLetter}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-medium text-[#F5F5F5] leading-none">
                    {user.name}
                  </div>
                  <div className="text-[9px] text-[#737373] font-mono leading-none mt-0.5 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign out"
                  className="text-[#737373] hover:text-[#F5F5F5] p-1 transition-colors ml-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#080808]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
