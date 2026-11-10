import { Sparkles, Cpu, ShieldCheck, Database, Check, ArrowRight, Layers, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OverlappingShowcase() {
  const { openAuthModal } = useAuth();

  return (
    <div className="relative py-12 md:py-20 space-y-12 md:space-y-24">
      {/* SECTION 1: SCENARIO INTELLIGENCE (Sticky Card 1 - z-10) */}
      <div className="sticky top-24 md:top-28 z-10">
        <div className="rounded-3xl bg-[#101A2C] border border-slate-700/80 shadow-2xl p-8 md:p-12 text-white transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#526FE8]/20 border border-[#526FE8]/30 text-[#526FE8] text-xs font-mono font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#526FE8] animate-pulse" />
                <span>SECTION 01 / SCENARIO INTELLIGENCE</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                Transforming Litigation Scenarios into Structured Profiles
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Rather than hallucinating ungrounded rows, the LLM acts as a legal domain architect.
                It analyzes chosen litigation contexts (fraud, IP, employment) and generates a structured
                Pydantic scenario profile with weighted custodian roles, issue tags, and date bounds.
              </p>
              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Generates context-aware corporate structures & entities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Extracts relevant legal issue taxonomies and keywords</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Calibrates custodian role hierarchies and typical channels</span>
                </div>
              </div>
            </div>

            {/* Right Product Preview Mockup */}
            <div className="lg:col-span-7 bg-[#17243A] rounded-2xl border border-slate-700/80 p-6 shadow-inner font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <span className="text-slate-400 font-sans text-xs font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#526FE8]" />
                  LLM Structured Output Profile
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Validated Schema
                </span>
              </div>

              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <p className="text-[#9288DB]">
                  &#47;&#47; Context: Synthetica Global Corp &middot; SEC Regulatory Inquest
                </p>
                <div className="p-3 bg-slate-900/80 rounded-xl space-y-1.5 text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Responsiveness Rate:</span>
                    <span className="text-[#526FE8] font-bold">0.38 (38% Prior)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Privilege Baseline Rate:</span>
                    <span className="text-rose-300 font-bold">0.18 (18% Withheld)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chronological Bounding Window:</span>
                    <span className="text-slate-300">2021-03-01 &rarr; 2024-06-30</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Suggested Issue Taxonomy Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-sans">
                    {['#accounting-irregularity', '#wire-transfer', '#insider-trading', '#whistleblower', '#offshore-entity'].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SYNTHETIC DATA GENERATION (Sticky Card 2 - z-20) */}
      <div className="sticky top-28 md:top-36 z-20">
        <div className="rounded-3xl bg-[#17243A] border border-slate-600/80 shadow-2xl p-8 md:p-12 text-white transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>SECTION 02 / SYNTHETIC DATA ENGINE</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                Procedural Generation with Conditional Dependencies
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                A high-speed NumPy & Faker procedural engine generates thousands of rows in 500-record
                memory-managed batches. Every document ID is globally unique, emails carry legitimate
                communication channels, and in-house counsel documents exhibit elevated privilege probabilities.
              </p>
              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Deterministic seeding guarantees reproducible benchmark sets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Strict chronological bounding (date_created &le; date_modified)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Parent-child document family clusters with attachment distributions</span>
                </div>
              </div>
            </div>

            {/* Right Product Preview Mockup */}
            <div className="lg:col-span-7 bg-[#101A2C] rounded-2xl border border-slate-700/80 p-5 shadow-inner space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-300 font-sans text-xs font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  Document Family Clusters
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">FAM-CASE-0012</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-sans">
                  <div className="space-y-0.5">
                    <p className="font-mono font-bold text-white text-[11px]">DOC-CASE-CF01-000042</p>
                    <p className="text-[10px] text-slate-400">Parent Email &middot; Outlook Client &middot; Sarah Lin, VP Legal</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Privileged (Withheld)
                  </span>
                </div>

                <div className="ml-6 pl-3 border-l-2 border-cyan-500/40 space-y-2">
                  <div className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-sans">
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-slate-300 text-[11px]">DOC-CASE-CF01-000043</p>
                      <p className="text-[10px] text-slate-400">Child Attachment 1 &middot; Financial Audit .xlsx (412 KB)</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Redacted
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-sans">
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-slate-300 text-[11px]">DOC-CASE-CF01-000044</p>
                      <p className="text-[10px] text-slate-400">Child Attachment 2 &middot; Counsel Memo .docx (88 KB)</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Privileged
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: QUALITY AND ANALYTICS (Sticky Card 3 - z-30) */}
      <div className="sticky top-32 md:top-44 z-30">
        <div className="rounded-3xl bg-gradient-to-br from-[#101A2C] via-[#17243A] to-[#101A2C] border border-slate-600 shadow-2xl p-8 md:p-12 text-white transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SECTION 03 / QUALITY & ANALYTICS</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                Automated Validation Scoring & Analytics Audit
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every generated batch undergoes an objective 5-dimension quality audit.
                We evaluate schema validity, field completeness, duplicate-free uniqueness,
                and statistical distribution adherence—producing transparent quality scores.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#526FE8] to-[#9288DB] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Product Preview Mockup */}
            <div className="lg:col-span-7 bg-[#101A2C] rounded-2xl border border-slate-700/80 p-6 shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-sans">
                    Dataset Quality Verification Report
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  99.2% Composite
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                {[
                  { label: 'Schema Validity', pct: '100%' },
                  { label: 'Field Completeness', pct: '100%' },
                  { label: 'ID Uniqueness', pct: '100%' },
                  { label: 'Logic Consistency', pct: '98.5%' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 truncate">{item.label}</p>
                    <p className="text-base font-bold font-mono text-emerald-400 mt-1">{item.pct}</p>
                  </div>
                ))}
              </div>

              {/* Mini Distribution Bar Preview */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Class Imbalance Adherence</span>
                  <span className="font-mono text-cyan-300 font-bold">Delta: 0.8%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#526FE8]" style={{ width: '38%' }} />
                  <div className="h-full bg-slate-600" style={{ width: '62%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Responsive (38%)</span>
                  <span>Non-Responsive (62%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
