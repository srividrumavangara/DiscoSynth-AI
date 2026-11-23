import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Layers,
  Users,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2,
  Wand2
} from 'lucide-react';
import { GenerationConfig, DatasetDetail } from '../../types';
import { apiClient } from '../../api/client';
import { NLScenarioModal } from './NLScenarioModal';

interface GeneratorPageProps {
  onDatasetGenerated: (dataset: DatasetDetail) => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({ onDatasetGenerated }) => {
  const [config, setConfig] = useState<GenerationConfig>({
    scenario_type: 'Corporate Fraud',
    custom_scenario_details: '',
    size: 25,
    complexity: 'Medium',
    date_range: {
      start: '2022-01-01',
      end: '2024-12-31'
    },
    document_categories: [
      'Emails',
      'Contracts',
      'Financial Records',
      'Internal Communications'
    ],
    custodian_count: 5,
    target_privilege_ratio: 0.2,
    target_responsiveness_ratio: 0.65,
    confidentiality_levels: [
      'Public',
      'Confidential',
      'Highly Confidential - Attorneys\' Eyes Only'
    ],
    additional_instructions: ''
  });

  const [isNLModalOpen, setIsNLModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const scenarioOptions = [
    'Corporate Fraud',
    'Intellectual Property Dispute',
    'Employment Litigation',
    'Contract Dispute',
    'Financial Misconduct',
    'Regulatory Investigation',
    'Custom Scenario'
  ];

  const allCategories = [
    'Emails',
    'Contracts',
    'Financial Records',
    'Court Filings',
    'Legal Notices',
    'Internal Communications',
    'Reports',
    'Evidence Records'
  ];

  const sizePresets = [10, 25, 50, 100];

  const toggleCategory = (cat: string) => {
    if (config.document_categories.includes(cat)) {
      if (config.document_categories.length > 1) {
        setConfig({
          ...config,
          document_categories: config.document_categories.filter((c) => c !== cat)
        });
      }
    } else {
      setConfig({
        ...config,
        document_categories: [...config.document_categories, cat]
      });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setGenerationStep('Constructing prompt context and initializing custodians...');

    try {
      setGenerationStep(`Requesting ${config.size} structured metadata records from Gemini...`);
      const dataset = await apiClient.generateDataset(config);
      setGenerationStep('Validating schema constraints and persisting to MongoDB...');
      onDatasetGenerated(dataset);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Generation failed. Please verify your GEMINI_API_KEY in backend/.env'
      );
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Synthetic Litigation Dataset Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure realistic litigation parameters. An actual LLM generates structured metadata adhering to e-discovery standards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNLModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow cursor-pointer self-start md:self-auto"
        >
          <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Describe with AI Prompt</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Generation Error</p>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Progress Banner */}
      {generating && (
        <div className="p-6 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <div>
              <p className="text-sm font-bold text-white">Generative AI Engine Active</p>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">{generationStep}</p>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-sky-400 h-1.5 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Card 1: Litigation Scenario */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              1. Litigation Scenario & Scope
            </h2>
            <span className="text-[11px] text-slate-500">Required</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Scenario Type</label>
              <select
                value={config.scenario_type}
                onChange={(e) => setConfig({ ...config, scenario_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {scenarioOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Complexity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfig({ ...config, complexity: lvl })}
                    className={`py-2 text-xs font-medium rounded-xl border transition cursor-pointer ${
                      config.complexity === lvl
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {config.scenario_type === 'Custom Scenario' && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-slate-300">Custom Scenario Details</label>
              <input
                type="text"
                placeholder="e.g. Maritime Cargo Insurance Claim & Salvage Dispute"
                value={config.custom_scenario_details || ''}
                onChange={(e) => setConfig({ ...config, custom_scenario_details: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Card 2: Dataset Size & Date Range */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            2. Dataset Volume & Chronology
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Document Volume</label>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {config.size} records
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizePresets.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setConfig({ ...config, size: sz })}
                    className={`py-2 text-xs font-mono font-semibold rounded-xl border transition cursor-pointer ${
                      config.size === sz
                        ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Date Range Boundary</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Start Date</span>
                  <input
                    type="date"
                    value={config.date_range.start}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        date_range: { ...config.date_range, start: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">End Date</span>
                  <input
                    type="date"
                    value={config.date_range.end}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        date_range: { ...config.date_range, end: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Document Categories */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              3. Document Categories
            </h2>
            <span className="text-[11px] text-slate-500">
              {config.document_categories.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {allCategories.map((cat) => {
              const selected = config.document_categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between cursor-pointer ${
                    selected
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  {selected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 4: Classification Distributions & Custodians */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            4. Custodians & Classification Ratios
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Custodian Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Distinct Custodians</span>
                <span className="font-mono text-indigo-400 font-bold">{config.custodian_count}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={config.custodian_count}
                onChange={(e) => setConfig({ ...config, custodian_count: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Generates key personnel with titles & internal domains
              </span>
            </div>

            {/* Privilege Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Privilege Ratio</span>
                <span className="font-mono text-amber-400 font-bold">
                  {Math.round(config.target_privilege_ratio * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.45"
                step="0.05"
                value={config.target_privilege_ratio}
                onChange={(e) =>
                  setConfig({ ...config, target_privilege_ratio: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Simulates real-world sparse privilege distribution
              </span>
            </div>

            {/* Responsiveness Ratio */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Responsiveness Ratio</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Math.round(config.target_responsiveness_ratio * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.85"
                step="0.05"
                value={config.target_responsiveness_ratio}
                onChange={(e) =>
                  setConfig({ ...config, target_responsiveness_ratio: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Target ratio for TAR model classification
              </span>
            </div>
          </div>

          {/* Additional prompt instructions */}
          <div className="pt-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Additional Prompt Instructions / Specific Sub-Issues (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Include forensic accounting memos and executive discussions on off-balance sheet SPVs."
              value={config.additional_instructions || ''}
              onChange={(e) => setConfig({ ...config, additional_instructions: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center space-x-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Synthetic Dataset...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Dataset ({config.size} Records)</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* NL Scenario Modal */}
      <NLScenarioModal
        isOpen={isNLModalOpen}
        onClose={() => setIsNLModalOpen(false)}
        onApplyConfig={(inferred) => {
          setConfig(inferred);
        }}
      />
    </div>
  );
};
