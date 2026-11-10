import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download,
  Search,
  Copy,
  Check,
  Eye,
  FileCode,
  Shield,
  Layers,
  ChevronRight,
  Database,
  SlidersHorizontal,
} from 'lucide-react';
import DataTable, { type Column } from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SlideOver from '../components/SlideOver';
import { getDatasets, getDataset, getDatasetRecords, getExportUrl } from '../api/client';
import type { Dataset, DocumentMetadata, PaginatedResponse } from '../types';

export default function DatasetExplorer() {
  const { datasetId } = useParams<{ datasetId: string }>();
  if (!datasetId) return <DatasetPicker />;
  return <DatasetView datasetId={datasetId} />;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dataset Explorer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select a litigation metadata dataset to inspect records, document families, and privilege logs.
        </p>
      </div>

      {datasets.length === 0 ? (
        <EmptyState
          title="No completed datasets available"
          description="Generate your first synthetic litigation matter to browse records."
          action={
            <Link
              to="/generate"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
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
              onClick={() => navigate(`/explorer/${ds.id}`)}
              className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-5 text-left hover:border-violet-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {ds.scenario.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {ds.quality_score}% Quality
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors text-sm">
                  {ds.name}
                </h3>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{ds.num_records.toLocaleString()} records</span>
                <span className="font-medium text-violet-600 flex items-center gap-1">
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
        <span className="font-mono text-xs font-semibold text-slate-800 hover:text-violet-600">
          {r.document_id}
        </span>
      ),
    },
    {
      key: 'document_type',
      header: 'Document Type',
      render: (r) => (
        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
          {r.document_type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'fictional_custodian_name',
      header: 'Custodian / Role',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{r.fictional_custodian_name}</p>
          <p className="text-[10px] text-slate-400 capitalize">{r.custodian_role.replace(/_/g, ' ')}</p>
        </div>
      ),
    },
    {
      key: 'date_created',
      header: 'Date Created',
      render: (r) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(r.date_created).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'responsive',
      header: 'Responsive',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            r.responsive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
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
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            r.privilege_status === 'privileged'
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : r.privilege_status === 'partially_privileged'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-slate-100 text-slate-600'
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
        <span className="text-[11px] text-slate-600 font-medium capitalize">
          {r.confidentiality_level.replace(/_/g, ' ')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {dataset.scenario.replace(/_/g, ' ')}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              {dataset.num_records.toLocaleString()} total documents
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{dataset.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getExportUrl(datasetId, 'csv')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </a>
          <a
            href={getExportUrl(datasetId, 'json')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </a>
          <Link
            to={`/analytics/${datasetId}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-violet-400" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Document ID, Custodian Name, Organization..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <select
          value={docTypeFilter}
          onChange={(e) => {
            setDocTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
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
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
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
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
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

      {/* Figma-Style Side Inspector Drawer for Selected Record */}
      <SlideOver
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.document_id || 'Document Metadata'}
        subtitle={`Case ID: ${selected?.case_id}`}
        width="max-w-2xl"
        actions={
          <button
            onClick={copyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Copy Record'}</span>
          </button>
        }
      >
        {selected && (
          <div className="space-y-6">
            {/* Quick Status Pills Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-800">
                {selected.file_type} ({selected.file_size_kb} KB)
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  selected.responsive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {selected.responsive ? 'Responsive' : 'Non-Responsive'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  selected.privilege_status === 'privileged'
                    ? 'bg-rose-100 text-rose-800'
                    : selected.privilege_status === 'partially_privileged'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {selected.privilege_status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Figma-Style Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-medium">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'privilege', label: 'Privilege & Legal' },
                { id: 'tags', label: 'Issue Tags & Venue' },
                { id: 'json', label: 'Raw JSON Payload' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'border-violet-600 text-violet-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Custodian</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {selected.fictional_custodian_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Custodian Role</span>
                    <span className="font-medium text-slate-700 capitalize">
                      {selected.custodian_role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fictional Entity</span>
                    <span className="font-medium text-slate-800">{selected.fictional_organization}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Document Type</span>
                    <span className="font-medium text-slate-800 capitalize">
                      {selected.document_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date Created</span>
                    <span className="font-mono text-slate-700">
                      {new Date(selected.date_created).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date Modified</span>
                    <span className="font-mono text-slate-700">
                      {new Date(selected.date_modified).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-violet-600" />
                    <span className="font-semibold text-violet-900">Document Family:</span>
                    <span className="font-mono text-violet-700">
                      {selected.document_family_id || 'Standalone Document'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-violet-800">
                    {selected.attachment_count} attachment(s)
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Privilege & Legal */}
            {activeTab === 'privilege' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Privilege Classification:</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {selected.privilege_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Confidentiality Tier:</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {selected.confidentiality_level.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subject to Legal Hold:</span>
                    <span className={`font-semibold ${selected.legal_hold ? 'text-rose-600' : 'text-slate-600'}`}>
                      {selected.legal_hold ? 'Yes (Preservation Required)' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Redaction Required:</span>
                    <span className={`font-semibold ${selected.redaction_required ? 'text-amber-700' : 'text-slate-600'}`}>
                      {selected.redaction_required ? 'Yes (PII/Privileged Content)' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Review Workflow Status:</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {selected.review_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {selected.communication_channel && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email Channel:</span>
                      <span className="font-mono font-semibold text-slate-800">
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
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Tagged Litigation Issues
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.issue_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Matter Venue & Jurisdiction
                  </h4>
                  <p className="text-sm font-semibold text-slate-800">{selected.jurisdiction}</p>
                  <p className="text-xs text-slate-400 mt-1">Language: {selected.language.toUpperCase()}</p>
                </div>
              </div>
            )}

            {/* Tab 4: Raw JSON */}
            {activeTab === 'json' && (
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
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
