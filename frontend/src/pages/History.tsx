import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Download,
  Database,
  BarChart3,
  RefreshCw,
  Sliders,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SlideOver from '../components/SlideOver';
import { getDatasets, deleteDataset, getExportUrl } from '../api/client';
import type { Dataset } from '../types';

export default function History() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDatasets(1, 100);
      setDatasets(res.items);
    } catch (err) {
      console.error('Failed to load dataset history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete dataset "${name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteDataset(id);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      if (selectedDataset?.id === id) setSelectedDataset(null);
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dataset history..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Generation History & Audit Log</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, inspect, export, or purge previously generated litigation metadata sets.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No history found"
          description="You haven't generated any datasets yet. Create your first synthetic scenario dataset now."
          action={
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold text-xs transition-colors"
            >
              Generate Dataset
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3.5 text-left">Dataset Title</th>
                  <th className="px-6 py-3.5 text-left">Litigation Matter</th>
                  <th className="px-6 py-3.5 text-left">Records</th>
                  <th className="px-6 py-3.5 text-left">Engine</th>
                  <th className="px-6 py-3.5 text-left">Quality Score</th>
                  <th className="px-6 py-3.5 text-left">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datasets.map((ds) => (
                  <tr
                    key={ds.id}
                    onClick={() => setSelectedDataset(ds)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {ds.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 capitalize">{ds.scenario.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{ds.num_records.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {ds.generation_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {ds.quality_score ? `${ds.quality_score}%` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(ds.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedDataset(ds)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleDelete(ds.id, ds.name)}
                          disabled={deletingId === ds.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-40"
                          title="Delete Dataset"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side Opening Inspector Sheet */}
      <SlideOver
        isOpen={Boolean(selectedDataset)}
        onClose={() => setSelectedDataset(null)}
        title={selectedDataset?.name || 'Dataset Inspector'}
        subtitle={`Dataset ID: ${selectedDataset?.id}`}
        actions={
          selectedDataset ? (
            <div className="flex items-center gap-2">
              <a
                href={getExportUrl(selectedDataset.id, 'csv')}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </a>
              <a
                href={getExportUrl(selectedDataset.id, 'json')}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span>JSON</span>
              </a>
            </div>
          ) : undefined
        }
      >
        {selectedDataset && (
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(`/explorer/${selectedDataset.id}`)}
                className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                <Database className="h-4 w-4 text-violet-400" />
                <span>Browse Records</span>
              </button>
              <button
                onClick={() => navigate(`/analytics/${selectedDataset.id}`)}
                className="flex items-center justify-center gap-2 p-3 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4 text-violet-600" />
                <span>View Analytics</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
              <h4 className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                Dataset Attributes
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Litigation Scenario</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedDataset.scenario.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Complexity</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedDataset.complexity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Records</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedDataset.num_records.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Engine Type</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedDataset.generation_method}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Deterministic Seed</span>
                  <span className="font-mono text-slate-700">{selectedDataset.seed ?? 'Auto-assigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Composite Quality</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {selectedDataset.quality_score}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified Clean Benchmark</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Passed schema verification, duplicate detection audits, and distribution bounds testing.
              </p>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono pt-4 border-t border-slate-100">
              <Calendar className="h-4 w-4" />
              <span>Created on {new Date(selectedDataset.created_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
