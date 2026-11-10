import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sliders, Database, Shield, Download, BarChart3, Cpu, FileText } from 'lucide-react';

export default function PlatformPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-24 space-y-24">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] px-2.5 py-1 rounded bg-[#141414] border border-[#262626]">
          Platform Architecture
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] leading-tight">
          An engine built for e-discovery metadata fidelity.
        </h1>
        <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
          DiscoSynth AI combines generative scenario context with procedural statistical distributions to generate realistic, benchmark-ready legal metadata.
        </p>
      </div>

      {/* Capability 1: Scenario Configuration (Split view) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-[#1C1C1C] pt-16">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Capability 01</span>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">
            Scenario Configuration & Profiling
          </h2>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            Select from established litigation patterns—including corporate fraud, intellectual property disputes, employment litigation, and financial misconduct—or define custom regulatory scopes.
          </p>
          <ul className="space-y-2 text-xs text-[#A3A3A3] pt-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3A3A3]" />
              <span>Tailored jurisdiction venues and court structures</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3A3A3]" />
              <span>Custom issue taxonomy tags per matter</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3A3A3]" />
              <span>Contextual custodian role hierarchies</span>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7 bg-[#111111] rounded-lg border border-[#2E2E2E] p-5 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#222222] text-[#737373] text-[10px]">
            <span>PROFILE_DEFINITION.JSON</span>
            <span>SCENARIO: CORPORATE_FRAUD</span>
          </div>
          <pre className="text-[11px] text-[#A3A3A3] leading-relaxed overflow-x-auto p-3 bg-[#0A0A0A] rounded">
{`{
  "scenario": "corporate_fraud",
  "custodian_roles": {
    "executive": 0.25,
    "financial_analyst": 0.25,
    "legal_counsel": 0.15,
    "internal_auditor": 0.15
  },
  "baseline_responsiveness": 0.38,
  "privilege_probability": 0.18,
  "issue_tags": ["wire-transfer", "whistleblower", "audit-discrepancy"]
}`}
          </pre>
        </div>
      </section>

      {/* Capability 2: AI-Assisted Scenario Intelligence (Editorial callout) */}
      <section className="border-t border-[#1C1C1C] pt-16 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Capability 02</span>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">AI-Assisted Scenario Intelligence</h2>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            Rather than directly outputting thousands of rows, the LLM operates as a domain architect. It returns a structured Pydantic profile that guides the generation engine, ensuring mathematical bounds and factual isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-2">
          <div className="p-4 bg-[#111111] rounded border border-[#2E2E2E] space-y-2">
            <span className="text-[10px] text-[#737373] uppercase">Model Providers</span>
            <p className="text-sm font-semibold text-[#F5F5F5]">Configurable LLM</p>
            <p className="text-[11px] text-[#737373] font-sans">Gemini API integration with zero-credential mock fallback.</p>
          </div>
          <div className="p-4 bg-[#111111] rounded border border-[#2E2E2E] space-y-2">
            <span className="text-[10px] text-[#737373] uppercase">Structured Validation</span>
            <p className="text-sm font-semibold text-[#F5F5F5]">Pydantic Enforcement</p>
            <p className="text-[11px] text-[#737373] font-sans">Strict JSON schema validation prior to stochastic ingestion.</p>
          </div>
          <div className="p-4 bg-[#111111] rounded border border-[#2E2E2E] space-y-2">
            <span className="text-[10px] text-[#737373] uppercase">Privacy Isolation</span>
            <p className="text-sm font-semibold text-[#F5F5F5]">Zero Confidential Data</p>
            <p className="text-[11px] text-[#737373] font-sans">No confidential client records required or accepted as input.</p>
          </div>
        </div>
      </section>

      {/* Capability 3: Procedural Metadata Generation (Wide preview) */}
      <section className="border-t border-[#1C1C1C] pt-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Capability 03</span>
            <h2 className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">Synthetic Metadata Engine</h2>
          </div>
          <span className="text-xs font-mono text-[#737373]">NumPy 2.2 &middot; Faker 33.1</span>
        </div>

        <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-2xl">
          Generates 100 to 5,000 document records per batch. Assigns 23 standard metadata attributes per record, enforcing conditional probabilities—such as legal counsel correspondence exhibiting elevated privilege and redaction requirements.
        </p>

        <div className="bg-[#111111] rounded-lg border border-[#2E2E2E] p-5 font-mono text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
            <div>
              <span className="text-[#737373] block">DOCUMENT TYPES</span>
              <span className="text-[#F5F5F5] font-semibold">.eml, .pdf, .docx, .xlsx</span>
            </div>
            <div>
              <span className="text-[#737373] block">DATE BOUNDS</span>
              <span className="text-[#F5F5F5] font-semibold">date_created &le; date_modified</span>
            </div>
            <div>
              <span className="text-[#737373] block">DOC FAMILIES</span>
              <span className="text-[#F5F5F5] font-semibold">Parent-child clusters</span>
            </div>
            <div>
              <span className="text-[#737373] block">COMM CHANNELS</span>
              <span className="text-[#F5F5F5] font-semibold">Outlook, Exchange (emails only)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Capability 4: Validation & Quality Checks */}
      <section className="border-t border-[#1C1C1C] pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Capability 04</span>
          <h2 className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">Validation & Consistency Auditing</h2>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            Every dataset is verified before persistence. The validation engine calculates five discrete component scores to ensure dataset integrity.
          </p>
          <div className="pt-2">
            <Link
              to="/documentation#validation"
              className="text-xs text-[#F5F5F5] hover:text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>View validation scoring formula</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#111111] rounded-lg border border-[#2E2E2E] p-5 font-mono text-xs space-y-3">
          <div className="flex justify-between text-[#737373] text-[10px] border-b border-[#222222] pb-2">
            <span>QUALITY SCORE METRICS</span>
            <span>WEIGHT</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
              <span className="text-[#F5F5F5]">1. Schema Validity</span>
              <span className="text-[#A3A3A3]">25%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
              <span className="text-[#F5F5F5]">2. Field Completeness</span>
              <span className="text-[#A3A3A3]">25%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
              <span className="text-[#F5F5F5]">3. Document ID Uniqueness</span>
              <span className="text-[#A3A3A3]">20%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
              <span className="text-[#F5F5F5]">4. Logical & Relational Consistency</span>
              <span className="text-[#A3A3A3]">20%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#F5F5F5]">5. Target Distribution Adherence</span>
              <span className="text-[#A3A3A3]">10%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Capability 5: Exports */}
      <section className="border-t border-[#1C1C1C] pt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Capability 05</span>
          <h2 className="text-xl font-semibold text-[#F5F5F5]">Direct Streaming Exports</h2>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            Download generated datasets as CSV (formatted for Pandas, Scikit-learn, and Relativity imports) or indented JSON with dataset manifest headers.
          </p>
        </div>

        <Link
          to="/app/generate"
          className="px-5 py-2.5 rounded-md bg-[#F5F5F5] hover:bg-white text-[#080808] text-xs font-semibold transition-colors self-start sm:self-auto shrink-0"
        >
          Generate Dataset Now &rarr;
        </Link>
      </section>
    </div>
  );
}
