import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export default function FeaturesPage() {
  const categories = [
    {
      category: 'Generation Capabilities',
      tagline: 'Procedural & Contextual Modeling',
      features: [
        {
          name: '7 Document Formats',
          desc: 'Simulates email (.eml), PDF, Word (.docx), Excel (.xlsx), internal memos, financial reports, and contracts with log-normal file size distributions.',
        },
        {
          name: '23 Standard Metadata Attributes',
          desc: 'Outputs document IDs, case IDs, custodian identities, creation and revision timestamps, communication channels, confidentiality tiers, and legal hold flags.',
        },
        {
          name: 'Conditional Probability Engine',
          desc: 'Models realistic legal interactions: in-house legal counsel communications carry higher privilege rates; emails uniquely attach to communication channels; financial reports skew confidential.',
        },
        {
          name: 'Calibrated Class Distributions',
          desc: 'Supports balanced 50/50 splits, realistic imbalanced sets (down to 5% responsiveness), and custom percentage sliders to reflect real-world litigation priors.',
        },
        {
          name: 'Deterministic Seed Reproducibility',
          desc: 'Pinning a numeric seed generates bit-for-bit identical datasets across generator runs, enabling reliable machine learning regression testing.',
        },
        {
          name: 'Parent-Child Document Families',
          desc: 'Assigns document family IDs (FAM-CASE-XXXX-0000) with realistic attachment distributions (0 attachments, 1–3 attachments, or large attachment packets).',
        },
      ],
    },
    {
      category: 'Validation & Auditing',
      tagline: 'Objective Quality Measurement',
      features: [
        {
          name: 'Schema Verification',
          desc: 'Verifies strict enum constraints, ISO-8601 timestamps, boolean responsiveness, and JSON tag arrays before saving to the database.',
        },
        {
          name: 'Chronological Integrity',
          desc: 'Enforces that date_created is strictly less than or equal to date_modified for every document record.',
        },
        {
          name: 'Uniqueness Enforcement',
          desc: 'Detects duplicate document IDs across datasets and reports collision rates.',
        },
        {
          name: 'Field Completeness Checks',
          desc: 'Monitors non-null required attributes across all 23 schema properties, computing a discrete completeness ratio.',
        },
        {
          name: 'Composite Quality Score',
          desc: 'Calculates a transparent weighted quality rating based on schema validity (25%), completeness (25%), uniqueness (20%), consistency (20%), and distribution adherence (10%).',
        },
      ],
    },
    {
      category: 'Analytics & Intelligence',
      tagline: 'Aggregated Distribution Insights',
      features: [
        {
          name: 'Document Type Distribution',
          desc: 'Aggregates counts and percentages of all document extensions within the generated matter collection.',
        },
        {
          name: 'Responsive vs. Non-Responsive Split',
          desc: 'Displays the actual versus target classification distribution to evaluate class balance.',
        },
        {
          name: 'Attorney-Client Privilege Logs',
          desc: 'Categorizes privileged, partially privileged (redacted), and non-privileged documents across custodian departments.',
        },
        {
          name: 'Creation Timeline Trends',
          desc: 'Groups documents chronologically by month to verify realistic temporal distribution across the litigation window.',
        },
        {
          name: 'Issue Taxonomy Frequency',
          desc: 'Ranks the top 10 most frequent scenario tags (e.g. wire-transfer, whistleblower, patent-infringement).',
        },
      ],
    },
    {
      category: 'Exports & Interoperability',
      tagline: 'Standardized ML & Legal Formats',
      features: [
        {
          name: 'Streaming CSV Downloads',
          desc: 'Standard comma-delimited output optimized for Pandas DataFrames, Scikit-learn pipelines, and Relativity import scripts.',
        },
        {
          name: 'Formatted JSON Exports',
          desc: 'Indented JSON array of record objects accompanied by a manifest header recording dataset metadata, seed, and disclaimer.',
        },
        {
          name: 'Metadata Manifest Header',
          desc: 'Exports carry explicit synthetic disclaimers and generation configurations for provenance tracking.',
        },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 md:py-24 space-y-20">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] px-2.5 py-1 rounded bg-[#141414] border border-[#262626]">
          Specifications
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] leading-tight">
          Comprehensive Feature Matrix
        </h1>
        <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
          Engineered for data scientists, legal-tech software engineers, and e-discovery researchers requiring dependable metadata benchmarks.
        </p>
      </div>

      {/* Feature Categories */}
      <div className="space-y-16 border-t border-[#1C1C1C] pt-16">
        {categories.map((cat) => (
          <div key={cat.category} className="space-y-6">
            <div>
              <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider block mb-1">
                {cat.tagline}
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F5F5F5] tracking-tight">
                {cat.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.features.map((feat) => (
                <div
                  key={feat.name}
                  className="p-5 bg-[#111111] rounded-lg border border-[#222222] space-y-2 text-xs"
                >
                  <h3 className="font-semibold text-[#F5F5F5] text-sm">{feat.name}</h3>
                  <p className="text-[#A3A3A3] leading-relaxed text-xs">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#1C1C1C] pt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#F5F5F5]">Experience these features in the workspace</h3>
          <p className="text-xs text-[#737373]">Generate, explore, and export your first synthetic dataset in seconds.</p>
        </div>
        <Link
          to="/signup"
          className="px-5 py-2.5 rounded-md bg-[#F5F5F5] hover:bg-white text-[#080808] text-xs font-semibold transition-colors shrink-0"
        >
          Create Account &rarr;
        </Link>
      </div>
    </div>
  );
}
