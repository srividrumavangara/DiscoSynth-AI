import React, { useState } from 'react';
import { Scale, Database, Sparkles, AlertCircle, User, LogOut, ChevronDown } from 'lucide-react';
import { HealthStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  health: HealthStatus | null;
  onOpenGenerator: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onOpenGenerator, onNavigateTab }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isHealthy = health?.status === 'healthy';
  const isLLMReady = health?.generative_ai?.configured;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#070A0F]/95 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
      {/* Brand */}
      <div
        onClick={() => onNavigateTab('landing')}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400 transition-colors shadow-sm">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 font-sans">
            DiscoSynth <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-mono">
            Synthetic Litigation Metadata Engine
          </span>
        </div>
      </div>

      {/* Middle & Right Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* System Health Indicators */}
        <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-900/80 border border-slate-800 rounded-full px-3.5 py-1 font-mono">
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className={isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
              {health ? (health.database.status === 'connected' ? (health.database.type || 'MongoDB Atlas') : 'DB Disconnected') : 'Checking DB...'}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center space-x-1.5">
            {isLLMReady ? (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={isLLMReady ? 'text-indigo-300' : 'text-rose-400'}>
              {isLLMReady ? (health?.generative_ai?.model || 'Gemini 3.8 Flash') : 'API Key Missing'}
            </span>
          </div>
        </div>

        {/* Quick Generator CTA */}
        <button
          onClick={onOpenGenerator}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Synthetic Batch</span>
          <span className="sm:hidden">Generate</span>
        </button>

        {/* User Authentication Menu */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-bold font-mono flex items-center justify-center">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[120px] truncate">
                {user.full_name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-800/80">
                  <p className="font-semibold text-white truncate">{user.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigateTab('account');
                  }}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & Profile</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                    onNavigateTab('login');
                  }}
                  className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-t border-slate-800/60 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateTab('login')}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateTab('register')}
              className="hidden sm:inline text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-colors"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
