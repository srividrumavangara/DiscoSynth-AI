import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Database,
  BarChart3,
  Clock,
  Settings,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generate', icon: PlusCircle, label: 'Generate Dataset' },
  { to: '/explorer', icon: Database, label: 'Dataset Explorer' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-navy-800 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <Zap className="h-7 w-7 text-accent-400" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">DiscoSynth AI</h1>
            <p className="text-xs text-navy-300">Synthetic Litigation Data</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy-600 text-white border-l-3 border-accent-400'
                  : 'text-navy-300 hover:bg-navy-700 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-navy-700">
        <p className="text-xs text-navy-400">v1.0.0 · All data is synthetic</p>
      </div>
    </aside>
  );
}
