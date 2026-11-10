import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  FileText,
  Layers,
  Award,
  PlusCircle,
  ExternalLink,
  Download,
  BarChart3,
  Sliders,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SlideOver from '../components/SlideOver';
import BottomScrollUp from '../components/BottomScrollUp';
import { getDatasets, getDatasetAnalytics, getExportUrl, generateDataset } from '../api/client';
import type { Dataset, AnalyticsData } from '../types';

const MODERN_PALETTE = ['#4f46e5', '#06b6d4', '#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isQuickGenOpen, setIsQuickGenOpen] = useState(false);
  const [generatingQuick, setGeneratingQuick] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await getDatasets(1, 50);
        setDatasets(res.items);
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

  const handleQuickPreset = async (scenario: string, name: string) => {
    setGeneratingQuick(true);
    try {
      const created = await generateDataset({
        name,
        scenario,
        num_records: 500,
        complexity: 'intermediate',
        document_types: ['email', 'pdf', 'docx', 'financial_report'],
        classification_distribution: 'realistic',
        generation_method: 'ai-assisted',
      });
      setIsQuickGenOpen(false);
      navigate(`/explorer/${created.id}`);
    } catch (err) {
      alert('Generation failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGeneratingQuick(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading litigation intelligence..." />;

  if (datasets.length === 0) {
    return (
      <div>
        <EmptyState
          title="No litigation datasets generated yet"
          description="Use the generator to create synthetic metadata benchmarks for e-discovery testing."
          action={
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium text-xs transition-all shadow-sm"
            >
              <PlusCircle className="h-4 w-4 text-violet-400" />
              Generate First Dataset
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
      ? (
          completedWithScore.reduce((sum, d) => sum + (d.quality_score || 0), 0) /
          completedWithScore.length
        ).toFixed(1)
      : '—';

  // Clean data helper without ugly overlapping text
  const docTypeData = analytics
    ? Object.entries(analytics.document_type_distribution).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
    : [];

  const responsiveData = analytics
    ? [
        { name: 'Responsive', value: analytics.responsive_distribution.responsive || 0 },
        { name: 'Non-Responsive', value: analytics.responsive_distribution.non_responsive || 0 },
      ]
    : [];

  const privilegeData = analytics
    ? Object.entries(analytics.privilege_distribution).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[11px] font-semibold border border-violet-500/30">
              E-Discovery Benchmarks
            </span>
            <span className="text-slate-400 text-xs">• 100% Synthetic & Safe</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Litigation Metadata Intelligence</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Statistical distributions, document families, and attorney-client privilege probabilities
            calibrated for machine learning validation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsQuickGenOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-semibold backdrop-blur-xs transition-all"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-300" />
            <span>Quick Presets</span>
          </button>
          <Link
            to="/generate"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/30 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Dataset</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Datasets"
          value={datasets.length}
          subtitle="Generated test matters"
          icon={<Database className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <StatsCard
          title="Total Records"
          value={totalRecords.toLocaleString()}
          subtitle="Synthetic documents"
          icon={<FileText className="h-5 w-5 text-violet-600" />}
          iconBg="bg-violet-50"
        />
        <StatsCard
          title="Litigation Scenarios"
          value={uniqueScenarios}
          subtitle="Corporate, IP & more"
          icon={<Layers className="h-5 w-5 text-cyan-600" />}
          iconBg="bg-cyan-50"
        />
        <StatsCard
          title="Average Quality"
          value={`${avgQuality}%`}
          subtitle="Integrity score"
          icon={<Award className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Modern Donut Charts - Replaces messy overlapping pie charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Document Types */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Document Type Mix
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {analytics.total_records || totalRecords} docs
              </span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={docTypeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {docTypeData.map((_, i) => (
                      <Cell key={i} fill={MODERN_PALETTE[i % MODERN_PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {docTypeData.length}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Types</span>
              </div>
            </div>
            {/* Custom Clean Badges List */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-xs">
              {docTypeData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between px-2 py-1 rounded-md bg-slate-50">
                  <span className="flex items-center gap-1.5 truncate text-[11px] text-slate-600 capitalize">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: MODERN_PALETTE[i % MODERN_PALETTE.length] }}
                    />
                    {d.name}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-700">
                    {Math.round((d.value / (analytics.total_records || totalRecords || 1)) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Responsiveness */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Responsiveness Split
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Target Ratio</span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={responsiveData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    <Cell fill="#4f46e5" />
                    <Cell fill="#cbd5e1" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-indigo-600 font-mono">
                  {Math.round(
                    ((analytics.responsive_distribution.responsive || 0) /
                      (analytics.total_records || totalRecords || 1)) *
                      100
                  )}
                  %
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Responsive</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-xs">
              <div className="text-center">
                <p className="text-[11px] text-slate-400">Responsive</p>
                <p className="text-sm font-bold text-indigo-600 font-mono">
                  {analytics.responsive_distribution.responsive?.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-[11px] text-slate-400">Non-Responsive</p>
                <p className="text-sm font-bold text-slate-500 font-mono">
                  {analytics.responsive_distribution.non_responsive?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Privilege Distribution */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Privilege Logs
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Attorney-Client</span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Pie
                    data={privilegeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    <Cell fill="#0f172a" />
                    <Cell fill="#6366f1" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {analytics.privilege_distribution.privileged?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Privileged</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] px-1 text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Not Privileged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Privileged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                Partial
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Generations with Figma-Style Side Opening */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Generated Datasets</h2>
            <p className="text-xs text-slate-400">
              Click any row to open the Figma-style property inspector side panel.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <th className="px-6 py-3 text-left">Dataset Name</th>
                <th className="px-6 py-3 text-left">Litigation Matter</th>
                <th className="px-6 py-3 text-left">Records</th>
                <th className="px-6 py-3 text-left">Engine</th>
                <th className="px-6 py-3 text-left">Quality Score</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasets.map((ds) => (
                <tr
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-3.5 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="group-hover:text-indigo-600 transition-colors">{ds.name}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 capitalize">
                    {ds.scenario.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 font-mono">
                    {ds.num_records.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium capitalize text-[10px]">
                      {ds.generation_method === 'ai-assisted' && (
                        <Sparkles className="h-3 w-3 text-violet-500" />
                      )}
                      {ds.generation_method}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {ds.quality_score ? `${ds.quality_score}%` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {ds.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDataset(ds);
                      }}
                      className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-medium text-[11px] transition-colors"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Opening (Drawer / Inspector Sheet) */}
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
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                title="Download CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </a>
              <a
                href={getExportUrl(selectedDataset.id, 'json')}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 border border-slate-200"
                title="Download JSON"
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
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(`/explorer/${selectedDataset.id}`)}
                className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Database className="h-4 w-4 text-violet-400" />
                <span>Browse Records Table</span>
              </button>
              <button
                onClick={() => navigate(`/analytics/${selectedDataset.id}`)}
                className="flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <span>Deep Analytics</span>
              </button>
            </div>

            {/* Properties Grid */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Matter Configuration
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Scenario</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedDataset.scenario.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Complexity</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedDataset.complexity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Document Count</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedDataset.num_records.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Engine Method</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedDataset.generation_method}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reproducible Seed</span>
                  <span className="font-mono text-slate-700">
                    {selectedDataset.seed ?? 'Auto-generated'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Quality Score</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {selectedDataset.quality_score}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Score Breakdown Notice */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Quality Score Verified ({selectedDataset.quality_score}%)</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Evaluated against schema compliance, non-null field completeness, document ID uniqueness,
                chronological bounds, and distribution adherence.
              </p>
            </div>

            {/* Created Timestamp */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created on {new Date(selectedDataset.created_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Bottom Scroll-Up Panel (Instant Scenario Presets) */}
      <BottomScrollUp
        isOpen={isQuickGenOpen}
        onClose={() => setIsQuickGenOpen(false)}
        title="Quick Litigation Scenario Presets"
        subtitle="One-click instantaneous synthetic dataset generation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Select a pre-calibrated scenario to quickly launch 500 records with full attorney-client privilege
            and e-discovery responsiveness tags.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                scenario: 'corporate_fraud',
                title: 'Corporate Financial Fraud',
                desc: 'Whistleblower, wire transfers, executive emails, and accounting discrepancies.',
              },
              {
                scenario: 'ip_dispute',
                title: 'Semiconductor Patent Infringement',
                desc: 'Chip designs, R&D engineering logs, reverse engineering, and licensing agreements.',
              },
              {
                scenario: 'employment_litigation',
                title: 'Systemic Discrimination Class Action',
                desc: 'HR complaints, severance memos, performance reviews, and internal chat transcripts.',
              },
              {
                scenario: 'financial_misconduct',
                title: 'AML / Regulatory Non-Compliance',
                desc: 'Offshore accounts, KYC compliance failures, sanctions, and wire fraud memos.',
              },
            ].map((p) => (
              <div
                key={p.scenario}
                className="p-4 rounded-xl border border-slate-200 hover:border-violet-500 bg-slate-50/50 hover:bg-violet-50/30 transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => handleQuickPreset(p.scenario, `${p.title} Benchmark`)}
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{p.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-violet-600">
                  <span>Generate 500 Records</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

          {generatingQuick && (
            <div className="py-4 text-center">
              <LoadingSpinner message="Generating preset dataset..." />
            </div>
          )}
        </div>
      </BottomScrollUp>
    </div>
  );
}
