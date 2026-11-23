import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-6 pb-20">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 md:p-14 overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Capstone • Generative AI for E-Discovery</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Realistic Synthetic Litigation Metadata,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200 bg-clip-text text-transparent">
              Zero Confidentiality Risk.
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Legal AI researchers and litigation teams need diverse document metadata to train and benchmark
            classification models (TAR, privilege detection, responsiveness). However, real case files are
            protected by strict attorney-client privilege. <strong className="text-white">DiscoSynth AI</strong> utilizes
            LLM-driven prompt engineering and structured Pydantic validation to generate realistic, logically coherent
            synthetic litigation datasets.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onStart}
              className="inline-flex items-center space-x-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Launch Synthetic Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Problem vs Solution */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-rose-900/30 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">The Confidentiality Bottleneck</h2>
          <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Restricted Access:</strong> Real litigation records contain sensitive commercial trade secrets, PII, and attorney work product.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Imbalanced Data:</strong> Privileged documents represent small, specialized subsets (typically 5–25%) that are difficult to benchmark.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Non-Replicable Benchmarks:</strong> Proprietary data cannot be shared publicly across academic or industry researchers.</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/60 border border-emerald-900/30 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">The DiscoSynth AI Solution</h2>
          <ul className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Authentic Metadata Structure:</strong> Bates numbering, custodians, email threads, privilege justifications, file extensions, and issue tags.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Contextual Coherence:</strong> Documents within a scenario share persistent custodians, plausible timeline sequences, and interconnected narratives.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Strict Validation & Zero Fake Records:</strong> Every batch is parsed through Pydantic schemas with automated Gemini self-correction.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Architecture & Flow */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">System Workflow & Architecture</h2>
          <p className="text-sm text-slate-400">
            End-to-end full stack architecture leveraging modern Generative AI and database persistence.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-bold font-mono">
              01
            </div>
            <h3 className="text-base font-semibold text-white">Prompt & NL Scenario</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts detailed structured forms or raw natural language queries to infer scenario parameters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-bold font-mono">
              02
            </div>
            <h3 className="text-base font-semibold text-white">Controlled Batching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Splits datasets into controlled batches (&le; 25 items) to prevent token truncation and maintain strict ID ordering.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-bold font-mono">
              03
            </div>
            <h3 className="text-base font-semibold text-white">Validation & Correction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pydantic checks date bounds, category whitelists, and privilege consistency with automated LLM repair loops.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xs font-bold font-mono">
              04
            </div>
            <h3 className="text-base font-semibold text-white">Database & Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Persists into MongoDB with interactive Recharts analytics and standard e-discovery CSV/JSON exports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
