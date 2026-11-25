import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onExploreHistory?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExploreHistory }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-4 pb-20 animate-fadeIn">
      {/* Editorial Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-[#0B0F19] to-[#070A0F] border border-slate-800/80 p-8 md:p-14 overflow-hidden shadow-2xl">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Capstone • E-Discovery Generative AI Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Realistic Litigation Metadata.{' '}
            <span className="text-slate-400 block font-normal text-2xl sm:text-3xl md:text-4xl mt-1">
              Without Real-World Data Exposure.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Legal AI researchers and litigation teams need diverse document metadata to test, calibrate, and benchmark
            technology-assisted review (TAR) and privilege classification models. However, actual case files are strictly
            confidential. <strong className="text-white font-semibold">DiscoSynth AI</strong> utilizes Gemini 3.8 Flash,
            contextual prompt orchestration, sequential Bates numbering, and Pydantic v2 validation to generate logically coherent,
            synthetic litigation datasets on demand.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="inline-flex items-center space-x-2.5 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Launch Synthetic Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onExploreHistory && (
              <button
                onClick={onExploreHistory}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 font-medium text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>View Dataset Catalog</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Sample Synthetic Metadata Preview Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Synthetic Metadata Structure
            </h2>
            <p className="text-xs text-slate-400">
              Sample records generated dynamically by Gemini 3.8 Flash showing Bates numbering and privilege tagging.
            </p>
          </div>
          <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
            ACC-000001 — ACC-000005
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">Bates Number</th>
                  <th className="px-4 py-3">Document Title</th>
                  <th className="px-4 py-3">Custodian</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Privilege Status</th>
                  <th className="px-4 py-3">Responsiveness</th>
                  <th className="px-4 py-3">Issue Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-indigo-300 font-semibold">ACC-000001</td>
                  <td className="px-4 py-3 text-white font-medium">Q3 Revenue Recognition Adjustment Memo</td>
                  <td className="px-4 py-3 text-slate-400">Marcus Sterling (CFO)</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">2023-09-14</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 border border-amber-500/25 text-amber-300">
                      Attorney-Client
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                      Responsive
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-slate-400 font-mono">#accounting #audit</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-indigo-300 font-semibold">ACC-000002</td>
                  <td className="px-4 py-3 text-white font-medium">Re: Urgent: Outside Auditor Working Papers Inquiry</td>
                  <td className="px-4 py-3 text-slate-400">Elena Vance (General Counsel)</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">2023-09-18</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/15 border border-purple-500/25 text-purple-300">
                      Work Product
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                      Responsive
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-slate-400 font-mono">#inquiry #privilege</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-indigo-300 font-semibold">ACC-000003</td>
                  <td className="px-4 py-3 text-white font-medium">Vendor Reconciliation Spreadsheets - Q2/Q3</td>
                  <td className="px-4 py-3 text-slate-400">David Kowalski (Controller)</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">2023-10-02</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      Not Privileged
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                      Responsive
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-slate-400 font-mono">#vendor #ledger</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-indigo-300 font-semibold">ACC-000004</td>
                  <td className="px-4 py-3 text-white font-medium">Corporate Offsite Agenda & Catering Confirmation</td>
                  <td className="px-4 py-3 text-slate-400">Sarah Jenkins (Operations)</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">2023-10-15</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      Not Privileged
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/15 border border-rose-500/25 text-rose-300">
                      Non-Responsive
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-slate-400 font-mono">#admin #catering</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Problem vs Solution Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-7 rounded-xl bg-slate-900/60 border border-rose-900/30 space-y-4">
          <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-white">The Confidentiality Bottleneck</h3>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Privilege Boundaries:</strong> Actual case metadata is protected under Rule 502 and work product doctrines, preventing public release.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Severe Class Imbalance:</strong> Privileged or key smoking-gun documents comprise less than 10% of total discovery, impeding model training.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Non-Reproducible Benchmarks:</strong> Proprietary in-house legal datasets prevent cross-university comparative research.</span>
            </li>
          </ul>
        </div>

        <div className="p-7 rounded-xl bg-slate-900/60 border border-emerald-900/30 space-y-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-white">The DiscoSynth AI Architecture</h3>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Controlled Generative Distribution:</strong> Configure target privilege (0–50%) and responsiveness ratios to evaluate precision-recall curves.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Contextual Coherence:</strong> Persistent fictional custodians, plausible timeline sequences, and interconnected email threads.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Strict Schema Enforcement:</strong> Every batch is validated against Pydantic models with automated Gemini self-correction.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3-Step EDRM Workflow */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">
            EDRM-Aligned Generation Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Structured three-phase architecture designed for legal technology benchmarking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-mono font-bold">
              01
            </div>
            <h4 className="text-sm font-semibold text-white">Scenario Ingestion & Modeling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts structured litigation types or natural language prompts to infer custodians, key legal entities, and date boundaries.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-mono font-bold">
              02
            </div>
            <h4 className="text-sm font-semibold text-white">Multi-Batch Gemini Generation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Gemini 3.8 Flash synthesizes records in controlled batches with persistent case memory and continuous Bates numbering.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-mono font-bold">
              03
            </div>
            <h4 className="text-sm font-semibold text-white">Validation, MongoDB & Export</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated Pydantic schema validation, persistent MongoDB storage, and one-click Concordance/Relativity-compatible CSV and JSON exports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
