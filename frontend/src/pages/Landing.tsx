import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Database,
  FileText,
  Sliders,
  CheckCircle2,
  Lock,
  Download,
  Server,
  Layers,
  Code2,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import OverlappingShowcase from '../components/OverlappingShowcase';
import InteractiveDemo from '../components/InteractiveDemo';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  const handlePrimaryCta = () => {
    if (isAuthenticated) {
      navigate('/app/generate');
    } else {
      openAuthModal('signup');
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Choose a Litigation Scenario',
      desc: 'Select from pre-calibrated litigation matters (Corporate Fraud, Patent Infringement, Employment Litigation, Financial Misconduct) or define custom parameters.',
      detail: 'Tailors the regulatory backdrop, typical communication channels, and corporate custodian roles.',
    },
    {
      num: 2,
      title: 'Generate an AI-Assisted Scenario Profile',
      desc: 'An LLM legal domain architect derives a structured Pydantic profile with weighted document types, role hierarchies, and scenario issue taxonomies.',
      detail: 'Replaces generic row hallucination with structured domain intelligence.',
    },
    {
      num: 3,
      title: 'Create Synthetic Document Metadata',
      desc: 'A procedural NumPy & Faker generation engine executes conditional distributions, parent-child document families, and attorney-client privilege probabilities.',
      detail: 'Batch-managed generation producing 100 to 5,000 unique records in seconds.',
    },
    {
      num: 4,
      title: 'Validate, Explore, and Export Dataset',
      desc: 'Execute a 5-dimension automated quality audit, inspect records in the tabular explorer, and stream CSV/JSON files directly into ML pipelines.',
      detail: 'Full compatibility with Pandas, Scikit-learn, and e-discovery ingestion tools.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#101A2C] text-slate-100 font-sans antialiased selection:bg-[#526FE8] selection:text-white">
      {/* Sticky Header */}
      <Navbar />
      <AuthModal />

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#526FE8]/20 via-[#9288DB]/15 to-transparent blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Supporting Statement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 font-medium shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#526FE8] animate-pulse" />
              <span>Fictional metadata. Reproducible datasets. Smarter e-discovery testing.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Generate the unseen. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#9288DB]">
                Discover the possibilities.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Create realistic synthetic litigation metadata with AI-assisted scenario intelligence,
              configurable data generation, and built-in validation.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrimaryCta}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#526FE8] via-[#657feb] to-[#9288DB] hover:opacity-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Synthetic Data</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore How It Works</span>
              </a>
            </div>
          </div>

          {/* High-Fidelity Product Preview Component */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-[#17243A] border border-slate-700/90 shadow-2xl p-4 sm:p-6 text-xs text-white relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  matter_securities_fraud_benchmark.csv &middot; 5,000 records
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                Quality Verified 99.4%
              </span>
            </div>

            {/* Mini preview table */}
            <div className="overflow-x-auto pt-4">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-700/80 text-[10px] uppercase text-slate-400">
                    <th className="pb-2">Document ID</th>
                    <th className="pb-2">Format</th>
                    <th className="pb-2">Custodian</th>
                    <th className="pb-2">Privilege Status</th>
                    <th className="pb-2">Responsive</th>
                    <th className="pb-2">Issue Taxonomy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-200">DOC-CASE-CF01-000012</td>
                    <td className="py-2.5 text-slate-400">.eml</td>
                    <td className="py-2.5 font-sans font-semibold text-white">Richard Vance, CFO</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                        Privileged
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">TRUE</td>
                    <td className="py-2.5 text-[#526FE8]">#wire-transfer</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-200">DOC-CASE-CF01-000045</td>
                    <td className="py-2.5 text-slate-400">.xlsx</td>
                    <td className="py-2.5 font-sans font-semibold text-white">Sarah Jenkins, Audit</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                        Not Privileged
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">TRUE</td>
                    <td className="py-2.5 text-[#526FE8]">#audit-discrepancy</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-200">DOC-CASE-CF01-000089</td>
                    <td className="py-2.5 text-slate-400">.docx</td>
                    <td className="py-2.5 font-sans font-semibold text-white">David Thorne, Counsel</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        Partially Privileged
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">TRUE</td>
                    <td className="py-2.5 text-[#526FE8]">#whistleblower</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- PRODUCT STORYTELLING ----------------- */}
      <section id="product" className="py-20 md:py-28 bg-[#17243A] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="px-3 py-1 rounded-full bg-[#526FE8]/20 text-[#526FE8] text-xs font-mono font-bold border border-[#526FE8]/30">
              The E-Discovery Bottleneck
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Testing e-discovery models shouldn't depend on access to confidential case data.
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Legal organizations often cannot share real litigation metadata due to strict attorney-client
              privilege, work-product doctrine, GDPR, and court-mandated protective orders.
            </p>
            <p className="text-slate-300 text-base leading-relaxed">
              Without realistic datasets, data science teams struggle to benchmark document classification,
              detect class imbalances, or test review algorithms. DiscoSynth AI bridges this divide by
              generating entirely synthetic, logically consistent document metadata—requiring zero confidential
              data inputs.
            </p>
            <div className="pt-2">
              <a
                href="#technology"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#526FE8] hover:text-[#9288DB] transition-colors"
              >
                <span>Learn more about the technical architecture</span>
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- OVERLAPPING STICKY SHOWCASE ----------------- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-mono font-bold text-[#526FE8] uppercase tracking-wider">
            Layered Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Designed for E-Discovery Scale & Mathematical Coherence
          </h2>
          <p className="text-sm text-slate-400">
            Scroll down to explore how scenario intelligence, procedural generation, and quality audits stack together.
          </p>
        </div>

        <OverlappingShowcase />
      </section>

      {/* ----------------- HOW IT WORKS (4-STEP CONNECTED WORKFLOW) ----------------- */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#17243A] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold text-[#526FE8] uppercase tracking-wider">
              Workflow Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              From Scenario to Validated Benchmark in 4 Steps
            </h2>
            <p className="text-sm text-slate-400">
              A streamlined, automated workflow engineered for litigation data science and model benchmarking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeStep === s.num
                    ? 'bg-[#101A2C] border-[#526FE8] shadow-xl shadow-indigo-500/10'
                    : 'bg-[#101A2C]/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="h-8 w-8 rounded-xl bg-[#526FE8]/20 border border-[#526FE8]/30 text-[#526FE8] flex items-center justify-center font-mono font-bold text-xs">
                      0{s.num}
                    </span>
                    {activeStep === s.num && (
                      <span className="h-2 w-2 rounded-full bg-[#526FE8] animate-ping" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 mt-6 text-[11px] text-slate-500">
                  {s.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- FEATURE SHOWCASE (EDITORIAL ASYMMETRIC GRID) ----------------- */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold text-[#526FE8] uppercase tracking-wider">
            Capabilities Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Real-World Legal Tech Testing
          </h2>
          <p className="text-sm text-slate-400">
            A versatile feature set purpose-built to stress-test predictive coding, search indices, and privilege workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Scenario Intelligence (Span 2) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-[#17243A] border border-slate-700/80 shadow-xl space-y-4">
            <div className="p-2.5 w-fit rounded-xl bg-[#526FE8]/20 text-[#526FE8]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white">AI-Assisted Scenario Intelligence</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Configurable LLM provider integration extracts contextual roles, organizational structures,
              and realistic issue tags for fraud, patent disputes, employment actions, and antitrust matters.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 font-mono text-[11px]">
                Structured Pydantic JSON
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 font-mono text-[11px]">
                Google Gemini API
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 font-mono text-[11px]">
                Zero-Key Mock Fallback
              </span>
            </div>
          </div>

          {/* Card 2: Reproducibility & Random Seeds */}
          <div className="p-8 rounded-3xl bg-[#17243A] border border-slate-700/80 shadow-xl space-y-4">
            <div className="p-2.5 w-fit rounded-xl bg-cyan-500/20 text-cyan-300">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Deterministic Seeding</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Providing the same numeric seed yields bit-for-bit identical records, essential for scientific
              regression testing and benchmarking model performance over time.
            </p>
          </div>

          {/* Card 3: Class Imbalance */}
          <div className="p-8 rounded-3xl bg-[#17243A] border border-slate-700/80 shadow-xl space-y-4">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-500/20 text-indigo-300">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Calibrated Class Imbalance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real e-discovery review sets are notoriously imbalanced (often &lt;15% responsive).
              Configure balanced 50/50, realistic low-prior, or custom percentage distributions.
            </p>
          </div>

          {/* Card 4: Quality & Validation */}
          <div className="p-8 rounded-3xl bg-[#17243A] border border-slate-700/80 shadow-xl space-y-4">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white">5-Dimension Quality Audits</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automatic validation across schema validity, field completeness, document ID uniqueness,
              chronological consistency, and target distribution adherence.
            </p>
          </div>

          {/* Card 5: Streaming Exports */}
          <div className="p-8 rounded-3xl bg-[#17243A] border border-slate-700/80 shadow-xl space-y-4">
            <div className="p-2.5 w-fit rounded-xl bg-violet-500/20 text-violet-300">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Streaming CSV & JSON Exports</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instant downloads compatible with Pandas and Relativity, complete with dataset manifest metadata
              and synthetic data disclaimer headers.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------- INTERACTIVE PUBLIC DEMO SECTION ----------------- */}
      <section id="demo" className="py-20 md:py-28 bg-[#101A2C] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#526FE8] uppercase tracking-wider">
              Experience the Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Test Synthetic Generation Live
            </h2>
            <p className="text-xs text-slate-400">
              Simulate litigation matters below to preview generated document IDs, custodian relationships, and privilege logs.
            </p>
          </div>

          <InteractiveDemo />
        </div>
      </section>

      {/* ----------------- TECHNOLOGY ARCHITECTURE ----------------- */}
      <section id="technology" className="py-20 md:py-28 bg-[#17243A] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#526FE8] uppercase tracking-wider">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Modern Full-Stack Technical Stack
            </h2>
            <p className="text-xs text-slate-400">
              Clean separation of concerns with asynchronous Python processing and modern React client interfaces.
            </p>
          </div>

          {/* Architecture Pipeline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {[
              { title: 'Frontend UI', tech: 'React 19 + TypeScript + Vite + Tailwind', desc: 'Sleek legal-tech dashboard with Recharts & Figma-style inspector drawers' },
              { title: 'FastAPI Backend', tech: 'Python 3.12 + Pydantic v2', desc: 'Asynchronous REST API with input validation & streaming export endpoints' },
              { title: 'AI Scenario Engine', tech: 'Gemini 1.5 Flash / Mock Provider', desc: 'Domain contextual profiling, weighted roles, and issue tag derivation' },
              { title: 'Generation Engine', tech: 'NumPy 2.2 + Pandas + Faker', desc: 'Stochastic batch generation with conditional role-privilege probabilities' },
              { title: 'Database Layer', tech: 'PostgreSQL / SQLite Fallback', desc: 'SQLAlchemy ORM with indexing on doc_type, responsive, and privilege' },
            ].map((node, i) => (
              <div key={node.title} className="p-4 rounded-2xl bg-[#101A2C] border border-slate-700/80 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#526FE8] font-bold block mb-1">STAGE 0{i + 1}</span>
                  <h4 className="font-bold text-white text-xs">{node.title}</h4>
                  <p className="text-[11px] font-mono text-slate-300 mt-1">{node.tech}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- TRUST & ETHICS TRANSPARENCY ----------------- */}
      <section className="py-16 md:py-20 bg-[#101A2C] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
            <Lock className="h-3.5 w-3.5 text-[#526FE8]" />
            <span>Ethical Safeguards & Synthetic Integrity</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Trust, Transparency, and Compliance</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
            All generated identities, corporate entities, and litigation matters are strictly fictitious.
            DiscoSynth AI generates metadata only (not substantive case text), requires no confidential
            file ingestion, and does not claim statistical legal equivalence or formal privacy certification.
          </p>
        </div>
      </section>

      {/* ----------------- CTA & CONVERSION BANNER ----------------- */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[#101A2C] to-[#17243A] border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Better testing starts with better synthetic data.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Build diverse, reproducible litigation metadata datasets for e-discovery experimentation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handlePrimaryCta}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#526FE8] via-[#657feb] to-[#9288DB] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create Your Workspace</span>
            </button>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center cursor-pointer"
            >
              <span>Explore Platform Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="bg-[#0b121e] border-t border-slate-800/80 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-[#526FE8] flex items-center justify-center text-white">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">DiscoSynth AI</p>
              <p className="text-[10px] text-slate-500 font-mono">Synthetic Litigation Metadata Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#technology" className="hover:text-white transition-colors">Architecture</a>
            <Link to="/app" className="hover:text-white transition-colors">Workspace</Link>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-mono">
            <span>&copy; {new Date().getFullYear()} DiscoSynth AI. All data synthetic.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
