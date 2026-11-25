import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Table,
  BarChart3,
  History,
  BookOpen,
  User,
  Shield,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedDatasetId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  selectedDatasetId
}) => {
  const { isAuthenticated } = useAuth();

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'generator', label: 'Synthetic Generator', icon: Sparkles },
    {
      id: 'preview',
      label: 'Dataset Preview',
      icon: Table,
      disabled: !selectedDatasetId,
      badge: selectedDatasetId ? 'Loaded' : undefined
    },
    {
      id: 'analytics',
      label: 'Litigation Analytics',
      icon: BarChart3,
      disabled: !selectedDatasetId,
      badge: selectedDatasetId ? 'Active' : undefined
    },
    { id: 'history', label: 'Dataset Repository', icon: History },
    { id: 'landing', label: 'Methodology & About', icon: BookOpen }
  ];

  return (
    <aside className="w-64 bg-[#070A0F] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 font-medium">
            Core Modules
          </p>
          <nav className="space-y-1 mt-2">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.id}
                  disabled={isDisabled}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30'
                      : isDisabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Selected Dataset Widget */}
        {selectedDatasetId ? (
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Active Corpus
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-mono text-indigo-300 truncate font-semibold">
              {selectedDatasetId}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-950 border border-dashed border-slate-800/80 rounded-xl text-center">
            <p className="text-[11px] text-slate-400">
              No dataset active. Select from Dashboard or generate a new batch.
            </p>
          </div>
        )}

        {/* Account / Authentication navigation */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 font-medium">
            Workspace
          </p>
          <div className="mt-2 space-y-1">
            {isAuthenticated ? (
              <button
                onClick={() => setCurrentTab('account')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  currentTab === 'account'
                    ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <User className="w-4 h-4 text-slate-400" />
                <span className="truncate">Account Settings</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  currentTab === 'login' || currentTab === 'register'
                    ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Counsel Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini 3.8 Flash</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Multi-batch structured generation with Pydantic self-repair & Bates verification.
          </p>
        </div>
      </div>
    </aside>
  );
};
