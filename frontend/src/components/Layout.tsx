import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PlusCircle, Search, Server, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import { getHealth } from '../api/client';

export default function Layout() {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'checking' | 'error'>('checking');
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

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard Overview';
    if (p.startsWith('/generate')) return 'Dataset Generator Engine';
    if (p.startsWith('/explorer')) return 'Litigation Records Explorer';
    if (p.startsWith('/analytics')) return 'Analytics & Quality Metrics';
    if (p.startsWith('/history')) return 'Generation Audit History';
    if (p.startsWith('/settings')) return 'System Diagnostics & Disclaimers';
    return 'DiscoSynth AI';
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        {/* Figma-Style Top Bar */}
        <header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">
              DiscoSynth
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-800">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Backend Connection Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-500 shadow-xs shadow-emerald-500'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-600 font-medium text-[11px] font-mono">
                {backendStatus === 'connected'
                  ? 'API Connected (Port 8000)'
                  : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Backend Disconnected'}
              </span>
            </div>

            {/* Quick Action Button */}
            <Link
              to="/generate"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5 text-violet-400" />
              <span>Generate</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto space-y-6">{Outlet ? <Outlet /> : null}</div>
        </main>
      </div>
    </div>
  );
}
