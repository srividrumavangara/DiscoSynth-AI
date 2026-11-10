import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getDatasets, deleteDataset } from '../api/client';
import type { Dataset } from '../types';

export default function History() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      console.error('Failed to delete dataset:', err);
      alert('Failed to delete dataset. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dataset history..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Generation History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, inspect, or remove previously generated synthetic litigation metadata sets.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No history found"
          description="You haven't generated any datasets yet. Create your first synthetic scenario dataset now."
          action={
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-lg hover:bg-navy-700 font-medium text-sm"
            >
              Generate Dataset
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dataset Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Scenario
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {datasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-navy-800">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/explorer/${ds.id}`}
                          className="hover:underline flex items-center gap-1.5 text-navy-800"
                        >
                          {ds.name}
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {ds.scenario.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {ds.num_records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="capitalize">{ds.generation_method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ds.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {ds.quality_score ? `${ds.quality_score}%` : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(ds.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/explorer/${ds.id}`)}
                          className="px-2.5 py-1 text-xs font-medium text-navy-700 bg-navy-50 rounded-md hover:bg-navy-100"
                        >
                          Explore
                        </button>
                        <button
                          onClick={() => navigate(`/analytics/${ds.id}`)}
                          className="px-2.5 py-1 text-xs font-medium text-accent-700 bg-accent-50 rounded-md hover:bg-accent-100"
                        >
                          Analytics
                        </button>
                        <button
                          onClick={() => handleDelete(ds.id, ds.name)}
                          disabled={deletingId === ds.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-40"
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
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 border border-green-200',
    generating: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    failed: 'bg-red-100 text-red-700 border border-red-200',
    pending: 'bg-gray-100 text-gray-600 border border-gray-200',
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}
