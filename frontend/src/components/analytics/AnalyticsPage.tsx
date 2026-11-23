import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Users, Calendar, Tag, ArrowLeft } from 'lucide-react';
import { DatasetAnalytics } from '../../types';
import { apiClient } from '../../api/client';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AnalyticsPageProps {
  datasetId: string;
  onBackToPreview: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ datasetId, onBackToPreview }) => {
  const [data, setData] = useState<DatasetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getDatasetAnalytics(datasetId);
        setData(res);
      } catch (err) {
        console.error('Failed to load dataset analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [datasetId]);

  if (loading) {
    return <LoadingSpinner message="Calculating dataset distributions..." />;
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        No analytics data available for dataset {datasetId}.
      </div>
    );
  }

  const PRIVILEGE_COLORS: Record<string, string> = {
    'Not Privileged': '#475569',
    'Attorney-Client': '#f59e0b',
    'Work Product': '#a855f7',
    'Joint Defense': '#ec4899'
  };

  const RESPONSIVENESS_COLORS: Record<string, string> = {
    'Responsive': '#10b981',
    'Non-Responsive': '#f43f5e'
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBackToPreview}
            className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dataset Preview</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Dataset Analytics & Distributions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical breakdown of the {data.total_documents} synthetic documents in{' '}
            <span className="font-mono text-indigo-300">{datasetId}</span>.
          </p>
        </div>
      </div>

      {/* Grid of Visualizations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart 1: Document Categories */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            Document Type Breakdown
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Custodians */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Documents by Custodian
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.custodian_distribution}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                  tickFormatter={(val) => (val.length > 15 ? val.substring(0, 15) + '...' : val)}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Privilege Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            Privilege Classification
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.privilege_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {data.privilege_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIVILEGE_COLORS[entry.name] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Responsiveness Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            Responsiveness Classification (TAR Target)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.responsiveness_distribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {data.responsiveness_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={RESPONSIVENESS_COLORS[entry.name] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Timeline by Year */}
        {data.year_distribution?.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 md:col-span-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Document Timeline Chronology (by Year)
            </h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.year_distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Top Issue Tags */}
      {data.top_tags?.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            Top Case Issue Tags Generated
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.top_tags.map((t, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2"
              >
                <span>{t.tag}</span>
                <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60 font-bold">
                  {t.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
