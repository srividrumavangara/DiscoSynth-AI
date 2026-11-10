import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Cog,
  CheckCircle,
  AlertCircle,
  Sliders,
  Shield,
  FileCheck2,
  Database,
  ArrowRight,
  Info,
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
    label: 'Custom Litigation Scenario',
    desc: 'User-specified parameters, custom issue tags, and tailored custodian distributions.',
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
    name: 'Matter ' + Math.floor(1000 + Math.random() * 9000) + ' Discovery Benchmark',
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
      navigate(`/explorer/${dataset.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setError(msg);
      setGenerating(false);
    }
  };

  // Estimations
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
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-16 text-center">
        <LoadingSpinner message={`Generating ${form.num_records.toLocaleString()} synthetic records with ${form.generation_method} engine...`} />
        <p className="text-xs text-slate-400 mt-4 max-w-md mx-auto">
          Calculating conditional probabilities, assigning document family trees, verifying attorney-client
          privilege logs, and executing quality scoring audits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Synthetic Dataset Generator</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure stochastic litigation scenarios, target distributions, and reproducible random seeds.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Configuration Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dataset Name */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Matter / Dataset Title *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-800"
              placeholder="e.g. Apex Corp Securities Litigation Benchmark Set"
            />
          </div>

          {/* Scenario Selection Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Litigation Scenario Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <div
                  key={s.value}
                  onClick={() => setForm({ ...form, scenario: s.value })}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    form.scenario === s.value
                      ? 'border-violet-600 bg-violet-50/40 ring-1 ring-violet-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{s.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Records & Complexity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Number of Records */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Record Scale
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RECORD_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, num_records: n })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-semibold transition-all border ${
                      form.num_records === n
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {n.toLocaleString()} records
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Scenario Complexity
              </label>
              <div className="space-y-2">
                {COMPLEXITIES.map((c) => (
                  <label
                    key={c.value}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.complexity === c.value
                        ? 'bg-violet-50/30 border-violet-500'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complexity"
                      checked={form.complexity === c.value}
                      onChange={() => setForm({ ...form, complexity: c.value })}
                      className="mt-0.5 accent-violet-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{c.label}</p>
                      <p className="text-[10px] text-slate-400">{c.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Document Types */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document Formats to Ingest
            </label>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => toggleDocType(dt.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.document_types.includes(dt.value)
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Figma-Style Live Inspector Preview & Launch */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-violet-600" />
              <span>Engine Parameters</span>
            </h3>

            {/* Generation Engine */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 block">Generation Method</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, generation_method: 'ai-assisted' })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    form.generation_method === 'ai-assisted'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI-Assisted</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, generation_method: 'rule-based' })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    form.generation_method === 'rule-based'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Cog className="h-3.5 w-3.5" />
                  <span>Rule-Based</span>
                </button>
              </div>
            </div>

            {/* Random Seed */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">Random Seed</span>
                <span className="text-[10px] text-slate-400 font-mono">Reproducible</span>
              </div>
              <input
                type="number"
                value={form.seed ?? ''}
                onChange={(e) => setForm({ ...form, seed: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g. 42"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
              />
            </div>

            {/* Classification Ratio */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-600 block">Classification Split</span>
              <div className="space-y-1.5">
                {[
                  { value: 'realistic', label: 'Realistic Imbalanced (~35% Responsive)' },
                  { value: 'balanced', label: 'Balanced (50% / 50%)' },
                  { value: 'custom', label: 'Custom Distribution Slider' },
                ].map((d) => (
                  <label key={d.value} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="radio"
                      name="classification_distribution"
                      checked={form.classification_distribution === d.value}
                      onChange={() => setForm({ ...form, classification_distribution: d.value })}
                      className="accent-violet-600"
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>

              {form.classification_distribution === 'custom' && (
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Target Responsive</span>
                    <span className="font-mono font-bold text-violet-600">
                      {Math.round((form.custom_responsive_pct || 0.35) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={Math.round((form.custom_responsive_pct || 0.35) * 100)}
                    onChange={(e) => setForm({ ...form, custom_responsive_pct: parseInt(e.target.value) / 100 })}
                    className="w-full accent-violet-600"
                  />
                </div>
              )}
            </div>

            {/* Live Estimation Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Est. Responsive Records:</span>
                <span className="font-mono font-bold text-slate-800">{estimatedResponsive}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Est. Privileged Withheld:</span>
                <span className="font-mono font-bold text-slate-800">{estimatedPrivileged}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Est. Aggregate Size:</span>
                <span className="font-mono font-bold text-slate-800">~{estimatedMb} MB</span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Synthetic Dataset</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
