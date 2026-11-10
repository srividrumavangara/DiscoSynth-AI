import { useState } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SampleRecord {
  document_id: string;
  document_type: string;
  custodian: string;
  role: string;
  responsive: boolean;
  privilege: 'privileged' | 'not_privileged' | 'partially_privileged';
  confidentiality: string;
  issue_tag: string;
}

const DEMO_PRESETS: Record<string, { desc: string; records: SampleRecord[] }> = {
  corporate_fraud: {
    desc: 'Accounting irregularities, whistleblower memos, wire transfers, and executive concealment.',
    records: [
      {
        document_id: 'DOC-CASE-CF01-000012',
        document_type: 'email',
        custodian: 'Richard Vance',
        role: 'Chief Financial Officer',
        responsive: true,
        privilege: 'privileged',
        confidentiality: 'highly_confidential',
        issue_tag: 'wire-transfer',
      },
      {
        document_id: 'DOC-CASE-CF01-000045',
        document_type: 'financial_report',
        custodian: 'Sarah Jenkins',
        role: 'Senior Financial Analyst',
        responsive: true,
        privilege: 'not_privileged',
        confidentiality: 'confidential',
        issue_tag: 'audit-discrepancy',
      },
      {
        document_id: 'DOC-CASE-CF01-000089',
        document_type: 'internal_memo',
        custodian: 'David Thorne',
        role: 'In-House Legal Counsel',
        responsive: true,
        privilege: 'partially_privileged',
        confidentiality: 'confidential',
        issue_tag: 'whistleblower',
      },
      {
        document_id: 'DOC-CASE-CF01-000104',
        document_type: 'pdf',
        custodian: 'Elena Rostova',
        role: 'Executive VP of Sales',
        responsive: false,
        privilege: 'not_privileged',
        confidentiality: 'internal',
        issue_tag: 'general-reporting',
      },
      {
        document_id: 'DOC-CASE-CF01-000142',
        document_type: 'contract',
        custodian: 'Marcus Sterling',
        role: 'External Auditor',
        responsive: false,
        privilege: 'not_privileged',
        confidentiality: 'internal',
        issue_tag: 'vendor-agreement',
      },
    ],
  },
  ip_dispute: {
    desc: 'Patent infringement, reverse engineering, semiconductor trade secrets, and source code memos.',
    records: [
      {
        document_id: 'DOC-CASE-IP02-000021',
        document_type: 'docx',
        custodian: 'Dr. Aris Thorne',
        role: 'Principal Silicon Architect',
        responsive: true,
        privilege: 'not_privileged',
        confidentiality: 'highly_confidential',
        issue_tag: 'reverse-engineering',
      },
      {
        document_id: 'DOC-CASE-IP02-000054',
        document_type: 'email',
        custodian: 'Claire Beaumont',
        role: 'Chief IP Counsel',
        responsive: true,
        privilege: 'privileged',
        confidentiality: 'confidential',
        issue_tag: 'patent-infringement',
      },
      {
        document_id: 'DOC-CASE-IP02-000099',
        document_type: 'contract',
        custodian: 'Liam Henderson',
        role: 'VP Technology Licensing',
        responsive: true,
        privilege: 'not_privileged',
        confidentiality: 'confidential',
        issue_tag: 'royalty-dispute',
      },
      {
        document_id: 'DOC-CASE-IP02-000133',
        document_type: 'pdf',
        custodian: 'Mei-Ling Zhou',
        role: 'R&D Engineering Director',
        responsive: false,
        privilege: 'not_privileged',
        confidentiality: 'internal',
        issue_tag: 'benchmarking',
      },
      {
        document_id: 'DOC-CASE-IP02-000167',
        document_type: 'internal_memo',
        custodian: 'Kenneth Miller',
        role: 'Lead Firmware Engineer',
        responsive: false,
        privilege: 'partially_privileged',
        confidentiality: 'confidential',
        issue_tag: 'firmware-design',
      },
    ],
  },
  employment_litigation: {
    desc: 'Discrimination claims, HR investigations, wrongful termination, and retaliatory communications.',
    records: [
      {
        document_id: 'DOC-CASE-EM03-000018',
        document_type: 'email',
        custodian: 'Heather Brooks',
        role: 'VP Human Resources',
        responsive: true,
        privilege: 'privileged',
        confidentiality: 'confidential',
        issue_tag: 'HR-complaint',
      },
      {
        document_id: 'DOC-CASE-EM03-000062',
        document_type: 'docx',
        custodian: 'Brian O’Connor',
        role: 'Regional Operations Manager',
        responsive: true,
        privilege: 'not_privileged',
        confidentiality: 'confidential',
        issue_tag: 'wrongful-termination',
      },
      {
        document_id: 'DOC-CASE-EM03-000091',
        document_type: 'internal_memo',
        custodian: 'Samantha Lee',
        role: 'Workplace Investigator',
        responsive: true,
        privilege: 'partially_privileged',
        confidentiality: 'highly_confidential',
        issue_tag: 'retaliation',
      },
      {
        document_id: 'DOC-CASE-EM03-000115',
        document_type: 'xlsx',
        custodian: 'Carlos Mendez',
        role: 'Compensation Analyst',
        responsive: false,
        privilege: 'not_privileged',
        confidentiality: 'internal',
        issue_tag: 'performance-eval',
      },
      {
        document_id: 'DOC-CASE-EM03-000150',
        document_type: 'pdf',
        custodian: 'Diana Ross',
        role: 'Recruiting Lead',
        responsive: false,
        privilege: 'not_privileged',
        confidentiality: 'internal',
        issue_tag: 'hiring-pipeline',
      },
    ],
  },
};

