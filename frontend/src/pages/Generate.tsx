import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Cog,
  AlertCircle,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { generateDataset } from '../api/client';
import type { GenerationRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const SCENARIOS = [
  {
    value: 'corporate_fraud',
    label: 'Corporate Fraud',
    desc: 'Accounting irregularities, whistleblower memos, wire transfers, and executive concealment.',
  },
  {
    value: 'ip_dispute',
    label: 'Intellectual Property Dispute',
    desc: 'Patent infringement, reverse engineering, semiconductor trade secrets, and source code memos.',
  },
  {
    value: 'employment_litigation',
    label: 'Employment Litigation',
    desc: 'Discrimination claims, HR investigations, wrongful termination, and retaliatory communications.',
  },
  {
    value: 'financial_misconduct',
    label: 'Financial Misconduct',
    desc: 'AML compliance failures, offshore tax structures, KYC violations, and SEC regulatory probes.',
  },
  {
    value: 'contract_dispute',
    label: 'Contract Dispute',
    desc: 'Multi-year procurement breach, SLA non-compliance, force majeure, and indemnification claims.',
  },
  {
    value: 'custom',
    label: 'Custom Scenario',
    desc: 'Tailored parameters, custom issue tags, and custodian distribution controls.',
  },
];

const RECORD_COUNTS = [100, 500, 1000, 5000];
const COMPLEXITIES = [
  { value: 'basic', label: 'Basic', desc: 'Predictable distributions, minimal cross-role privilege' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Standard EDRM rates with email family groups' },
  { value: 'advanced', label: 'Advanced', desc: 'Complex cross-custodian threads & high redaction rates' },
];

const DOC_TYPES = [
  { value: 'email', label: 'Email (.eml)' },
  { value: 'pdf', label: 'PDF Documents' },
  { value: 'docx', label: 'Word (.docx)' },
  { value: 'xlsx', label: 'Spreadsheets (.xlsx)' },
  { value: 'internal_memo', label: 'Internal Memos' },
  { value: 'financial_report', label: 'Financial Reports' },
  { value: 'contract', label: 'Executed Contracts' },
];

export default function Generate() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<GenerationRequest>({
    name: 'Matter ' + Math.floor(1000 + Math.random() * 9000) + ' Benchmark Set',
    scenario: 'corporate_fraud',
    num_records: 500,
    complexity: 'intermediate',
    document_types: ['email', 'pdf', 'docx', 'xlsx', 'internal_memo', 'financial_report', 'contract'],
    classification_distribution: 'realistic',
    custom_responsive_pct: 0.35,
    seed: 42,
    generation_method: 'ai-assisted',
  });

  const toggleDocType = (dt: string) => {
    setForm((prev) => ({
      ...prev,
      document_types: prev.document_types.includes(dt)
        ? prev.document_types.filter((t) => t !== dt)
        : [...prev.document_types, dt],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Dataset name is required');
      return;
    }
    if (form.document_types.length === 0) {
      setError('Select at least one document type');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const payload: GenerationRequest = { ...form };
      if (payload.classification_distribution !== 'custom') {
        delete payload.custom_responsive_pct;
      }
      if (!payload.seed) {
        delete payload.seed;
      }
      const dataset = await generateDataset(payload);
      navigate(`/app/datasets/${dataset.id}/explorer`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setError(msg);
      setGenerating(false);
    }
  };

  const estimatedResponsive = Math.round(
    form.num_records *
      (form.classification_distribution === 'balanced'
        ? 0.5
        : form.classification_distribution === 'custom'
        ? form.custom_responsive_pct || 0.35
        : 0.38)
  );

  const estimatedPrivileged = Math.round(form.num_records * 0.18);
  const estimatedMb = ((form.num_records * 120) / 1024).toFixed(1);

  if (generating) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12">
        <div className="bg-[#111111] rounded-xl border border-[#262626] p-12 text-center space-y-4">
          <LoadingSpinner message={`Generating ${form.num_records.toLocaleString()} synthetic records with ${form.generation_method} engine...`} />
          <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
            Calibrating stochastic family trees, conditionally assigning attorney-client privilege probabilities,
            and executing automated metadata validation checks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">Synthetic Dataset Generator</h1>
        <p className="text-xs text-[#737373] mt-1">
          Configure stochastic litigation scenarios, target distributions, and reproducible random seeds.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Configuration Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dataset Name */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#262626] space-y-2">
            <label className="block text-[11px] font-mono text-[#A3A3A3] uppercase tracking-wider">
              Matter / Dataset Title *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#191919] border border-[#303030] rounded-lg text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373] transition-colors"
              placeholder="e.g. Apex Corp Securities Litigation Benchmark Set"
            />
          </div>

          {/* Scenario Selection Grid */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#262626] space-y-3">
            <label className="block text-[11px] font-mono text-[#A3A3A3] uppercase tracking-wider">
              Litigation Scenario Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <div
                  key={s.value}
                  onClick={() => setForm({ ...form, scenario: s.value })}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    form.scenario === s.value
                      ? 'border-white bg-[#191919] text-[#F5F5F5]'
                      : 'border-[#262626] hover:border-[#383838] bg-[#141414] text-[#A3A3A3]'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#F5F5F5]">{s.label}</p>
                  <p className="text-[11px] text-[#737373] mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Records & Complexity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Number of Records */}
            <div className="bg-[#111111] rounded-xl p-6 border border-[#262626] space-y-3">
              <label className="block text-[11px] font-mono text-[#A3A3A3] uppercase tracking-wider">
                Target Record Scale
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RECORD_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, num_records: n })}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all border ${
                      form.num_records === n
                        ? 'bg-white text-[#080808] border-white'
                        : 'bg-[#191919] text-[#A3A3A3] border-[#303030] hover:border-[#404040]'
                    }`}
                  >
                    {n.toLocaleString()} records
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div className="bg-[#111111] rounded-xl p-6 border border-[#262626] space-y-3">
              <label className="block text-[11px] font-mono text-[#A3A3A3] uppercase tracking-wider">
                Scenario Complexity
              </label>
              <div className="space-y-2">
                {COMPLEXITIES.map((c) => (
                  <label
                    key={c.value}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      form.complexity === c.value
                        ? 'bg-[#191919] border-white/60'
                        : 'border-[#262626] hover:bg-[#161616]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complexity"
                      checked={form.complexity === c.value}
                      onChange={() => setForm({ ...form, complexity: c.value })}
                      className="mt-0.5 accent-white"
                    />
                    <div>
                      <p className="text-xs font-medium text-[#F5F5F5]">{c.label}</p>
                      <p className="text-[10px] text-[#737373]">{c.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Document Types */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#262626] space-y-3">
            <label className="block text-[11px] font-mono text-[#A3A3A3] uppercase tracking-wider">
              Document Formats to Ingest
            </label>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => toggleDocType(dt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.document_types.includes(dt.value)
                      ? 'bg-white text-[#080808] border-white'
                      : 'bg-[#191919] text-[#A3A3A3] border-[#303030] hover:border-[#404040]'
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Engine Parameters & Launch */}
        <div className="space-y-6">
          <div className="bg-[#111111] rounded-xl p-6 border border-[#262626] space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" />
              <span>Engine Parameters</span>
            </h3>

            {/* Generation Engine */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-[#A3A3A3] block">Generation Method</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, generation_method: 'ai-assisted' })}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    form.generation_method === 'ai-assisted'
                      ? 'bg-white text-[#080808] border-white font-semibold'
                      : 'bg-[#191919] text-[#A3A3A3] border-[#303030] hover:border-[#404040]'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI-Assisted</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, generation_method: 'rule-based' })}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    form.generation_method === 'rule-based'
                      ? 'bg-white text-[#080808] border-white font-semibold'
                      : 'bg-[#191919] text-[#A3A3A3] border-[#303030] hover:border-[#404040]'
                  }`}
                >
                  <Cog className="h-3.5 w-3.5" />
                  <span>Rule-Based</span>
                </button>
              </div>
            </div>

            {/* Random Seed */}
            <div className="space-y-1.5 pt-3 border-t border-[#1e1e1e]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#A3A3A3]">Random Seed</span>
                <span className="text-[10px] text-[#737373] font-mono">Reproducible</span>
              </div>
              <input
                type="number"
                value={form.seed ?? ''}
                onChange={(e) => setForm({ ...form, seed: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g. 42"
                className="w-full px-3 py-2 bg-[#191919] border border-[#303030] rounded-lg text-xs font-mono text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373]"
              />
            </div>

            {/* Classification Ratio */}
            <div className="space-y-2 pt-3 border-t border-[#1e1e1e]">
              <span className="text-[11px] font-medium text-[#A3A3A3] block">Classification Split</span>
              <div className="space-y-2">
                {[
                  { value: 'realistic', label: 'Realistic Imbalanced (~35% Responsive)' },
                  { value: 'balanced', label: 'Balanced (50% / 50%)' },
                  { value: 'custom', label: 'Custom Distribution Slider' },
                ].map((d) => (
                  <label key={d.value} className="flex items-center gap-2 cursor-pointer text-xs text-[#D4D4D4]">
                    <input
                      type="radio"
                      name="classification_distribution"
                      checked={form.classification_distribution === d.value}
                      onChange={() => setForm({ ...form, classification_distribution: d.value })}
                      className="accent-white"
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>

              {form.classification_distribution === 'custom' && (
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-[#737373] mb-1">
                    <span>Target Responsive</span>
                    <span className="font-mono font-bold text-[#F5F5F5]">
                      {Math.round((form.custom_responsive_pct || 0.35) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={Math.round((form.custom_responsive_pct || 0.35) * 100)}
                    onChange={(e) => setForm({ ...form, custom_responsive_pct: parseInt(e.target.value) / 100 })}
                    className="w-full accent-white"
                  />
                </div>
              )}
            </div>

            {/* Live Estimation Box */}
            <div className="p-3.5 rounded-lg bg-[#141414] border border-[#262626] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#737373]">
                <span>Est. Responsive Records:</span>
                <span className="font-mono font-medium text-[#F5F5F5]">{estimatedResponsive}</span>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Est. Privileged Withheld:</span>
                <span className="font-mono font-medium text-[#F5F5F5]">{estimatedPrivileged}</span>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Est. Aggregate Size:</span>
                <span className="font-mono font-medium text-[#F5F5F5]">~{estimatedMb} MB</span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-[#E5E5E5] text-[#080808] font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Generate Synthetic Dataset</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
