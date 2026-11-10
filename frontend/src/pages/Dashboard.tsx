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

// Refined monochromatic editorial palette for charts
const MONO_PALETTE = ['#FFFFFF', '#D4D4D4', '#A3A3A3', '#737373', '#525252', '#404040', '#262626'];

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
      navigate(`/app/datasets/${created.id}/explorer`);
    } catch (err) {
      alert('Generation failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGeneratingQuick(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading litigation intelligence..." />;

  if (datasets.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="No litigation datasets generated yet"
          description="Use the generator to create synthetic metadata benchmarks for e-discovery testing."
          action={
            <Link
              to="/app/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#080808] rounded-lg hover:bg-[#E5E5E5] font-semibold text-xs transition-all"
            >
              <PlusCircle className="h-4 w-4" />
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] border border-[#262626] rounded-xl p-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] font-mono text-[10px] uppercase tracking-wider border border-[#303030]">
              E-Discovery Benchmarks
            </span>
            <span className="text-[#737373] text-xs">&bull; 100% Synthetic & Safe</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F5]">Litigation Metadata Intelligence</h1>
          <p className="text-xs text-[#A3A3A3] mt-1 max-w-xl leading-relaxed">
            Statistical distributions, document families, and attorney-client privilege probabilities
            calibrated for machine learning validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsQuickGenOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#191919] hover:bg-[#202020] text-[#D4D4D4] border border-[#303030] rounded-lg text-xs font-medium transition-colors"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Presets</span>
          </button>
          <Link
            to="/app/generate"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
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
          icon={<Database className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Records"
          value={totalRecords.toLocaleString()}
          subtitle="Synthetic documents"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatsCard
          title="Scenarios"
          value={uniqueScenarios}
          subtitle="Corporate, IP, Antitrust"
          icon={<Layers className="h-4 w-4" />}
        />
        <StatsCard
          title="Average Quality"
          value={`${avgQuality}%`}
          subtitle="Integrity score"
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      {/* Monochromatic Donut Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Document Types */}
          <div className="bg-[#111111] rounded-xl border border-[#262626] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider font-mono">
                Document Type Mix
              </h3>
              <span className="text-[11px] font-mono text-[#737373]">
                {analytics.total_records || totalRecords} docs
              </span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#191919',
                      borderRadius: '8px',
                      border: '1px solid #303030',
                      color: '#F5F5F5',
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
                      <Cell key={i} fill={MONO_PALETTE[i % MONO_PALETTE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#F5F5F5] font-mono">
                  {docTypeData.length}
                </span>
                <span className="text-[10px] text-[#737373] font-mono uppercase">Types</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1e1e1e] grid grid-cols-2 gap-1.5 text-xs">
              {docTypeData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between px-2.5 py-1 rounded bg-[#161616] border border-[#222]">
                  <span className="flex items-center gap-1.5 truncate text-[11px] text-[#A3A3A3] capitalize">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: MONO_PALETTE[i % MONO_PALETTE.length] }}
                    />
                    {d.name}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#F5F5F5]">
                    {Math.round((d.value / (analytics.total_records || totalRecords || 1)) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Responsiveness */}
          <div className="bg-[#111111] rounded-xl border border-[#262626] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider font-mono">
                Responsiveness Split
              </h3>
              <span className="text-[11px] font-mono text-[#737373]">Target Ratio</span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#191919',
                      borderRadius: '8px',
                      border: '1px solid #303030',
                      color: '#F5F5F5',
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
                    <Cell fill="#FFFFFF" />
                    <Cell fill="#333333" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#F5F5F5] font-mono">
                  {Math.round(
                    ((analytics.responsive_distribution.responsive || 0) /
                      (analytics.total_records || totalRecords || 1)) *
                      100
                  )}%
                </span>
                <span className="text-[10px] text-[#737373] font-mono uppercase">Responsive</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1e1e1e] flex items-center justify-around text-xs">
              <div className="text-center">
                <p className="text-[10px] text-[#737373] uppercase font-mono">Responsive</p>
                <p className="text-sm font-bold text-[#F5F5F5] font-mono mt-0.5">
                  {analytics.responsive_distribution.responsive?.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-px bg-[#262626]" />
              <div className="text-center">
                <p className="text-[10px] text-[#737373] uppercase font-mono">Non-Responsive</p>
                <p className="text-sm font-bold text-[#A3A3A3] font-mono mt-0.5">
                  {analytics.responsive_distribution.non_responsive?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Privilege Distribution */}
          <div className="bg-[#111111] rounded-xl border border-[#262626] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[#A3A3A3] uppercase tracking-wider font-mono">
                Privilege Logs
              </h3>
              <span className="text-[11px] font-mono text-[#737373]">Attorney-Client</span>
            </div>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#191919',
                      borderRadius: '8px',
                      border: '1px solid #303030',
                      color: '#F5F5F5',
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
                    <Cell fill="#FFFFFF" />
                    <Cell fill="#737373" />
                    <Cell fill="#262626" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#F5F5F5] font-mono">
                  {analytics.privilege_distribution.privileged?.toLocaleString() || 0}
                </span>
                <span className="text-[10px] text-[#737373] font-mono uppercase">Privileged</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1e1e1e] flex items-center justify-between text-[11px] px-1 text-[#A3A3A3]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white" />
                Not Privileged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#737373]" />
                Privileged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#262626] border border-[#555]" />
                Partial
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Generations Table */}
      <div className="bg-[#111111] rounded-xl border border-[#262626] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3]">Generated Datasets</h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Click any row to open the property inspector side panel.
            </p>
          </div>
          <Link
            to="/app/history"
            className="text-xs font-medium text-[#F5F5F5] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Audit History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#141414] border-b border-[#262626] text-[#737373] font-mono uppercase text-[10px] tracking-wider">
                <th className="px-6 py-3 text-left">Dataset Name</th>
                <th className="px-6 py-3 text-left">Matter Scenario</th>
                <th className="px-6 py-3 text-left">Records</th>
                <th className="px-6 py-3 text-left">Engine</th>
                <th className="px-6 py-3 text-left">Quality Score</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {datasets.map((ds) => (
                <tr
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds)}
                  className="hover:bg-[#161616] cursor-pointer transition-colors group text-[#D4D4D4]"
                >
                  <td className="px-6 py-3.5 font-medium text-[#F5F5F5]">
                    {ds.name}
                  </td>
                  <td className="px-6 py-3.5 text-[#A3A3A3] capitalize">
                    {ds.scenario.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-3.5 text-[#F5F5F5] font-mono">
                    {ds.num_records.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030] font-mono text-[10px] capitalize">
                      {ds.generation_method === 'ai-assisted' && (
                        <Sparkles className="h-3 w-3 text-white" />
                      )}
                      {ds.generation_method}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-xs text-[#F5F5F5] bg-[#191919] px-2 py-0.5 rounded border border-[#303030]">
                      {ds.quality_score !== null ? `${ds.quality_score.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {ds.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="text-[11px] font-medium text-[#737373] group-hover:text-white transition-colors">
                      Open &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-Opening Inspector Drawer */}
      <SlideOver
        isOpen={!!selectedDataset}
        onClose={() => setSelectedDataset(null)}
        title={selectedDataset?.name || 'Dataset Inspector'}
        subtitle={`ID: ${selectedDataset?.id || ''}`}
        actions={
          selectedDataset && (
            <div className="flex items-center gap-1.5">
              <a
                href={getExportUrl(selectedDataset.id, 'csv')}
                className="p-1.5 rounded border border-[#303030] text-[#A3A3A3] hover:text-white hover:bg-[#191919] transition-colors"
                title="Download CSV"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
              <Link
                to={`/app/datasets/${selectedDataset.id}/explorer`}
                className="px-2.5 py-1 rounded bg-white text-[#080808] hover:bg-[#E5E5E5] text-[11px] font-semibold transition-all inline-flex items-center gap-1"
              >
                <span>Explore</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )
        }
      >
        {selectedDataset && (
          <div className="space-y-6 text-xs text-[#D4D4D4]">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="text-[10px] font-mono text-[#737373] uppercase">Total Records</div>
                <div className="text-xl font-bold font-mono text-[#F5F5F5] mt-1">
                  {selectedDataset.num_records.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="text-[10px] font-mono text-[#737373] uppercase">Quality Score</div>
                <div className="text-xl font-bold font-mono text-[#F5F5F5] mt-1">
                  {selectedDataset.quality_score ? `${selectedDataset.quality_score.toFixed(1)}%` : '—'}
                </div>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-3">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">Parameters</h3>
              <div className="divide-y divide-[#1e1e1e] rounded-lg border border-[#262626] bg-[#141414] overflow-hidden">
                <div className="flex justify-between py-2.5 px-3">
                  <span className="text-[#737373]">Scenario</span>
                  <span className="font-medium text-[#F5F5F5] capitalize">
                    {selectedDataset.scenario.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-3">
                  <span className="text-[#737373]">Complexity</span>
                  <span className="font-medium text-[#F5F5F5] capitalize">{selectedDataset.complexity}</span>
                </div>
                <div className="flex justify-between py-2.5 px-3">
                  <span className="text-[#737373]">Generation Method</span>
                  <span className="font-medium text-[#F5F5F5] capitalize">
                    {selectedDataset.generation_method}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-3">
                  <span className="text-[#737373]">Distribution</span>
                  <span className="font-medium text-[#F5F5F5] capitalize">
                    {String(selectedDataset.config_json?.classification_distribution || 'realistic')}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-3">
                  <span className="text-[#737373]">Created</span>
                  <span className="font-mono text-[#A3A3A3]">
                    {new Date(selectedDataset.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to={`/app/datasets/${selectedDataset.id}/explorer`}
                className="w-full py-2.5 rounded-lg bg-white text-[#080808] hover:bg-[#E5E5E5] font-semibold text-center transition-all"
              >
                Open Full Records Explorer &rarr;
              </Link>
              <Link
                to={`/app/datasets/${selectedDataset.id}/analytics`}
                className="w-full py-2.5 rounded-lg bg-[#191919] hover:bg-[#222222] text-[#F5F5F5] border border-[#303030] font-medium text-center transition-colors"
              >
                View Statistical Analytics
              </Link>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Quick Presets Scroll-Up Drawer */}
      <BottomScrollUp
        isOpen={isQuickGenOpen}
        onClose={() => setIsQuickGenOpen(false)}
        title="Quick Scenario Presets"
        subtitle="One-click generation of calibrated benchmark litigation datasets"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          <div className="p-4 rounded-xl border border-[#262626] bg-[#141414] hover:border-[#383838] transition-all">
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-1">Corporate Accounting Fraud</h4>
            <p className="text-xs text-[#737373] leading-relaxed mb-4">
              500 records simulating internal accounting audit findings, email threads, and whistleblower memos.
            </p>
            <button
              onClick={() => handleQuickPreset('corporate_fraud', 'Preset Corporate Fraud Investigation')}
              disabled={generatingQuick}
              className="w-full py-2 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-lg font-semibold text-xs transition-all disabled:opacity-50"
            >
              {generatingQuick ? 'Generating...' : 'Launch Preset'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-[#262626] bg-[#141414] hover:border-[#383838] transition-all">
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-1">Semiconductor IP Dispute</h4>
            <p className="text-xs text-[#737373] leading-relaxed mb-4">
              500 records covering patented microcode, trade secret disclosures, and engineering repository logs.
            </p>
            <button
              onClick={() => handleQuickPreset('ip_dispute', 'Preset Semiconductor IP Infringement')}
              disabled={generatingQuick}
              className="w-full py-2 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-lg font-semibold text-xs transition-all disabled:opacity-50"
            >
              {generatingQuick ? 'Generating...' : 'Launch Preset'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-[#262626] bg-[#141414] hover:border-[#383838] transition-all">
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-1">Antitrust Exclusive Dealing</h4>
            <p className="text-xs text-[#737373] leading-relaxed mb-4">
              500 records analyzing distributor agreements, competitor price signaling, and executive comms.
            </p>
            <button
              onClick={() => handleQuickPreset('antitrust', 'Preset Antitrust Commercial Investigation')}
              disabled={generatingQuick}
              className="w-full py-2 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-lg font-semibold text-xs transition-all disabled:opacity-50"
            >
              {generatingQuick ? 'Generating...' : 'Launch Preset'}
            </button>
          </div>
        </div>
      </BottomScrollUp>
    </div>
  );
}
