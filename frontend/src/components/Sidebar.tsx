import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Database,
  BarChart3,
  Clock,
  Settings,
  ArrowUpRight,
} from 'lucide-react';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/generate', icon: PlusCircle, label: 'Generate' },
  { to: '/app/datasets', icon: Database, label: 'Datasets' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/history', icon: Clock, label: 'Audit History' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#0d0d0d] border-r border-[#262626] text-[#F5F5F5] flex flex-col z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-[#262626]">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-semibold text-sm tracking-tight text-[#F5F5F5] group-hover:text-white transition-colors">
            DiscoSynth
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
            AI
          </span>
        </Link>
        <Link
          to="/"
          className="text-[#737373] hover:text-[#F5F5F5] p-1 transition-colors"
          title="Return to Public Site"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#737373]">
          Workspace
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#191919] text-[#F5F5F5] border border-[#303030]'
                  : 'text-[#A3A3A3] hover:bg-[#141414] hover:text-[#F5F5F5]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#F5F5F5]' : 'text-[#737373] group-hover:text-[#A3A3A3]'
                  }`}
                />
                <span className="truncate">{label}</span>
                {isActive && (
                  <span className="ml-auto w-1 h-3 rounded-full bg-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Quick Action */}
      <div className="p-3 mx-3 mb-3 rounded-lg bg-[#141414] border border-[#262626]">
        <div className="text-[11px] font-medium text-[#F5F5F5] mb-1">
          Synthetic Benchmarking
        </div>
        <p className="text-[10px] text-[#737373] leading-relaxed mb-3">
          Configure rule-based or AI-assisted scenario generation runs.
        </p>
        <Link
          to="/app/generate"
          className="block w-full py-2 bg-white text-[#080808] hover:bg-[#E5E5E5] text-center text-xs font-semibold rounded-md transition-all"
        >
          + New Dataset
        </Link>
      </div>

      {/* Footer Info */}
      <div className="h-12 px-4 border-t border-[#262626] flex items-center justify-between text-[10px] text-[#737373] font-mono">
        <span>v1.0.0 &bull; Synthetic</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="System operational" />
      </div>
    </aside>
  );
}
