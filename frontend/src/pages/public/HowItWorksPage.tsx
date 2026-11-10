import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sliders, Database, Shield, Download } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Select a Litigation Scenario',
      tagline: 'Contextual Grounding',
      summary:
        'Choose a litigation scenario profile to anchor the metadata in a plausible legal context. Options include corporate fraud, intellectual property disputes, employment actions, financial misconduct, and custom scenarios.',
      details: [
        'Determines realistic jurisdictional venues and courts (e.g. SDNY, ND Cal, Delaware Chancery).',
        'Defines organizational context, custodian pools, and corporate departments.',
        'Injects scenario-specific issue taxonomy tags (e.g. wire-transfer, reverse-engineering, patent-infringement).',
      ],
      preview: {
        type: 'Scenario Profile',
        badge: 'Profile Derived',
        content: [
          ['Scenario Type', 'Corporate Financial Fraud'],
          ['Jurisdiction', 'Southern District of New York'],
          ['Custodian Pool', '30 Fictional Executives & Auditors'],
          ['Baseline Prior', '38% Responsive / 18% Privileged'],
        ],
      },
    },
    {
      step: '02',
      title: 'Configure Generation Parameters',
      tagline: 'Statistical Calibration',
      summary:
        'Specify the volume, document types, classification distributions, and random seed. Control the exact prior probability of responsiveness to simulate realistic, imbalanced e-discovery review collections.',
      details: [
        'Scale: 100, 500, 1,000, or 5,000 records per batch.',
        'Format selection: Email (.eml), PDF, Word (.docx), Excel (.xlsx), internal memos, and contracts.',
        'Classification: Balanced (50/50), realistic imbalanced (e.g. 15% responsive), or custom ratio.',
        'Reproducibility: Provide a numeric seed to reproduce bit-for-bit identical metadata for regression testing.',
      ],
      preview: {
        type: 'Parameter Specification',
        badge: 'User Configuration',
        content: [
          ['Batch Size', '1,000 Records'],
          ['Formats', 'Email (35%), PDF (20%), XLSX (20%), DOCX (25%)'],
          ['Prior Distribution', 'Imbalanced (20% Responsive)'],
          ['Deterministic Seed', '42 (Bit-for-bit reproducible)'],
        ],
      },
    },
    {
      step: '03',
      title: 'Generate Fictional Document Metadata',
      tagline: 'Procedural Execution',
      summary:
        'The generation engine runs a hybrid pipeline: using the scenario profile for contextual probability weights and NumPy + Faker for procedural identity and relationship synthesis.',
      details: [
        'Generates unique Document IDs (DOC-CASE-XXXX-000000) and Case IDs.',
        'Assigns parent-child document family structures (FAM-CASE-XXXX-0000) with realistic attachment counts.',
        'Enforces chronological consistency: date_created is strictly less than or equal to date_modified.',
        'Applies role-conditional probabilities: in-house counsel documents exhibit higher privilege and redaction rates.',
      ],
      preview: {
        type: 'Engine Execution Output',
        badge: 'Memory Managed (500/batch)',
        content: [
          ['Document ID', 'DOC-CASE-CF01-000412'],
          ['Family ID', 'FAM-CASE-CF01-0028 (Parent email + 2 attachments)'],
          ['Custodian', 'Sarah Lin, General Counsel'],
          ['Privilege Log', 'Privileged (Attorney-Client Communication)'],
        ],
      },
    },
    {
      step: '04',
      title: 'Validate, Analyse and Export',
      tagline: 'Integrity Verification & Export',
      summary:
        'Every dataset is evaluated against five measurable dimensions: schema validity, field completeness, ID uniqueness, logical consistency, and target distribution adherence.',
      details: [
        'Automated quality audit produces a composite score from 0% to 100%.',
        'Explore records in a paginated table with multi-filter search (by type, custodian, privilege status, responsiveness).',
        'Inspect analytics dashboards: document mix, privilege logs, creation timelines, and issue tags.',
        'Download streaming CSV (Pandas and Relativity compliant) or formatted JSON with manifest headers.',
      ],
      preview: {
        type: 'Audit & Export Artifact',
        badge: 'Passed Verification',
        content: [
          ['Overall Quality Score', '99.4%'],
          ['Completeness', '100% (23/23 attributes populated)'],
          ['Duplicate IDs', '0 (100% Unique)'],
          ['Export Formats', 'Streaming CSV & JSON available'],
        ],
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 md:py-24 space-y-20">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] px-2.5 py-1 rounded bg-[#141414] border border-[#262626]">
          Methodology
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F5] leading-tight">
          How DiscoSynth AI generates consistent litigation metadata.
        </h1>
        <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
          A transparent, four-step pipeline transforming legal domain context into benchmark-ready synthetic records.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-16 border-t border-[#1C1C1C] pt-16">
        {steps.map((s, idx) => (
          <div key={s.step} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Left: Narrative */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#F5F5F5] px-2 py-0.5 rounded bg-[#191919] border border-[#303030]">
                  Step {s.step}
                </span>
                <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
                  {s.tagline}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F5F5F5] tracking-tight">
                {s.title}
              </h2>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                {s.summary}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#A3A3A3]">
                {s.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A3A3A3] mt-1.5 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step Right: Clean Monochromatic Visual Preview */}
            <div className="lg:col-span-6 bg-[#111111] rounded-lg border border-[#2E2E2E] p-5 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222] text-[10px]">
                <span className="text-[#A3A3A3] uppercase">{s.preview.type}</span>
                <span className="text-[#F5F5F5] bg-[#191919] px-2 py-0.5 rounded border border-[#303030]">
                  {s.preview.badge}
                </span>
              </div>
              <div className="divide-y divide-[#1A1A1A] text-xs">
                {s.preview.content.map(([k, v]) => (
                  <div key={k} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-[#737373] text-[11px] font-sans">{k}:</span>
                    <span className="text-[#F5F5F5] text-[11px]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#1C1C1C] pt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#F5F5F5]">Ready to generate a test collection?</h3>
          <p className="text-xs text-[#737373]">Configure a scenario and inspect synthetic records in your workspace.</p>
        </div>
        <Link
          to="/signup"
          className="px-5 py-2.5 rounded-md bg-[#F5F5F5] hover:bg-white text-[#080808] text-xs font-semibold transition-colors shrink-0"
        >
          Create Workspace &rarr;
        </Link>
      </div>
    </div>
  );
}
