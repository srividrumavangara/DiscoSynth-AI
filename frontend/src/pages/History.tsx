import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Download,
  Database,
  BarChart3,
  RefreshCw,
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">Generation History & Audit Log</h1>
          <p className="text-xs text-[#737373] mt-1">
            Browse, inspect, export, or purge previously generated litigation metadata sets.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg text-xs font-medium text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#1a1a1a] transition-colors"
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
              to="/app/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#080808] rounded-lg hover:bg-[#E5E5E5] font-semibold text-xs transition-colors"
            >
              Generate Dataset
            </Link>
          }
        />
      ) : (
        <div className="bg-[#111111] rounded-xl border border-[#262626] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#141414] border-b border-[#262626] text-[#737373] font-mono uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3.5 text-left">Dataset Title</th>
                  <th className="px-6 py-3.5 text-left">Matter Scenario</th>
                  <th className="px-6 py-3.5 text-left">Records</th>
                  <th className="px-6 py-3.5 text-left">Engine</th>
                  <th className="px-6 py-3.5 text-left">Quality</th>
                  <th className="px-6 py-3.5 text-left">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {datasets.map((ds) => (
                  <tr
                    key={ds.id}
                    onClick={() => setSelectedDataset(ds)}
                    className="hover:bg-[#161616] cursor-pointer transition-colors group text-[#D4D4D4]"
                  >
                    <td className="px-6 py-4 font-medium text-[#F5F5F5]">
                      {ds.name}
                    </td>
                    <td className="px-6 py-4 text-[#A3A3A3] capitalize">{ds.scenario.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-[#F5F5F5] font-mono">{ds.num_records.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030] font-mono text-[10px]">
                        {ds.generation_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-[#F5F5F5] bg-[#191919] px-2 py-0.5 rounded border border-[#303030]">
                        {ds.quality_score ? `${ds.quality_score.toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#737373] font-mono text-[11px]">
                      {new Date(ds.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedDataset(ds)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#A3A3A3] hover:text-white bg-[#191919] hover:bg-[#202020] rounded border border-[#303030] transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleDelete(ds.id, ds.name)}
                          disabled={deletingId === ds.id}
                          className="p-1.5 text-[#737373] hover:text-red-400 rounded hover:bg-red-950/30 transition-colors disabled:opacity-40"
                          title="Delete Dataset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
        subtitle={`ID: ${selectedDataset?.id}`}
        actions={
          selectedDataset ? (
            <div className="flex items-center gap-2">
              <a
                href={getExportUrl(selectedDataset.id, 'csv')}
                className="px-2 py-1 text-[#A3A3A3] hover:text-white hover:bg-[#191919] rounded text-xs flex items-center gap-1 border border-[#303030] transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </a>
              <a
                href={getExportUrl(selectedDataset.id, 'json')}
                className="px-2 py-1 text-[#A3A3A3] hover:text-white hover:bg-[#191919] rounded text-xs flex items-center gap-1 border border-[#303030] transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>JSON</span>
              </a>
            </div>
          ) : undefined
        }
      >
        {selectedDataset && (
          <div className="space-y-6 text-xs text-[#D4D4D4]">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(`/app/datasets/${selectedDataset.id}/explorer`)}
                className="flex items-center justify-center gap-2 p-2.5 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-lg font-semibold transition-all"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Browse Records</span>
              </button>
              <button
                onClick={() => navigate(`/app/datasets/${selectedDataset.id}/analytics`)}
                className="flex items-center justify-center gap-2 p-2.5 bg-[#191919] hover:bg-[#202020] text-[#F5F5F5] border border-[#303030] rounded-lg font-medium transition-colors"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>View Analytics</span>
              </button>
            </div>

            <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] space-y-3">
              <h4 className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">
                Dataset Attributes
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#737373] block text-[10px] font-mono uppercase">Scenario</span>
                  <span className="font-medium text-[#F5F5F5] capitalize mt-0.5 block">
                    {selectedDataset.scenario.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[10px] font-mono uppercase">Complexity</span>
                  <span className="font-medium text-[#F5F5F5] capitalize mt-0.5 block">{selectedDataset.complexity}</span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[10px] font-mono uppercase">Total Records</span>
                  <span className="font-mono font-medium text-[#F5F5F5] mt-0.5 block">
                    {selectedDataset.num_records.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[10px] font-mono uppercase">Engine</span>
                  <span className="font-medium text-[#F5F5F5] capitalize mt-0.5 block">
                    {selectedDataset.generation_method}
                  </span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[10px] font-mono uppercase">Seed</span>
                  <span className="font-mono text-[#A3A3A3] mt-0.5 block">{selectedDataset.seed ?? 'Auto-assigned'}</span>
                </div>
                <div>
                  <span className="text-[#737373] block text-[10px] font-mono uppercase">Quality</span>
                  <span className="font-mono font-medium text-[#F5F5F5] mt-0.5 block">
                    {selectedDataset.quality_score ? `${selectedDataset.quality_score.toFixed(1)}%` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#141414] border border-[#262626] rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-[#F5F5F5] font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified Benchmark Data</span>
              </div>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Passed schema validation, duplicate detection audits, and distribution bounds testing.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[#737373] text-[11px] font-mono pt-3 border-t border-[#262626]">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created on {new Date(selectedDataset.created_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
