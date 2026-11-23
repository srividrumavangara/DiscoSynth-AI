import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Table,
  BarChart3,
  History,
  BookOpen
} from 'lucide-react';

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
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Synthetic Generator', icon: Sparkles },
    {
      id: 'preview',
      label: 'Dataset Preview',
      icon: Table,
      disabled: !selectedDatasetId,
      subLabel: selectedDatasetId ? 'Active' : 'Select a dataset'
    },
    {
      id: 'analytics',
      label: 'Dataset Analytics',
      icon: BarChart3,
      disabled: !selectedDatasetId,
      subLabel: selectedDatasetId ? 'Active' : 'Select a dataset'
    },
    { id: 'history', label: 'Dataset History', icon: History },
    { id: 'landing', label: 'Methodology & About', icon: BookOpen }
  ];

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 px-3">
            Navigation
          </p>
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
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
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : isDisabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.subLabel && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {item.subLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {selectedDatasetId && (
          <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
              Loaded Dataset
            </span>
            <p className="text-xs font-mono font-medium text-indigo-300 truncate">
              {selectedDatasetId}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800/60 space-y-2">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-300">Academic Evaluation</p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
            Generative AI for confidential-free e-discovery benchmarking and TAR model training.
          </p>
        </div>
      </div>
    </aside>
  );
};
