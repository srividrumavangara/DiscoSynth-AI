import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  FileText,
  Layers,
  Award,
  PlusCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getDatasets, getDatasetAnalytics } from '../api/client';
import type { Dataset, AnalyticsData } from '../types';

const COLORS = ['#1a2846', '#34508c', '#4164af', '#6783bf', '#8da2cf', '#6641ff', '#8567ff'];

export default function Dashboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getDatasets(1, 50);
        setDatasets(res.items);
        // Fetch analytics for the most recent completed dataset
        const completed = res.items.find((d) => d.status === 'completed');
        if (completed) {
          const a = await getDatasetAnalytics(completed.id);
          setAnalytics(a);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (datasets.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy-800 mb-6">Dashboard</h1>
        <EmptyState
          title="No datasets yet"
          description="Generate your first synthetic litigation metadata dataset to see dashboard analytics."
          action={
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-lg hover:bg-navy-700 font-medium text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Generate Dataset
            </Link>
          }
        />
      </div>
    );
  }

  const totalRecords = datasets.reduce((sum, d) => sum + d.num_records, 0);
  const uniqueScenarios = new Set(datasets.map((d) => d.scenario)).size;
  const completedWithScore = datasets.filter((d) => d.quality_score !== null);
  const avgQuality =
    completedWithScore.length > 0
      ? (completedWithScore.reduce((sum, d) => sum + (d.quality_score || 0), 0) / completedWithScore.length).toFixed(1)
      : '—';

  const pieData = (obj: Record<string, number>) =>
    Object.entries(obj).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Datasets" value={datasets.length} icon={<Database className="h-5 w-5 text-accent-600" />} iconBg="bg-accent-50" />
        <StatsCard title="Total Records" value={totalRecords.toLocaleString()} icon={<FileText className="h-5 w-5 text-navy-600" />} iconBg="bg-navy-50" />
        <StatsCard title="Scenarios" value={uniqueScenarios} icon={<Layers className="h-5 w-5 text-accent-600" />} iconBg="bg-accent-50" />
        <StatsCard title="Avg Quality" value={`${avgQuality}%`} icon={<Award className="h-5 w-5 text-green-600" />} iconBg="bg-green-50" />
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Document Type Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData(analytics.document_type_distribution)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {pieData(analytics.document_type_distribution).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Responsive Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData(analytics.responsive_distribution)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill="#1a2846" />
                  <Cell fill="#b3c1df" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Privilege Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData(analytics.privilege_distribution)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData(analytics.privilege_distribution).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Generations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Generations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Scenario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Records</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {datasets.slice(0, 5).map((ds) => (
                <tr key={ds.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-navy-800">
                    <Link to={`/explorer/${ds.id}`} className="hover:underline">{ds.name}</Link>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{ds.scenario.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-3 text-gray-600">{ds.num_records.toLocaleString()}</td>
                  <td className="px-6 py-3 text-gray-600">{ds.generation_method}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={ds.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-600">{ds.quality_score ? `${ds.quality_score}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    generating: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
