import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Database,
  BarChart3,
  Clock,
  Settings,
  Zap,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generate', icon: PlusCircle, label: 'Generate Dataset' },
  { to: '/explorer', icon: Database, label: 'Dataset Explorer' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics & Quality' },
  { to: '/history', icon: Clock, label: 'Generation History' },
  { to: '/settings', icon: Settings, label: 'Settings & Status' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0f1d] border-r border-slate-800/80 text-white flex flex-col z-30 select-none">
      {/* Brand Header linking to Public Site */}
      <div className="px-5 py-5 border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-3 group" title="Return to Public Website">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                DiscoSynth
              </h1>
              <span className="px-1.5 py-0.2 rounded-md bg-violet-500/20 text-violet-300 font-mono text-[10px] font-semibold border border-violet-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Synthetic Litigation Engine</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-violet-600/20 text-white font-semibold border border-violet-500/30 shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{label}</span>
                {isActive && (
                  <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Quick Action Card in Sidebar */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-b from-slate-900 to-[#0e162a] border border-slate-800/90 text-xs">
        <div className="flex items-center gap-2 mb-1.5 text-violet-300 font-semibold text-[11px]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Need Benchmark Data?</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed mb-2.5">
          Generate up to 5,000 synthetic records with realistic privilege distributions.
        </p>
        <NavLink
          to="/generate"
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white font-medium text-[11px] transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Dataset</span>
        </NavLink>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>v1.0.0</span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Synthetic Guard Active
        </span>
      </div>
    </aside>
  );
}
