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
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Settings & System Info</h1>
          <p className="text-sm text-gray-500 mt-1">
            Engine status, AI model runtime provider diagnostics, and synthetic data safeguards.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Recheck API
        </button>
      </div>

      {/* Diagnostics / Status Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
          <Server className="h-5 w-5 text-accent-500" />
          Runtime Environment & Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-medium uppercase">API Service</span>
              {isHealthy ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-lg font-bold text-navy-800 capitalize">{health?.status || 'Unknown'}</p>
            <p className="text-xs text-gray-400 mt-1">REST backend operational</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-medium uppercase">Database</span>
              {isDbConnected ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-lg font-bold text-navy-800 capitalize">{health?.database || 'Unknown'}</p>
            <p className="text-xs text-gray-400 mt-1">SQLAlchemy ORM layer</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-medium uppercase">AI Scenario Engine</span>
              <Cpu className="h-4 w-4 text-accent-600" />
            </div>
            <p className="text-sm font-semibold text-navy-800 truncate" title={health?.llm_provider}>
              {health?.llm_provider || 'Mock Engine'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Hybrid stochastic / LLM</p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
          <Info className="h-5 w-5 text-navy-600" />
          About DiscoSynth AI
        </h2>
        <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
          <p>
            <strong>DiscoSynth AI</strong> is an AI-assisted synthetic litigation metadata generator designed
            for electronic discovery (e-discovery) benchmarking, legal-tech software testing, and machine
            learning validation.
          </p>
          <p>
            Because law firms and corporate legal departments are legally and ethically bound by attorney-client
            privilege, GDPR, HIPAA, and protective orders, sharing realistic litigation data has historically been
            nearly impossible. DiscoSynth AI bridges this gap by generating <em>logically consistent document metadata</em>
            without requiring or touching any genuine litigation documents.
          </p>
          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
            <div>
              <span className="font-semibold text-gray-700">Architecture:</span> React + Vite + FastAPI + SQLAlchemy
            </div>
            <div>
              <span className="font-semibold text-gray-700">Storage:</span> PostgreSQL / SQLite Fallback
            </div>
            <div>
              <span className="font-semibold text-gray-700">GenAI:</span> Google Gemini / Configurable Provider
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Data Disclaimer */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-amber-900">
            <h3 className="font-bold text-amber-950">Ethical Notice & Synthetic Data Disclaimer</h3>
            <p>
              1. <strong>Exclusively Synthetic:</strong> All identities, custodian names, corporations, case numbers,
              dates, and classifications generated by DiscoSynth AI are entirely fictitious and procedural. Any resemblance
              to real persons, active litigations, or existing corporations is purely coincidental.
            </p>
            <p>
              2. <strong>Metadata Only:</strong> The platform produces structured litigation document metadata records
              (e.g., custodian relationships, issue tags, responsive flags, privilege logs), NOT actual legal text or
              evidentiary document files.
            </p>
            <p>
              3. <strong>No Confidential Ingestion:</strong> The platform does not require or accept confidential enterprise
              files as input. It operates using generative scenario prompts and statistical probability models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
