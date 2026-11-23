import React from 'react';
import { ShieldCheck, Database, Sparkles, AlertCircle } from 'lucide-react';
import { HealthStatus } from '../../types';

interface NavbarProps {
  health: HealthStatus | null;
  onOpenGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onOpenGenerator }) => {
  const isHealthy = health?.status === 'healthy';
  const isLLMReady = health?.generative_ai?.configured;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
            DiscoSynth <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
            Synthetic Litigation Metadata Engine
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Health Indicators */}
        <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/50 border border-slate-700/60 rounded-full px-3 py-1">
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className={isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
              {health ? (health.database.status === 'connected' ? (health.database.type || 'MongoDB Live') : 'DB Disconnected') : 'Connecting...'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-center space-x-1.5">
            {isLLMReady ? (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={isLLMReady ? 'text-indigo-300' : 'text-rose-400'}>
              {isLLMReady ? (health?.generative_ai?.model || 'Gemini 3.8 Flash') : 'API Key Required'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenGenerator}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Generation</span>
        </button>
      </div>
    </header>
  );
};
