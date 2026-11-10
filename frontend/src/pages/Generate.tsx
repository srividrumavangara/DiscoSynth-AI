import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Cog, CheckCircle, AlertCircle } from 'lucide-react';
import { generateDataset } from '../api/client';
import type { GenerationRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const SCENARIOS = [
  { value: 'corporate_fraud', label: 'Corporate Fraud' },
  { value: 'ip_dispute', label: 'Intellectual Property Dispute' },
  { value: 'employment_litigation', label: 'Employment Litigation' },
  { value: 'financial_misconduct', label: 'Financial Misconduct' },
  { value: 'contract_dispute', label: 'Contract Dispute' },
  { value: 'custom', label: 'Custom Scenario' },
];

const RECORD_COUNTS = [100, 500, 1000, 5000];
const COMPLEXITIES = ['basic', 'intermediate', 'advanced'];
const DOC_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'internal_memo', label: 'Internal Memo' },
  { value: 'financial_report', label: 'Financial Report' },
  { value: 'contract', label: 'Contract' },
];

export default function Generate() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<GenerationRequest>({
    name: '',
    scenario: 'corporate_fraud',
    num_records: 100,
    complexity: 'intermediate',
    document_types: ['email', 'pdf', 'docx', 'xlsx', 'internal_memo', 'financial_report', 'contract'],
    classification_distribution: 'realistic',
    custom_responsive_pct: 0.5,
    seed: undefined,
    generation_method: 'rule-based',
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
    setSuccess(null);

    try {
      const payload: GenerationRequest = { ...form };
      if (payload.classification_distribution !== 'custom') {
        delete payload.custom_responsive_pct;
      }
      if (!payload.seed) {
        delete payload.seed;
      }
      const dataset = await generateDataset(payload);
      setSuccess({ id: dataset.id, name: dataset.name });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy-800 mb-6">Generate Dataset</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <LoadingSpinner message="Generating synthetic dataset... This may take a moment for large datasets." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Generate Dataset</h1>

      {/* Success notification */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              Dataset "{success.name}" generated successfully!
            </p>
          </div>
          <button
            onClick={() => navigate(`/explorer/${success.id}`)}
            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            View Dataset
          </button>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dataset Name */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dataset Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Corporate Fraud Test Set Q4"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-sm"
          />
        </div>

        {/* Scenario + Records + Complexity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Litigation Scenario</label>
            <select
              value={form.scenario}
              onChange={(e) => setForm({ ...form, scenario: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm"
            >
              {SCENARIOS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Num Records */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Records</label>
            <div className="grid grid-cols-2 gap-2">
              {RECORD_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, num_records: n })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.num_records === n
                      ? 'bg-navy-800 text-white border-navy-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300'
                  }`}
                >
                  {n.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Complexity</label>
            <div className="space-y-2">
              {COMPLEXITIES.map((c) => (
                <label key={c} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="complexity"
                    checked={form.complexity === c}
                    onChange={() => setForm({ ...form, complexity: c })}
                    className="accent-navy-800"
                  />
                  <span className="text-sm text-gray-700 capitalize">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Document Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Document Types</label>
          <div className="flex flex-wrap gap-2">
            {DOC_TYPES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => toggleDocType(dt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.document_types.includes(dt.value)
                    ? 'bg-accent-500 text-white border-accent-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent-300'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Classification + Seed + Method */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classification */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Classification Distribution</label>
            <div className="space-y-2">
              {[
                { value: 'balanced', label: 'Balanced (50/50)' },
                { value: 'realistic', label: 'Realistic Imbalanced' },
                { value: 'custom', label: 'Custom Percentages' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="classification"
                    checked={form.classification_distribution === opt.value}
                    onChange={() => setForm({ ...form, classification_distribution: opt.value })}
                    className="accent-navy-800"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {form.classification_distribution === 'custom' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Responsive: {Math.round((form.custom_responsive_pct || 0.5) * 100)}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((form.custom_responsive_pct || 0.5) * 100)}
                    onChange={(e) => setForm({ ...form, custom_responsive_pct: parseInt(e.target.value) / 100 })}
                    className="w-full accent-accent-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Random Seed (optional)</label>
            <input
              type="number"
              value={form.seed ?? ''}
              onChange={(e) => setForm({ ...form, seed: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 42"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">Same seed + config = same dataset</p>
          </div>

          {/* Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Generation Method</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  checked={form.generation_method === 'ai-assisted'}
                  onChange={() => setForm({ ...form, generation_method: 'ai-assisted' })}
                  className="accent-navy-800"
                />
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-500" />
                  <span className="text-sm text-gray-700">AI-Assisted</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  checked={form.generation_method === 'rule-based'}
                  onChange={() => setForm({ ...form, generation_method: 'rule-based' })}
                  className="accent-navy-800"
                />
                <div className="flex items-center gap-2">
                  <Cog className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Rule-Based</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-navy-800 text-white rounded-xl font-semibold text-base hover:bg-navy-700 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="h-5 w-5" />
          Generate Dataset
        </button>
      </form>
    </div>
  );
}
