import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download,
  Search,
  Copy,
  Check,
  Layers,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import DataTable, { type Column } from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SlideOver from '../components/SlideOver';
import { getDatasets, getDataset, getDatasetRecords, getExportUrl } from '../api/client';
import type { Dataset, DocumentMetadata, PaginatedResponse } from '../types';

export default function DatasetExplorer() {
  const { datasetId, id } = useParams<{ datasetId?: string; id?: string }>();
  const activeId = datasetId || id;
  if (!activeId) return <DatasetPicker />;
  return <DatasetView datasetId={activeId} />;
}

function DatasetPicker() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDatasets(1, 50)
      .then((res) => setDatasets(res.items.filter((d) => d.status === 'completed')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Locating litigation matters..." />;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">Dataset Explorer</h1>
        <p className="text-xs text-[#737373] mt-1">
          Select a litigation metadata dataset to inspect records, document families, and privilege logs.
        </p>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No completed datasets available"
          description="Generate your first synthetic litigation matter to browse records."
          action={
            <Link
              to="/app/generate"
              className="px-4 py-2 bg-white text-[#080808] rounded-lg text-xs font-semibold hover:bg-[#E5E5E5] transition-colors"
            >
              Generate Dataset
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              onClick={() => navigate(`/app/datasets/${ds.id}/explorer`)}
              className="bg-[#111111] rounded-xl border border-[#262626] p-5 text-left hover:border-[#404040] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
                    {ds.scenario.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-[#F5F5F5] bg-[#191919] px-2 py-0.5 rounded border border-[#303030]">
                    {ds.quality_score ? `${ds.quality_score.toFixed(1)}% Quality` : '—'}
                  </span>
                </div>
                <h3 className="font-semibold text-[#F5F5F5] group-hover:text-white transition-colors text-sm">
                  {ds.name}
                </h3>
              </div>

              <div className="pt-4 border-t border-[#1e1e1e] mt-4 flex items-center justify-between text-xs text-[#737373]">
                <span className="font-mono">{ds.num_records.toLocaleString()} records</span>
                <span className="font-medium text-[#F5F5F5] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Explore <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DatasetView({ datasetId }: { datasetId: string }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [records, setRecords] = useState<PaginatedResponse<DocumentMetadata> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<DocumentMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'privilege' | 'tags' | 'json'>('overview');
  const [copied, setCopied] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [responsiveFilter, setResponsiveFilter] = useState('');
  const [privilegeFilter, setPrivilegeFilter] = useState('');

  const loadRecords = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { page, page_size: 25 };
      if (docTypeFilter) params.document_type = docTypeFilter;
      if (responsiveFilter) params.responsive = responsiveFilter;
      if (privilegeFilter) params.privilege_status = privilegeFilter;
      if (search) params.search = search;
      const res = await getDatasetRecords(datasetId, params);
      setRecords(res);
    } catch (err) {
      console.error(err);
    }
  }, [datasetId, page, docTypeFilter, responsiveFilter, privilegeFilter, search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const ds = await getDataset(datasetId);
        setDataset(ds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [datasetId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const copyJson = () => {
    if (!selected) return;
    navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner message="Retrieving record family index..." />;
  if (!dataset) return <EmptyState title="Dataset not found" description="This dataset does not exist." />;

  const columns: Column<DocumentMetadata>[] = [
    {
      key: 'document_id',
      header: 'Document ID',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#F5F5F5]">
          {r.document_id}
        </span>
      ),
    },
    {
      key: 'document_type',
      header: 'Document Type',
      render: (r) => (
        <span className="capitalize px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030] text-[11px] font-mono">
          {r.document_type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'fictional_custodian_name',
      header: 'Custodian / Role',
      render: (r) => (
        <div>
          <p className="font-medium text-[#F5F5F5] text-xs">{r.fictional_custodian_name}</p>
          <p className="text-[10px] text-[#737373] capitalize">{r.custodian_role.replace(/_/g, ' ')}</p>
        </div>
      ),
    },
    {
      key: 'date_created',
      header: 'Date Created',
      render: (r) => (
        <span className="text-[#A3A3A3] font-mono text-[11px]">
          {new Date(r.date_created).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'responsive',
      header: 'Responsive',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded font-mono text-[10px] font-medium border ${
            r.responsive
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
              : 'bg-[#191919] text-[#737373] border-[#303030]'
          }`}
        >
          {r.responsive ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'privilege_status',
      header: 'Privilege Log',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded font-mono text-[10px] font-medium border ${
            r.privilege_status === 'privileged'
              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
              : r.privilege_status === 'partially_privileged'
              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
              : 'bg-[#191919] text-[#A3A3A3] border-[#303030]'
          }`}
        >
          {r.privilege_status.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'confidentiality_level',
      header: 'Confidentiality',
      render: (r) => (
        <span className="text-[11px] text-[#A3A3A3] font-medium capitalize">
          {r.confidentiality_level.replace(/_/g, ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111111] p-6 rounded-xl border border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191919] text-[#A3A3A3] border border-[#303030]">
              {dataset.scenario.replace(/_/g, ' ')}
            </span>
            <span className="text-[#303030]">&bull;</span>
            <span className="text-xs text-[#737373] font-mono">
              {dataset.num_records.toLocaleString()} total documents
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">{dataset.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getExportUrl(datasetId, 'csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#191919] border border-[#303030] hover:bg-[#202020] rounded-lg text-xs font-medium text-[#D4D4D4] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </a>
          <a
            href={getExportUrl(datasetId, 'json')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#191919] border border-[#303030] hover:bg-[#202020] rounded-lg text-xs font-medium text-[#D4D4D4] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON</span>
          </a>
          <Link
            to={`/app/datasets/${datasetId}/analytics`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#080808] hover:bg-[#E5E5E5] rounded-lg text-xs font-semibold transition-all"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111111] p-3 rounded-xl border border-[#262626] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737373]" />
          <input
            type="text"
            placeholder="Search Document ID, Custodian Name, Organization..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-[#191919] border border-[#303030] rounded-lg text-xs text-[#F5F5F5] placeholder-[#555] focus:outline-none focus:border-[#737373]"
          />
        </div>

        <select
          value={docTypeFilter}
          onChange={(e) => {
            setDocTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-[#303030] rounded-lg text-xs text-[#F5F5F5] bg-[#191919] focus:outline-none"
        >
          <option value="">All Document Types</option>
          {['email', 'pdf', 'docx', 'xlsx', 'internal_memo', 'financial_report', 'contract'].map(
            (t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            )
          )}
        </select>

        <select
          value={responsiveFilter}
          onChange={(e) => {
            setResponsiveFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-[#303030] rounded-lg text-xs text-[#F5F5F5] bg-[#191919] focus:outline-none"
        >
          <option value="">All Responsiveness</option>
          <option value="true">Responsive (Relevance True)</option>
          <option value="false">Non-Responsive</option>
        </select>

        <select
          value={privilegeFilter}
          onChange={(e) => {
            setPrivilegeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-[#303030] rounded-lg text-xs text-[#F5F5F5] bg-[#191919] focus:outline-none"
        >
          <option value="">All Privilege Statuses</option>
          <option value="privileged">Privileged (Withheld)</option>
          <option value="not_privileged">Not Privileged</option>
          <option value="partially_privileged">Partially Privileged (Redacted)</option>
        </select>
      </div>

      {/* Main Table */}
      {records && (
        <DataTable<DocumentMetadata>
          columns={columns}
          data={records.items}
          page={page}
          pageSize={25}
          total={records.total}
          onPageChange={setPage}
          onRowClick={(row) => setSelected(row)}
        />
      )}

      {/* Side Inspector Drawer */}
      <SlideOver
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.document_id || 'Document Metadata'}
        subtitle={`Case ID: ${selected?.case_id}`}
        width="max-w-2xl"
        actions={
          <button
            onClick={copyJson}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-[#191919] hover:bg-[#202020] text-[#D4D4D4] border border-[#303030] transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy Record'}</span>
          </button>
        }
      >
        {selected && (
          <div className="space-y-6">
            {/* Quick Status Pills Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#191919] border border-[#303030] text-xs font-mono text-[#F5F5F5]">
                {selected.file_type} ({selected.file_size_kb} KB)
              </span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono border ${
                  selected.responsive
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                    : 'bg-[#191919] text-[#737373] border-[#303030]'
                }`}
              >
                {selected.responsive ? 'Responsive' : 'Non-Responsive'}
              </span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono border ${
                  selected.privilege_status === 'privileged'
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                    : selected.privilege_status === 'partially_privileged'
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                    : 'bg-[#191919] text-[#A3A3A3] border-[#303030]'
                }`}
              >
                {selected.privilege_status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#262626] text-xs font-medium">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'privilege', label: 'Privilege & Legal' },
                { id: 'tags', label: 'Issue Tags & Venue' },
                { id: 'json', label: 'Raw JSON Payload' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-white text-white'
                      : 'border-transparent text-[#737373] hover:text-[#A3A3A3]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-[#141414] p-4 rounded-xl border border-[#262626] text-xs">
                  <div>
                    <span className="text-[#737373] block text-[10px] font-mono uppercase">Custodian</span>
                    <span className="font-semibold text-[#F5F5F5] text-xs mt-0.5 block">
                      {selected.fictional_custodian_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block text-[10px] font-mono uppercase">Custodian Role</span>
                    <span className="text-[#D4D4D4] capitalize text-xs mt-0.5 block">
                      {selected.custodian_role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block text-[10px] font-mono uppercase">Fictional Entity</span>
                    <span className="text-[#D4D4D4] text-xs mt-0.5 block">{selected.fictional_organization}</span>
                  </div>
                  <div>
                    <span className="text-[#737373] block text-[10px] font-mono uppercase">Document Type</span>
                    <span className="text-[#D4D4D4] capitalize text-xs mt-0.5 block">
                      {selected.document_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block text-[10px] font-mono uppercase">Date Created</span>
                    <span className="font-mono text-[#A3A3A3] text-xs mt-0.5 block">
                      {new Date(selected.date_created).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block text-[10px] font-mono uppercase">Date Modified</span>
                    <span className="font-mono text-[#A3A3A3] text-xs mt-0.5 block">
                      {new Date(selected.date_modified).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#A3A3A3]" />
                    <span className="text-[#737373]">Family ID:</span>
                    <span className="font-mono text-[#F5F5F5]">
                      {selected.document_family_id || 'Standalone Document'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#A3A3A3]">
                    {selected.attachment_count} attachment(s)
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Privilege & Legal */}
            {activeTab === 'privilege' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-[#262626] bg-[#141414] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373]">Privilege Classification:</span>
                    <span className="font-medium text-[#F5F5F5] capitalize">
                      {selected.privilege_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373]">Confidentiality Tier:</span>
                    <span className="font-medium text-[#F5F5F5] capitalize">
                      {selected.confidentiality_level.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373]">Subject to Legal Hold:</span>
                    <span className={`font-mono ${selected.legal_hold ? 'text-rose-400' : 'text-[#737373]'}`}>
                      {selected.legal_hold ? 'Yes (Preservation Active)' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373]">Redaction Required:</span>
                    <span className={`font-mono ${selected.redaction_required ? 'text-amber-400' : 'text-[#737373]'}`}>
                      {selected.redaction_required ? 'Yes (PII / Sensitive Content)' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373]">Review Status:</span>
                    <span className="font-medium text-[#F5F5F5] capitalize">
                      {selected.review_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {selected.communication_channel && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373]">Email Channel:</span>
                      <span className="font-mono text-[#F5F5F5]">
                        {selected.communication_channel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Tags & Venue */}
            {activeTab === 'tags' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-2">
                    Tagged Litigation Issues
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.issue_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded bg-[#191919] text-[#D4D4D4] font-mono text-[11px] border border-[#303030]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#262626]">
                  <h4 className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-1.5">
                    Matter Venue & Jurisdiction
                  </h4>
                  <p className="text-xs font-semibold text-[#F5F5F5]">{selected.jurisdiction}</p>
                  <p className="text-[11px] text-[#737373] mt-0.5 font-mono">Language: {selected.language.toUpperCase()}</p>
                </div>
              </div>
            )}

            {/* Tab 4: Raw JSON */}
            {activeTab === 'json' && (
              <div className="relative">
                <pre className="p-4 bg-[#080808] border border-[#262626] text-[#A3A3A3] rounded-lg text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}
