import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Search, X, Eye } from 'lucide-react';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getDatasets, getDataset, getDatasetRecords, getExportUrl } from '../api/client';
import type { Dataset, DocumentMetadata, PaginatedResponse } from '../types';

export default function DatasetExplorer() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();

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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Dataset Explorer</h1>
      {datasets.length === 0 ? (
        <EmptyState
          title="No datasets available"
          description="Generate a dataset first to explore its records."
          action={
            <Link to="/generate" className="px-5 py-2.5 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-700">
              Generate Dataset
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => navigate(`/explorer/${ds.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:border-accent-300 transition-colors"
            >
              <h3 className="font-semibold text-navy-800 mb-2">{ds.name}</h3>
              <p className="text-sm text-gray-500 capitalize mb-1">{ds.scenario.replace(/_/g, ' ')}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{ds.num_records.toLocaleString()} records</span>
                <span>Quality: {ds.quality_score ? `${ds.quality_score}%` : '—'}</span>
              </div>
            </button>
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

  if (loading) return <LoadingSpinner />;
  if (!dataset) return <EmptyState title="Dataset not found" description="This dataset does not exist." />;

  const columns = [
    { key: 'document_id', header: 'Document ID' },
    { key: 'document_type', header: 'Type', render: (r: DocumentMetadata) => <span className="capitalize">{r.document_type.replace(/_/g, ' ')}</span> },
    { key: 'fictional_custodian_name', header: 'Custodian' },
    { key: 'fictional_organization', header: 'Organization' },
    { key: 'date_created', header: 'Created', render: (r: DocumentMetadata) => new Date(r.date_created).toLocaleDateString() },
    {
      key: 'responsive', header: 'Responsive',
      render: (r: DocumentMetadata) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.responsive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {r.responsive ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'privilege_status', header: 'Privilege',
      render: (r: DocumentMetadata) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          r.privilege_status === 'privileged' ? 'bg-red-100 text-red-700' :
          r.privilege_status === 'partially_privileged' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {r.privilege_status.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'confidentiality_level', header: 'Confidentiality',
      render: (r: DocumentMetadata) => <span className="capitalize text-xs">{r.confidentiality_level.replace(/_/g, ' ')}</span>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">{dataset.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="capitalize">{dataset.scenario.replace(/_/g, ' ')}</span>
            <span>{dataset.num_records.toLocaleString()} records</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dataset.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{dataset.status}</span>
            {dataset.quality_score && <span>Quality: {dataset.quality_score}%</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={getExportUrl(datasetId, 'csv')} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" /> CSV
          </a>
          <a href={getExportUrl(datasetId, 'json')} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" /> JSON
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </div>
        <select value={docTypeFilter} onChange={(e) => { setDocTypeFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">All Types</option>
          {['email','pdf','docx','xlsx','internal_memo','financial_report','contract'].map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={responsiveFilter} onChange={(e) => { setResponsiveFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">All Responsive</option>
          <option value="true">Responsive</option>
          <option value="false">Non-Responsive</option>
        </select>
        <select value={privilegeFilter} onChange={(e) => { setPrivilegeFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">All Privilege</option>
          <option value="privileged">Privileged</option>
          <option value="not_privileged">Not Privileged</option>
          <option value="partially_privileged">Partially Privileged</option>
        </select>
      </div>

      {/* Table */}
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

      {/* Record Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-800 flex items-center gap-2">
                <Eye className="h-5 w-5" /> Record Detail
              </h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(selected).map(([key, value]) => (
                <div key={key} className="border-b border-gray-50 pb-2">
                  <span className="text-xs text-gray-400 block">{key}</span>
                  <span className="text-gray-700">{Array.isArray(value) ? value.join(', ') : String(value ?? '—')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
