import React from 'react';
import {
  FileText,
  Files,
  Briefcase,
  Shield,
  CheckCircle2,
  Eye,
  Trash2,
  Download,
  Database,
  Sparkles,
  Clock,
  Activity
} from 'lucide-react';
import { AnalyticsOverview, DatasetSummary, HealthStatus } from '../../types';
import { Badge } from '../common/Badge';
import { apiClient } from '../../api/client';

interface DashboardPageProps {
  overview: AnalyticsOverview | null;
  health?: HealthStatus | null;
  onOpenGenerator: () => void;
  onSelectDataset: (id: string) => void;
  onRefresh: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  overview,
  health,
  onOpenGenerator,
  onSelectDataset,
  onRefresh
}) => {
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Permanently delete dataset ${id} from MongoDB?`)) {
      try {
        await apiClient.deleteDataset(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete dataset: ' + err);
      }
    }
  };

  const totalDatasets = overview?.total_datasets || 0;
  const totalDocs = overview?.total_documents || 0;
  const privCount = overview?.privileged_count || 0;
  const respCount = overview?.responsive_count || 0;
  const privPct = totalDocs > 0 ? Math.round((privCount / totalDocs) * 100) : 0;
  const respPct = totalDocs > 0 ? Math.round((respCount / totalDocs) * 100) : 0;

  return (
    <div className="space-y-8 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Litigation Telemetry & Repository</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Litigation Metadata Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted MongoDB collections, Bates-sequenced corpus statistics, and model benchmarking metrics.
          </p>
        </div>

        <button
          onClick={onOpenGenerator}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Synthetic Batch</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Persistence Engine
            </span>
            <span className="text-xs font-bold text-white">
              {health?.database.status === 'connected' ? (health.database.type || 'MongoDB Atlas') : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Active LLM Foundation
            </span>
            <span className="text-xs font-bold text-indigo-300 font-mono">
              {health?.generative_ai.model || 'Gemini 3.8 Flash'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Last Generation Dispatch
            </span>
            <span className="text-xs font-medium text-slate-300">
              {health?.database.last_generation ? new Date(health.database.last_generation).toLocaleDateString() : 'Awaiting initialization'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Datasets</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Files className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{totalDatasets}</p>
          <p className="text-[11px] text-slate-400">Active MongoDB records</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Documents</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{totalDocs}</p>
          <p className="text-[11px] text-slate-400">Synthetic Bates metadata</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Privileged Rate</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{privPct}%</p>
          <p className="text-[11px] text-slate-400">{privCount} privileged documents</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Responsive Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">{respPct}%</p>
          <p className="text-[11px] text-slate-400">{respCount} responsive documents</p>
        </div>
      </div>

      {/* Recent Datasets Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Datasets</h2>
            <p className="text-xs text-slate-400">Select any row to inspect records, inline edit metadata, or export</p>
          </div>
          {totalDatasets > 0 && (
            <span className="text-xs text-slate-400 font-mono">
              Showing {overview?.recent_datasets?.length || 0} recent
            </span>
          )}
        </div>

        {totalDatasets === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <p className="text-sm font-semibold text-slate-200">No Datasets In Repository</p>
              <p className="text-xs text-slate-400">
                Generate your first synthetic litigation dataset using the structured parameter form or natural language prompt.
              </p>
            </div>
            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
            >
              <span>Create First Dataset</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Dataset ID</th>
                  <th className="py-3 px-4">Case / Dataset Title</th>
                  <th className="py-3 px-4">Litigation Scenario</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Validation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {overview?.recent_datasets?.map((ds: DatasetSummary) => (
                  <tr
                    key={ds.dataset_id}
                    onClick={() => onSelectDataset(ds.dataset_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-400">
                      {ds.dataset_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                      {ds.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type="scenario" value={ds.scenario_type} />
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {ds.document_count} records
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(ds.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {ds.validation_status?.is_valid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400">
                          {ds.validation_status?.error_count} warnings
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        title="View Preview"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDataset(ds.dataset_id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        title="Download CSV"
                        href={apiClient.getExportCsvUrl(ds.dataset_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        title="Delete Dataset"
                        onClick={(e) => handleDelete(ds.dataset_id, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
