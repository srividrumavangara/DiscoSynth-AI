import React, { useState } from 'react';
import { Sparkles, Loader2, X, Check, ArrowRight } from 'lucide-react';
import { apiClient } from '../../api/client';
import { GenerationConfig, NLScenarioResponse } from '../../types';

interface NLScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (config: GenerationConfig) => void;
}

export const NLScenarioModal: React.FC<NLScenarioModalProps> = ({
  isOpen,
  onClose,
  onApplyConfig
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NLScenarioResponse | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Corporate Accounting Fraud',
      text: 'Generate a high-complexity corporate accounting fraud scenario involving three companies, unrecorded revenue adjustments, internal whistleblower emails, board audit committee slides, and outside auditor communications between 2022 and 2024.'
    },
    {
      title: 'Biotech Patent & Trade Secrets',
      text: 'Simulate an intellectual property dispute where a former lead research scientist departs with mRNA sequence algorithms, featuring internal Slack communications, git commit logs, patent office disclosures, and attorney-client clearance memos.'
    },
    {
      title: 'Aerospace Contract Breach',
      text: 'Create a medium-complexity contract dispute regarding defective commercial satellite guidance components, missed delivery milestones, liquidated damages claims, and executive warranty negotiation emails between 2021 and 2023.'
    }
  ];

  const handleInterpret = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.interpretScenario(prompt);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Interpretation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result?.inferred_config) {
      onApplyConfig(result.inferred_config);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Natural Language Scenario Interpreter</h2>
              <p className="text-xs text-slate-400">
                Powered by Gemini to extract litigation parameters from plain-language descriptions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Describe your desired litigation scenario:
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Generate a high-complexity contract dispute involving missed delivery milestones, executive emails, and privileged legal opinions between 2021 and 2024..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick Test Presets
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.text)}
                  className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer"
                >
                  <p className="text-xs font-semibold text-indigo-300">{p.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.text}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Results display */}
          {result && (
            <div className="p-4 bg-slate-950/80 border border-indigo-900/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Gemini Parameter Interpretation Complete
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">
                  {result.inferred_config.scenario_type}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-white">{result.suggested_name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {result.scenario_summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Size:</span> {result.inferred_config.size} documents
                </div>
                <div>
                  <span className="text-slate-500">Complexity:</span> {result.inferred_config.complexity}
                </div>
                <div>
                  <span className="text-slate-500">Dates:</span> {result.inferred_config.date_range.start} to {result.inferred_config.date_range.end}
                </div>
                <div>
                  <span className="text-slate-500">Custodians:</span> {result.inferred_config.custodian_count}
                </div>
              </div>

              {result.key_entities?.length > 0 && (
                <div className="text-[11px]">
                  <span className="text-slate-500">Inferred Entities:</span>{' '}
                  <span className="text-slate-300">{result.key_entities.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleInterpret}
              disabled={loading || !prompt.trim()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Interpreting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Interpret with Gemini</span>
                </>
              )}
            </button>

            {result && (
              <button
                onClick={handleApply}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Apply to Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
