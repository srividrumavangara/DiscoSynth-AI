import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, ShieldCheck, ChevronRight, BarChart3, Database } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getDatasets, getDatasetAnalytics, getDatasetQuality, getExportUrl } from '../api/client';
import type { Dataset, AnalyticsData, QualityReport } from '../types';

const MODERN_COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

export default function Analytics() {
  const { datasetId } = useParams<{ datasetId: string }>();
  if (!datasetId) return <DatasetPicker />;
  return <AnalyticsView datasetId={datasetId} />;
}

function DatasetPicker() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDatasets(1, 50)
      .then((res) => setDatasets(res.items.filter((d) => d.status === 'completed')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Querying dataset metrics..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analytics & Quality Engine</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select a dataset to view statistical distributions, timeline trends, and validation audits.
        </p>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No analytics available"
          description="Generate a synthetic dataset first to compute distributions."
          action={
            <Link
              to="/generate"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Generate Dataset
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((ds) => (
            <Link
              key={ds.id}
              to={`/analytics/${ds.id}`}
              className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 hover:border-violet-500 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {ds.scenario.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {ds.quality_score}% Quality
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors text-sm">
                  {ds.name}
                </h3>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{ds.num_records.toLocaleString()} records</span>
                <span className="font-semibold text-violet-600 flex items-center gap-1">
                  View Analytics <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsView({ datasetId }: { datasetId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [quality, setQuality] = useState<QualityReport | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDatasetAnalytics(datasetId),
      getDatasetQuality(datasetId),
      getDatasets(1, 100),
    ])
      .then(([a, q, dsRes]) => {
        setAnalytics(a);
        setQuality(q);
        const match = dsRes.items.find((d) => d.id === datasetId);
        if (match) setDataset(match);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [datasetId]);

  if (loading) return <LoadingSpinner message="Calculating high-dimensional distributions..." />;
  if (!analytics) return <EmptyState title="No analytics found" description="Metrics unavailable." />;

  const toArr = (obj: Record<string, number>) =>
    Object.entries(obj).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  const docTypeData = toArr(analytics.document_type_distribution);
  const responsiveData = [
    { name: 'Responsive', value: analytics.responsive_distribution.responsive || 0 },
    { name: 'Non-Responsive', value: analytics.responsive_distribution.non_responsive || 0 },
  ];
  const privilegeData = toArr(analytics.privilege_distribution);
  const confData = toArr(analytics.confidentiality_distribution);
  const reviewData = toArr(analytics.review_status_distribution);
  const issueData = Object.entries(analytics.issue_tag_frequency)
    .slice(0, 8)
    .map(([name, value]) => ({ name: `#${name}`, value }));

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    border: 'none',
    color: '#fff',
    fontSize: '11px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {dataset?.scenario.replace(/_/g, ' ') || 'Litigation'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              {analytics.total_records || dataset?.num_records || 0} documents analyzed
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {dataset?.name || 'Dataset Analytics'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/explorer/${datasetId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-violet-400" />
            <span>Open in Explorer</span>
          </Link>
          <a
            href={getExportUrl(datasetId, 'csv')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </a>
          <a
            href={getExportUrl(datasetId, 'json')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON</span>
          </a>
        </div>
      </div>

      {/* Quality Score Breakdown Card */}
      {quality && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Synthetic Data Quality Audit</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Composite: {(quality.overall_score * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
            {[
              { label: 'Schema Validity', value: quality.schema_validity, weight: '25%' },
              { label: 'Completeness', value: quality.completeness, weight: '25%' },
              { label: 'ID Uniqueness', value: quality.uniqueness, weight: '20%' },
              { label: 'Logical Consistency', value: quality.logical_consistency, weight: '20%' },
              { label: 'Distribution Adherence', value: quality.distribution_adherence, weight: '10%' },
            ].map(({ label, value, weight }) => (
              <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{weight}</span>
                  <span className="font-mono font-bold text-slate-700">
                    {((value ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 truncate mb-2">{label}</p>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(value ?? 0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Clean Modern Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Type Bar Chart */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Document Types Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Responsiveness Clean Donut Chart */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Responsive Document Ratio
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {Math.round(
                ((analytics.responsive_distribution.responsive || 0) /
                  (analytics.total_records || dataset?.num_records || 1)) *
                  100
              )}
              % Relevant
            </span>
          </div>
          <div className="h-60 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie data={responsiveData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={4}>
                  <Cell fill="#4f46e5" />
                  <Cell fill="#cbd5e1" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-slate-800">
                {analytics.responsive_distribution.responsive?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Docs Responsive</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
              Responsive: {analytics.responsive_distribution.responsive?.toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Non-Responsive: {analytics.responsive_distribution.non_responsive?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Creation Timeline */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Document Generation Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Tag Frequency */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Top Litigation Issue Tags
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