export default function InteractiveDemo() {
  const { openAuthModal } = useAuth();
  const [scenario, setScenario] = useState<string>('corporate_fraud');
  const [responsivePct, setResponsivePct] = useState<number>(40);
  const [docTypes, setDocTypes] = useState<string[]>(['email', 'pdf', 'financial_report']);
  const [isSimulating, setIsSimulating] = useState(false);

  const activePreset = DEMO_PRESETS[scenario] || DEMO_PRESETS.corporate_fraud;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  const toggleDocType = (type: string) => {
    setDocTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="bg-[#17243A] rounded-3xl border border-slate-700/80 p-6 md:p-8 shadow-2xl text-white">
      {/* Demo Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[#526FE8]/20 text-[#526FE8] text-[10px] font-mono font-bold border border-[#526FE8]/30 uppercase">
              Live Public Demo Sandbox
            </span>
            <span className="text-xs text-slate-400 font-mono">• 0% Confidential Data</span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Interactive Litigation Metadata Simulator
          </h3>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#526FE8] to-[#9288DB] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 self-start md:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
        </button>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6">
        {/* Input 1: Scenario Selector */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            1. Select Matter Scenario
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'corporate_fraud', label: 'Corporate Fraud' },
              { id: 'ip_dispute', label: 'Semiconductor IP Dispute' },
              { id: 'employment_litigation', label: 'Employment Litigation' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  scenario === s.id
                    ? 'bg-[#526FE8]/20 border-[#526FE8] text-white font-semibold'
                    : 'bg-slate-900/60 border-slate-700/70 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input 2: Responsiveness Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <span>2. Target Responsiveness</span>
            <span className="text-[#526FE8] font-bold">{responsivePct}%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/70 space-y-3">
            <input
              type="range"
              min="10"
              max="90"
              value={responsivePct}
              onChange={(e) => setResponsivePct(parseInt(e.target.value))}
              className="w-full accent-[#526FE8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Rare Imbalanced (10%)</span>
              <span>Balanced (50%)</span>
              <span>High (90%)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
              Calibrates the classification prior probability for training machine learning review models.
            </p>
          </div>
        </div>

        {/* Input 3: Document Type Matrix */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            3. Target Document Formats
          </label>
          <div className="flex flex-wrap gap-1.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/70">
            {['email', 'pdf', 'docx', 'xlsx', 'financial_report', 'contract', 'internal_memo'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleDocType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                  docTypes.includes(t)
                    ? 'bg-[#526FE8] text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Table Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Generated Metadata Records Preview (5 Sample Documents)
          </span>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Schema Validated (99.4%)
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-900/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700/70 text-[10px] font-mono text-slate-400 uppercase">
                <th className="px-4 py-3">Document ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Custodian & Role</th>
                <th className="px-4 py-3">Responsiveness</th>
                <th className="px-4 py-3">Privilege Status</th>
                <th className="px-4 py-3">Issue Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {activePreset.records.map((r) => (
                <tr key={r.document_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-semibold">{r.document_id}</td>
                  <td className="px-4 py-3 capitalize text-slate-400">{r.document_type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 font-sans">
                    <p className="font-semibold text-white text-xs">{r.custodian}</p>
                    <p className="text-[10px] text-slate-400">{r.role}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.responsive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {r.responsive ? 'Responsive' : 'Non-Responsive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.privilege === 'privileged'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : r.privilege === 'partially_privileged'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {r.privilege.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#526FE8] font-mono">#{r.issue_tag}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workspace Upgrade Callout */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#101A2C] border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#526FE8]/20 text-[#526FE8] shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Need Full Batches of 5,000+ Records?</h4>
            <p className="text-[11px] text-slate-400">
              Launch the Counsel Workspace to generate large reproducible datasets, export CSV/JSON, and run quality audits.
            </p>
          </div>
        </div>

        <button
          onClick={() => openAuthModal('signup')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all shrink-0 shadow-md"
        >
          <span>Launch Workspace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
