import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, ShieldCheck, ChevronRight, Database } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getDatasets, getDatasetAnalytics, getDatasetQuality, getExportUrl } from '../api/client';
import type { Dataset, AnalyticsData, QualityReport } from '../types';

export default function Analytics() {
  const { datasetId, id } = useParams<{ datasetId?: string; id?: string }>();
  const activeId = datasetId || id;
  if (!activeId) return <DatasetPicker />;
  return <AnalyticsView datasetId={activeId} />;
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">Analytics & Quality Engine</h1>
        <p className="text-xs text-[#737373] mt-1">
          Select a dataset to view statistical distributions, timeline trends, and validation audits.
        </p>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No analytics available"
          description="Generate a synthetic dataset first to compute distributions."
          action={
            <Link
              to="/app/generate"
              className="px-4 py-2 bg-white text-[#080808] rounded-lg text-xs font-semibold hover:bg-[#E5E5E5] transition-colors"
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
              to={`/app/datasets/${ds.id}/analytics`}
              className="bg-[#111111] rounded-xl border border-[#262626] p-5 hover:border-[#404040] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
                    {ds.scenario.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-[#F5F5F5] bg-[#191919] px-2 py-0.5 rounded border border-[#303030]">
                    {ds.quality_score ? `${ds.quality_score.toFixed(1)}% Quality` : '—'}
                  </span>
                </div>
                <h3 className="font-semibold text-[#F5F5F5] group-hover:text-white transition-colors text-sm">
                  {ds.name}
                </h3>
              </div>

              <div className="pt-4 border-t border-[#1e1e1e] mt-4 flex items-center justify-between text-xs text-[#737373]">
                <span className="font-mono">{ds.num_records.toLocaleString()} records</span>
                <span className="font-medium text-[#F5F5F5] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
  const issueData = Object.entries(analytics.issue_tag_frequency)
    .slice(0, 8)
    .map(([name, value]) => ({ name: `#${name}`, value }));

  const tooltipStyle = {
    backgroundColor: '#191919',
    borderRadius: '8px',
    border: '1px solid #303030',
    color: '#F5F5F5',
    fontSize: '11px',
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111111] p-6 rounded-xl border border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
              {dataset?.scenario.replace(/_/g, ' ') || 'Litigation'}
            </span>
            <span className="text-[#303030]">&bull;</span>
            <span className="text-xs text-[#737373] font-mono">
              {analytics.total_records || dataset?.num_records || 0} documents analyzed
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
            {dataset?.name || 'Dataset Analytics'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/app/datasets/${datasetId}/explorer`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-lg text-xs font-semibold transition-all"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Open in Explorer</span>
          </Link>
          <a
            href={getExportUrl(datasetId, 'csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#191919] border border-[#303030] hover:bg-[#202020] rounded-lg text-xs font-medium text-[#D4D4D4] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </a>
          <a
            href={getExportUrl(datasetId, 'json')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#191919] border border-[#303030] hover:bg-[#202020] rounded-lg text-xs font-medium text-[#D4D4D4] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON</span>
          </a>
        </div>
      </div>

      {/* Quality Score Breakdown Card */}
      {quality && (
        <div className="bg-[#111111] rounded-xl border border-[#262626] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F5F5F5]" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3]">Synthetic Data Quality Audit</h3>
            </div>
            <span className="text-xs font-mono text-[#F5F5F5] bg-[#191919] px-2.5 py-0.5 rounded border border-[#303030]">
              Composite: {(quality.overall_score * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            {[
              { label: 'Schema Validity', value: quality.schema_validity, weight: '25%' },
              { label: 'Completeness', value: quality.completeness, weight: '25%' },
              { label: 'ID Uniqueness', value: quality.uniqueness, weight: '20%' },
              { label: 'Logical Consistency', value: quality.logical_consistency, weight: '20%' },
              { label: 'Distribution Adherence', value: quality.distribution_adherence, weight: '10%' },
            ].map(({ label, value, weight }) => (
              <div key={label} className="p-3 bg-[#141414] rounded-lg border border-[#222]">
                <div className="flex items-center justify-between text-[10px] text-[#737373] font-mono mb-1">
                  <span>{weight}</span>
                  <span className="text-[#F5F5F5] font-semibold">
                    {((value ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs font-medium text-[#D4D4D4] truncate mb-2">{label}</p>
                <div className="h-1 bg-[#262626] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${(value ?? 0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Monochromatic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Type Bar Chart */}
        <div className="bg-[#111111] rounded-xl border border-[#262626] p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] mb-4">
            Document Types Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#E5E5E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Responsiveness Clean Donut Chart */}
        <div className="bg-[#111111] rounded-xl border border-[#262626] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3]">
              Responsive Document Ratio
            </h3>
            <span className="text-xs font-mono font-semibold text-[#F5F5F5]">
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
                  <Cell fill="#FFFFFF" />
                  <Cell fill="#333333" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-[#F5F5F5]">
                {analytics.responsive_distribution.responsive?.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#737373] uppercase font-mono">Docs Responsive</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-[#A3A3A3] pt-3 border-t border-[#1e1e1e]">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white" />
              Responsive: {analytics.responsive_distribution.responsive?.toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#333]" />
              Non-Responsive: {analytics.responsive_distribution.non_responsive?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Creation Timeline */}
        <div className="bg-[#111111] rounded-xl border border-[#262626] p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] mb-4">
            Document Generation Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#FFFFFF" strokeWidth={1.5} dot={{ r: 2, fill: '#FFFFFF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Tag Frequency */}
        <div className="bg-[#111111] rounded-xl border border-[#262626] p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] mb-4">
            Top Litigation Issue Tags
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#A3A3A3' }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#737373" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
