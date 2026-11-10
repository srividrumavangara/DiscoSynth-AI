import { Link } from 'react-router-dom';
import { ArrowRight, Check, Database, Shield, Sliders, FileText } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-24 md:space-y-36 pb-24">
      {/* ---------------- B. HERO ---------------- */}
      <section className="pt-20 md:pt-28 max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] px-2.5 py-1 rounded bg-[#141414] border border-[#262626]">
            e-Discovery Synthetic Engine
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F5F5F5] leading-[1.08]">
            Synthetic data. <br />
            Without the compromise.
          </h1>
          <p className="text-sm sm:text-base text-[#A3A3A3] max-w-2xl mx-auto leading-relaxed pt-2">
            Generate realistic fictional litigation metadata for e-discovery experimentation, benchmarking and model testing.
          </p>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/platform"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#F5F5F5] hover:bg-white text-[#080808] text-xs font-semibold transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Explore the Platform</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#141414] hover:bg-[#1C1C1C] text-[#F5F5F5] text-xs font-semibold border border-[#303030] transition-colors inline-flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>

        {/* High-quality Product Visual: Realistic Synthetic Metadata Interface */}
        <div className="pt-8">
          <div className="rounded-lg bg-[#111111] border border-[#2E2E2E] shadow-2xl p-4 sm:p-5 text-left text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#303030]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#303030]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#303030]" />
                <span className="ml-2 font-mono text-[11px] text-[#737373]">
                  matter_securities_inquest_5000.csv &middot; 5,000 synthetic records
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#F5F5F5] bg-[#191919] border border-[#303030]">
                Quality Verified 99.4%
              </span>
            </div>

            <div className="overflow-x-auto pt-3">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-[#222222] text-[10px] text-[#737373] uppercase">
                    <th className="pb-2 font-medium">Document ID</th>
                    <th className="pb-2 font-medium">Format</th>
                    <th className="pb-2 font-medium">Custodian & Role</th>
                    <th className="pb-2 font-medium">Privilege Status</th>
                    <th className="pb-2 font-medium">Responsive</th>
                    <th className="pb-2 font-medium">Issue Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] text-[#A3A3A3]">
                  <tr className="hover:bg-[#161616]">
                    <td className="py-2.5 text-[#F5F5F5]">DOC-CASE-CF01-000012</td>
                    <td className="py-2.5">.eml</td>
                    <td className="py-2.5 text-[#F5F5F5] font-sans">Richard Vance, CFO</td>
                    <td className="py-2.5 text-[#F5F5F5]">Privileged (Withheld)</td>
                    <td className="py-2.5 text-[#F5F5F5]">TRUE</td>
                    <td className="py-2.5">wire-transfer</td>
                  </tr>
                  <tr className="hover:bg-[#161616]">
                    <td className="py-2.5 text-[#F5F5F5]">DOC-CASE-CF01-000045</td>
                    <td className="py-2.5">.xlsx</td>
                    <td className="py-2.5 text-[#F5F5F5] font-sans">Sarah Jenkins, Senior Auditor</td>
                    <td className="py-2.5 text-[#737373]">Not Privileged</td>
                    <td className="py-2.5 text-[#F5F5F5]">TRUE</td>
                    <td className="py-2.5">audit-discrepancy</td>
                  </tr>
                  <tr className="hover:bg-[#161616]">
                    <td className="py-2.5 text-[#F5F5F5]">DOC-CASE-CF01-000089</td>
                    <td className="py-2.5">.docx</td>
                    <td className="py-2.5 text-[#F5F5F5] font-sans">David Thorne, Legal Counsel</td>
                    <td className="py-2.5 text-[#F5F5F5]">Partially Privileged</td>
                    <td className="py-2.5 text-[#F5F5F5]">TRUE</td>
                    <td className="py-2.5">whistleblower</td>
                  </tr>
                  <tr className="hover:bg-[#161616]">
                    <td className="py-2.5 text-[#F5F5F5]">DOC-CASE-CF01-000104</td>
                    <td className="py-2.5">.pdf</td>
                    <td className="py-2.5 text-[#F5F5F5] font-sans">Elena Rostova, VP Operations</td>
                    <td className="py-2.5 text-[#737373]">Not Privileged</td>
                    <td className="py-2.5 text-[#737373]">FALSE</td>
                    <td className="py-2.5">quarterly-summary</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- C. SHORT PROBLEM STATEMENT ---------------- */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 border-t border-[#1C1C1C] pt-16">
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373]">The Problem</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F5] tracking-tight leading-snug">
            Real litigation metadata is restricted by confidentiality, privilege and data privacy regulations.
          </h2>
          <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-2xl">
            Modern e-discovery machine learning models require diverse, realistically distributed document metadata for training and benchmarking. However, law firms and corporate legal departments cannot disclose genuine case records due to attorney-client privilege, work-product doctrine, NDAs, and privacy regulations like GDPR and HIPAA.
          </p>
        </div>
      </section>

      {/* ---------------- D. PRODUCT INTRODUCTION ---------------- */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 border-t border-[#1C1C1C] pt-16">
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373]">The Solution</span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F5] tracking-tight leading-snug">
            Fictional litigation metadata. Contextually consistent and mathematically sound.
          </h2>
          <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-2xl">
            DiscoSynth AI uses a hybrid architecture: an AI scenario engine that profiles complex litigation types, paired with a deterministic generation engine that models real-world e-discovery conditions—custodian hierarchies, communication channels, attachment families, and class imbalance.
          </p>
        </div>
      </section>

      {/* ---------------- E. PRODUCT PREVIEW ---------------- */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 border-t border-[#1C1C1C] pt-16">
        <div className="rounded-lg bg-[#111111] border border-[#2E2E2E] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F5F5]">Deterministic Generation & Audit Engine</h3>
              <p className="text-xs text-[#737373]">Reproducible random seeds &middot; 5-dimension quality verification</p>
            </div>
            <Link
              to="/platform"
              className="text-xs text-[#F5F5F5] hover:text-white font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Explore Platform Capabilities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#161616] rounded border border-[#262626]">
              <span className="text-[10px] text-[#737373] block uppercase">Schema Integrity</span>
              <span className="text-base font-semibold text-[#F5F5F5]">100%</span>
            </div>
            <div className="p-3 bg-[#161616] rounded border border-[#262626]">
              <span className="text-[10px] text-[#737373] block uppercase">Completeness</span>
              <span className="text-base font-semibold text-[#F5F5F5]">100%</span>
            </div>
            <div className="p-3 bg-[#161616] rounded border border-[#262626]">
              <span className="text-[10px] text-[#737373] block uppercase">ID Uniqueness</span>
              <span className="text-base font-semibold text-[#F5F5F5]">100%</span>
            </div>
            <div className="p-3 bg-[#161616] rounded border border-[#262626]">
              <span className="text-[10px] text-[#737373] block uppercase">Composite Score</span>
              <span className="text-base font-semibold text-[#F5F5F5]">99.2%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- F. SHORT WORKFLOW ---------------- */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 border-t border-[#1C1C1C] pt-16">
        <div className="space-y-8">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373]">Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F5] tracking-tight">Four stages. Zero confidential inputs.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div className="space-y-2 p-4 bg-[#111111] rounded border border-[#222222]">
              <span className="text-[10px] font-mono text-[#737373]">01</span>
              <h4 className="font-semibold text-[#F5F5F5]">Scenario Selection</h4>
              <p className="text-[#A3A3A3] text-[11px] leading-relaxed">Choose corporate fraud, IP, employment litigation or custom dispute.</p>
            </div>
            <div className="space-y-2 p-4 bg-[#111111] rounded border border-[#222222]">
              <span className="text-[10px] font-mono text-[#737373]">02</span>
              <h4 className="font-semibold text-[#F5F5F5]">Parameter Calibration</h4>
              <p className="text-[#A3A3A3] text-[11px] leading-relaxed">Configure document types, prior probabilities, scale and random seeds.</p>
            </div>
            <div className="space-y-2 p-4 bg-[#111111] rounded border border-[#222222]">
              <span className="text-[10px] font-mono text-[#737373]">03</span>
              <h4 className="font-semibold text-[#F5F5F5]">Procedural Engine</h4>
              <p className="text-[#A3A3A3] text-[11px] leading-relaxed">Faker and NumPy generate coherent custodians and document family trees.</p>
            </div>
            <div className="space-y-2 p-4 bg-[#111111] rounded border border-[#222222]">
              <span className="text-[10px] font-mono text-[#737373]">04</span>
              <h4 className="font-semibold text-[#F5F5F5]">Audit & Export</h4>
              <p className="text-[#A3A3A3] text-[11px] leading-relaxed">Validate schema compliance and export structured CSV or JSON.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- G. FINAL CTA ---------------- */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 border-t border-[#1C1C1C] pt-20">
        <div className="rounded-lg bg-[#111111] border border-[#2E2E2E] p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-semibold text-[#F5F5F5] tracking-tight">
            Better testing starts with better synthetic data.
          </h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
            Create an account to generate, inspect and export reproducible litigation metadata for e-discovery benchmarking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#F5F5F5] hover:bg-white text-[#080808] text-xs font-semibold transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/how-it-works"
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#161616] hover:bg-[#202020] text-[#A3A3A3] hover:text-[#F5F5F5] text-xs font-medium border border-[#2E2E2E] transition-colors"
            >
              How It Works &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
