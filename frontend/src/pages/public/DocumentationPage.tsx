import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Database, Shield, FileText } from 'lucide-react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const navItems = [
    { id: 'getting-started', label: '1. Getting Started' },
    { id: 'architecture', label: '2. System Architecture' },
    { id: 'workflow', label: '3. Generation Workflow' },
    { id: 'schema', label: '4. Metadata Schema' },
    { id: 'api-reference', label: '5. API Reference' },
    { id: 'validation', label: '6. Quality Scoring' },
    { id: 'exports', label: '7. Export Formats' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sticky Docs Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] overflow-y-auto space-y-6 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider block">Documentation</span>
            <h2 className="text-sm font-bold text-[#F5F5F5]">DiscoSynth AI v1.0</h2>
          </div>

          <nav className="space-y-1 border-t border-[#1C1C1C] pt-4 font-mono text-xs">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`block px-2.5 py-1.5 rounded transition-colors ${
                  activeSection === item.id
                    ? 'bg-[#191919] text-[#F5F5F5] font-semibold border-l-2 border-[#F5F5F5]'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#111111]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="p-3 bg-[#111111] rounded border border-[#222222] space-y-2">
            <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
              Need technical support or want to inspect the source code?
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#F5F5F5] hover:underline font-semibold block"
            >
              GitHub Repository &rarr;
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-16 text-xs leading-relaxed text-[#A3A3A3]">
          {/* Section 1: Getting Started */}
          <section id="getting-started" className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-tight">
              Getting Started
            </h1>
            <p className="text-sm text-[#A3A3A3]">
              DiscoSynth AI generates completely fictional litigation document metadata to facilitate e-discovery benchmarking, machine learning model validation, and legal-tech software testing.
            </p>
            <div className="p-4 bg-[#111111] rounded border border-[#222222] space-y-2 font-mono text-xs">
              <span className="text-[#737373] text-[10px] uppercase">Core Premise</span>
              <p className="text-[#F5F5F5]">
                No real litigation documents or confidential records are required or created. The system models document metadata attributes (e.g. custodians, dates, responsiveness, privilege status, attachments) exclusively.
              </p>
            </div>
          </section>

          {/* Section 2: Architecture */}
          <section id="architecture" className="space-y-4 border-t border-[#1C1C1C] pt-12">
            <h2 className="text-xl font-bold text-[#F5F5F5]">2. System Architecture</h2>
            <p>
              The platform is structured into clean decoupled layers:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-[#F5F5F5]">Frontend:</strong> React 19, TypeScript, Tailwind CSS, Recharts for analytics, and Axios client.</li>
              <li><strong className="text-[#F5F5F5]">Backend Service:</strong> FastAPI (Python 3.12) with asynchronous request handling and Pydantic v2 schemas.</li>
              <li><strong className="text-[#F5F5F5]">Scenario Engine:</strong> Contextual profiling driven by LLM providers (Gemini 1.5 Flash with structured JSON output, or mock fallback).</li>
              <li><strong className="text-[#F5F5F5]">Synthetic Generation Engine:</strong> Procedural batch generation leveraging NumPy 2.2 and Faker 33.1.</li>
              <li><strong className="text-[#F5F5F5]">Persistence & Cache:</strong> SQLAlchemy ORM supporting managed PostgreSQL in production with SQLite development fallback.</li>
            </ul>
          </section>

          {/* Section 3: Generation Workflow */}
          <section id="workflow" className="space-y-4 border-t border-[#1C1C1C] pt-12">
            <h2 className="text-xl font-bold text-[#F5F5F5]">3. Generation Workflow</h2>
            <p>
              When a request is submitted via the UI or API endpoint:
            </p>
            <ol className="space-y-2 list-decimal list-inside font-mono text-[11px] text-[#A3A3A3]">
              <li><span className="text-[#F5F5F5]">Request Ingestion:</span> POST /api/generate validates input parameters via Pydantic.</li>
              <li><span className="text-[#F5F5F5]">Profile Derivation:</span> Retrieves scenario profile with role weights and issue taxonomies.</li>
              <li><span className="text-[#F5F5F5]">Procedural Batch Synthesis:</span> Records generated in 500-record chunks with conditional probabilities.</li>
              <li><span className="text-[#F5F5F5]">Validation Audit:</span> Executes 5-dimension quality assessment.</li>
              <li><span className="text-[#F5F5F5]">Database Persistence:</span> Records stored and indexed on doc_type, responsive, and privilege_status.</li>
            </ol>
          </section>

          {/* Section 4: Metadata Schema */}
          <section id="schema" className="space-y-4 border-t border-[#1C1C1C] pt-12">
            <h2 className="text-xl font-bold text-[#F5F5F5]">4. Synthetic Metadata Schema (23 Attributes)</h2>
            <p>
              Every synthetic document record conforms to the following schema:
            </p>

            <div className="overflow-x-auto rounded border border-[#222222] bg-[#111111]">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-[#222222] text-[#737373] text-[10px] uppercase">
                    <th className="p-3">Field</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] text-[#A3A3A3]">
                  <tr><td className="p-3 text-[#F5F5F5]">document_id</td><td>String</td><td>Unique document identifier</td><td>DOC-CASE-CF01-000042</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">case_id</td><td>String</td><td>Litigation matter identifier</td><td>CASE-CF01</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">document_type</td><td>Enum</td><td>Format classification</td><td>email, pdf, docx, xlsx, contract</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">custodian_id</td><td>String</td><td>Unique custodian identifier</td><td>CUST-014</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">custodian_role</td><td>Enum</td><td>Organizational role</td><td>executive, legal_counsel, auditor</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">fictional_custodian_name</td><td>String</td><td>Fictitious custodian name</td><td>Eleanor Vance</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">fictional_organization</td><td>String</td><td>Fictitious enterprise entity</td><td>Synthetica Global Corp</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">date_created</td><td>ISO-8601</td><td>Document creation timestamp</td><td>2023-04-12T14:22:00Z</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">date_modified</td><td>ISO-8601</td><td>Last modified timestamp (&ge; created)</td><td>2023-05-01T09:10:00Z</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">file_type</td><td>String</td><td>File extension</td><td>.eml, .pdf, .docx, .xlsx</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">communication_channel</td><td>String | null</td><td>Email client (emails only)</td><td>outlook, exchange, lotus_notes</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">confidentiality_level</td><td>Enum</td><td>Security tier</td><td>public, internal, confidential</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">privilege_status</td><td>Enum</td><td>Privilege log classification</td><td>privileged, not_privileged, partially</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">responsive</td><td>Boolean</td><td>E-discovery relevance flag</td><td>true / false</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">issue_tags</td><td>JSON Array</td><td>Scenario taxonomy tags</td><td>["wire-transfer", "whistleblower"]</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">legal_hold</td><td>Boolean</td><td>Subject to preservation order</td><td>true / false</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">review_status</td><td>Enum</td><td>Review workflow status</td><td>pending, reviewed, escalated</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">redaction_required</td><td>Boolean</td><td>Content redaction flag</td><td>true / false</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">document_family_id</td><td>String | null</td><td>Parent-child family cluster</td><td>FAM-CASE-CF01-0028</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">attachment_count</td><td>Integer</td><td>Count of attached items</td><td>0 to 12</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">file_size_kb</td><td>Float</td><td>File size in kilobytes</td><td>142.85</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">language</td><td>String</td><td>Language code</td><td>en</td></tr>
                  <tr><td className="p-3 text-[#F5F5F5]">jurisdiction</td><td>String</td><td>Jurisdiction venue</td><td>Southern District of New York</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: API Reference */}
          <section id="api-reference" className="space-y-4 border-t border-[#1C1C1C] pt-12">
            <h2 className="text-xl font-bold text-[#F5F5F5]">5. REST API Reference</h2>
            <p>
              Interactive Swagger / OpenAPI docs are available at <code className="text-[#F5F5F5]">http://localhost:8000/docs</code> when running locally.
            </p>

            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 bg-[#111111] rounded border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#191919] text-[#F5F5F5] font-bold">GET</span>
                  <span className="text-[#F5F5F5]">/api/health</span>
                </div>
                <p className="text-[#737373] text-[10px] mt-1 font-sans">Returns database connectivity and LLM provider health.</p>
              </div>

              <div className="p-3 bg-[#111111] rounded border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#191919] text-[#F5F5F5] font-bold">POST</span>
                  <span className="text-[#F5F5F5]">/api/generate</span>
                </div>
                <p className="text-[#737373] text-[10px] mt-1 font-sans">Generates a synthetic litigation dataset according to configuration specifications.</p>
              </div>

              <div className="p-3 bg-[#111111] rounded border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#191919] text-[#F5F5F5] font-bold">GET</span>
                  <span className="text-[#F5F5F5]">/api/datasets</span>
                </div>
                <p className="text-[#737373] text-[10px] mt-1 font-sans">Lists datasets with pagination and summary counts.</p>
              </div>

              <div className="p-3 bg-[#111111] rounded border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#191919] text-[#F5F5F5] font-bold">GET</span>
                  <span className="text-[#F5F5F5]">/api/datasets/{'{id}'}/records</span>
                </div>
                <p className="text-[#737373] text-[10px] mt-1 font-sans">Retrieves paginated document metadata records with search and filter parameters.</p>
              </div>

              <div className="p-3 bg-[#111111] rounded border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-[#191919] text-[#F5F5F5] font-bold">GET</span>
                  <span className="text-[#F5F5F5]">/api/datasets/{'{id}'}/export?format=csv|json</span>
                </div>
                <p className="text-[#737373] text-[10px] mt-1 font-sans">Streams structured CSV or JSON files with metadata manifests.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Quality Scoring */}
          <section id="validation" className="space-y-4 border-t border-[#1C1C1C] pt-12">
            <h2 className="text-xl font-bold text-[#F5F5F5]">6. Quality Scoring Methodology</h2>
            <p>
              The composite score is calculated using five weighted checks:
            </p>
            <div className="p-4 bg-[#111111] rounded border border-[#222222] font-mono text-[11px] space-y-1">
              <p className="text-[#F5F5F5]">Quality Score = (0.25 &times; Schema) + (0.25 &times; Completeness) + (0.20 &times; Uniqueness) + (0.20 &times; Consistency) + (0.10 &times; Adherence)</p>
            </div>
            <p className="text-xs text-[#737373]">
              Notice: The score evaluates synthetic dataset structural integrity and parameter compliance. It does not certify real-world statistical equivalence.
            </p>
          </section>

          {/* Section 7: Export Formats */}
          <section id="exports" className="space-y-4 border-t border-[#1C1C1C] pt-12">
            <h2 className="text-xl font-bold text-[#F5F5F5]">7. Export Formats</h2>
            <p>
              Datasets can be exported directly through the UI or REST API:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-[#F5F5F5]">CSV:</strong> Fully compliant with standard RFC-4180 format, readable by Pandas, PyTorch DataLoaders, and Relativity load file parsers.</li>
              <li><strong className="text-[#F5F5F5]">JSON:</strong> Standard UTF-8 JSON array with top-level manifest containing generation timestamp, seed, and ethics notice.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
