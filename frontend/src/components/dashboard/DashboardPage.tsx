import React from 'react';
import {
  FileText,
  Files,
  Briefcase,
  Shield,
  CheckCircle2,
  ArrowRight,
  Eye,
  Trash2,
  Download,
  Database,
  Sparkles,
  Clock
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
    if (confirm(`Are you sure you want to delete dataset ${id}?`)) {
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
    <div className="space-y-8 pb-12">
      {/* Top Welcome / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Litigation Metadata Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time statistics derived from persisted MongoDB synthetic evaluation records.
          </p>
        </div>

        <button
          onClick={onOpenGenerator}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition cursor-pointer self-start md:self-auto"
        >
          <span>Generate New Dataset</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live System Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Database Engine</span>
            <span className="text-xs font-bold text-white">
              {health?.database.status === 'connected' ? (health.database.type || 'MongoDB Live') : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Active GenAI Model</span>
            <span className="text-xs font-bold text-indigo-300 font-mono">
              {health?.generative_ai.model || 'Gemini 3.8 Flash'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Last Successful Run</span>
            <span className="text-xs font-medium text-slate-300">
              {health?.database.last_generation ? new Date(health.database.last_generation).toLocaleDateString() : 'Ready for first run'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Datasets</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Files className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{totalDatasets}</p>
          <p className="text-[11px] text-slate-500">Stored in MongoDB</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Documents</span>
            <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{totalDocs}</p>
          <p className="text-[11px] text-slate-500">Synthetic Bates records</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Privileged Rate</span>
            <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{privPct}%</p>
          <p className="text-[11px] text-slate-500">{privCount} privileged documents</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Responsive Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white">{respPct}%</p>
          <p className="text-[11px] text-slate-500">{respCount} responsive documents</p>
        </div>
      </div>

      {/* Recent Datasets Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Generation History</h2>
            <p className="text-xs text-slate-400">Click any dataset to open its preview and analytics</p>
          </div>
          {totalDatasets > 0 && (
            <span className="text-xs text-slate-500 font-mono">
              Showing {overview?.recent_datasets?.length || 0} recent
            </span>
          )}
        </div>

        {totalDatasets === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <p className="text-sm font-semibold text-slate-200">No Datasets Generated Yet</p>
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
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Dataset ID</th>
                  <th className="py-3 px-4">Title / Case</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Created</th>
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
                    <td className="py-3.5 px-4 text-slate-400">
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
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        title="View Preview"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDataset(ds.dataset_id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        title="Download CSV"
                        href={apiClient.getExportCsvUrl(ds.dataset_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        title="Delete Dataset"
                        onClick={(e) => handleDelete(ds.dataset_id, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 cursor-pointer"
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
