import { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Server,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { getHealth } from '../api/client';
import type { HealthStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Settings() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to query health endpoint:', err);
      setHealth({
        status: 'disconnected',
        database: 'unreachable',
        llm_provider: 'unavailable',
        llm_status: 'unreachable',
        version: '1.0.0',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) return <LoadingSpinner message="Checking system diagnostics..." />;

  const isHealthy = health?.status === 'healthy';
  const isDbConnected = health?.database === 'connected';

  return (
    <div className="p-8 max-w-5xl space-y-6 mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">Settings & System Info</h1>
          <p className="text-xs text-[#737373] mt-1">
            Engine status, AI model runtime provider diagnostics, and synthetic data safeguards.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg text-xs font-medium text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Recheck API</span>
        </button>
      </div>

      {/* Diagnostics / Status Cards */}
      <div className="bg-[#111111] rounded-xl border border-[#262626] p-6 space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] flex items-center gap-2">
          <Server className="h-4 w-4" />
          <span>Runtime Environment & Health</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-4 rounded-lg bg-[#141414] border border-[#222]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#737373] uppercase">API Service</span>
              {isHealthy ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              )}
            </div>
            <p className="text-base font-semibold text-[#F5F5F5] capitalize">{health?.status || 'Unknown'}</p>
            <p className="text-[11px] text-[#737373] mt-1 font-mono">REST backend operational</p>
          </div>

          <div className="p-4 rounded-lg bg-[#141414] border border-[#222]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#737373] uppercase">Database</span>
              {isDbConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              )}
            </div>
            <p className="text-base font-semibold text-[#F5F5F5] capitalize">{health?.database || 'Unknown'}</p>
            <p className="text-[11px] text-[#737373] mt-1 font-mono">SQLAlchemy ORM layer</p>
          </div>

          <div className="p-4 rounded-lg bg-[#141414] border border-[#222]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#737373] uppercase">AI Scenario Engine</span>
              <Cpu className="h-3.5 w-3.5 text-[#A3A3A3]" />
            </div>
            <p className="text-sm font-semibold text-[#F5F5F5] truncate" title={health?.llm_provider}>
              {health?.llm_provider || 'Mock Engine'}
            </p>
            <p className="text-[11px] text-[#737373] mt-1 font-mono">Hybrid stochastic / LLM</p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-[#111111] rounded-xl border border-[#262626] p-6 space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>About DiscoSynth AI</span>
        </h2>
        <div className="text-xs text-[#A3A3A3] space-y-3 leading-relaxed">
          <p>
            <strong className="text-[#F5F5F5]">DiscoSynth AI</strong> is an AI-assisted synthetic litigation metadata generator designed
            for electronic discovery (e-discovery) benchmarking, legal-tech software testing, and machine
            learning validation.
          </p>
          <p>
            Because law firms and corporate legal departments are legally and ethically bound by attorney-client
            privilege, GDPR, HIPAA, and protective orders, sharing realistic litigation data has historically been
            nearly impossible. DiscoSynth AI bridges this gap by generating <em className="text-[#F5F5F5]">logically consistent document metadata</em>
            without requiring or touching any genuine litigation documents.
          </p>
          <div className="pt-3 border-t border-[#1e1e1e] flex flex-wrap gap-4 text-[11px] font-mono text-[#737373]">
            <div>
              <span className="text-[#A3A3A3]">Stack:</span> React + Vite + FastAPI + SQLAlchemy
            </div>
            <div>
              <span className="text-[#A3A3A3]">Storage:</span> PostgreSQL / SQLite Fallback
            </div>
            <div>
              <span className="text-[#A3A3A3]">GenAI:</span> Google Gemini / Configurable Provider
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Data Disclaimer */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-[#A3A3A3]">
            <h3 className="font-semibold text-[#F5F5F5]">Ethical Notice & Synthetic Data Disclaimer</h3>
            <p className="leading-relaxed">
              1. <strong className="text-[#F5F5F5]">Exclusively Synthetic:</strong> All identities, custodian names, corporations, case numbers,
              dates, and classifications generated by DiscoSynth AI are entirely fictitious and procedural. Any resemblance
              to real persons, active litigations, or existing corporations is purely coincidental.
            </p>
            <p className="leading-relaxed">
              2. <strong className="text-[#F5F5F5]">Metadata Only:</strong> The platform produces structured litigation document metadata records
              (e.g., custodian relationships, issue tags, responsive flags, privilege logs), NOT actual legal text or
              evidentiary document files.
            </p>
            <p className="leading-relaxed">
              3. <strong className="text-[#F5F5F5]">No Confidential Ingestion:</strong> The platform does not require or accept confidential enterprise
              files as input. It operates using generative scenario prompts and statistical probability models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
