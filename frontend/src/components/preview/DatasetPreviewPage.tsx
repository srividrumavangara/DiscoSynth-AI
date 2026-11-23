import React, { useState, useMemo } from 'react';
import {
  Search,
  Edit2,
  FileSpreadsheet,
  FileCode,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { DatasetDetail, DocumentMetadata } from '../../types';
import { Badge } from '../common/Badge';
import { RecordEditModal } from './RecordEditModal';
import { apiClient } from '../../api/client';

interface DatasetPreviewPageProps {
  dataset: DatasetDetail;
  onRefresh: () => void;
  onViewAnalytics: () => void;
}

export const DatasetPreviewPage: React.FC<DatasetPreviewPageProps> = ({
  dataset,
  onRefresh,
  onViewAnalytics
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPrivilege, setSelectedPrivilege] = useState<string>('All');
  const [selectedResponsiveness, setSelectedResponsiveness] = useState<string>('All');
  const [selectedConfidentiality, setSelectedConfidentiality] = useState<string>('All');

  const [sortField, setSortField] = useState<keyof DocumentMetadata>('doc_id');
  const [sortAsc, setSortAsc] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [editingRecord, setEditingRecord] = useState<DocumentMetadata | null>(null);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    dataset.records.forEach((r) => cats.add(r.doc_type));
    return ['All', ...Array.from(cats)];
  }, [dataset]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return dataset.records
      .filter((rec) => {
        const matchesSearch =
          searchTerm === '' ||
          rec.doc_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rec.sender && rec.sender.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCat = selectedCategory === 'All' || rec.doc_type === selectedCategory;
        const matchesPriv = selectedPrivilege === 'All' || rec.privilege_status === selectedPrivilege;
        const matchesResp =
          selectedResponsiveness === 'All' || rec.responsiveness === selectedResponsiveness;
        const matchesConf =
          selectedConfidentiality === 'All' || rec.confidentiality_level === selectedConfidentiality;

        return matchesSearch && matchesCat && matchesPriv && matchesResp && matchesConf;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [
    dataset.records,
    searchTerm,
    selectedCategory,
    selectedPrivilege,
    selectedResponsiveness,
    selectedConfidentiality,
    sortField,
    sortAsc
  ]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleSort = (field: keyof DocumentMetadata) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSaveRecord = async (docId: string, updated: Partial<DocumentMetadata>) => {
    await apiClient.updateRecord(dataset.dataset_id, docId, updated);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Info */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800/60">
                {dataset.dataset_id}
              </span>
              <Badge type="scenario" value={dataset.scenario_type} />
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synthetic Validated
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-2">{dataset.name}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{dataset.description}</p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={onViewAnalytics}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              View Analytics Charts
            </button>
            <a
              href={apiClient.getExportCsvUrl(dataset.dataset_id)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
            <a
              href={apiClient.getExportJsonUrl(dataset.dataset_id)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </a>
          </div>
        </div>

        {/* Model & Generation details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px]">Model:</span>
            <span className="text-white font-mono">{dataset.model_info?.model_name || 'Gemini'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Total Duration:</span>
            <span className="text-white font-mono">{dataset.model_info?.total_duration_sec}s</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Batches Generated:</span>
            <span className="text-white font-mono">{dataset.model_info?.batches_generated}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Document Count:</span>
            <span className="text-white font-mono">{dataset.document_count} records</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title, custodian, sender, doc ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Type: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Privilege Filter */}
          <div>
            <select
              value={selectedPrivilege}
              onChange={(e) => {
                setSelectedPrivilege(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">Privilege: All</option>
              <option value="Not Privileged">Not Privileged</option>
              <option value="Attorney-Client">Attorney-Client</option>
              <option value="Work Product">Work Product</option>
              <option value="Joint Defense">Joint Defense</option>
            </select>
          </div>

          {/* Responsiveness Filter */}
          <div>
            <select
              value={selectedResponsiveness}
              onChange={(e) => {
                setSelectedResponsiveness(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">Resp: All</option>
              <option value="Responsive">Responsive</option>
              <option value="Non-Responsive">Non-Responsive</option>
            </select>
          </div>

          {/* Confidentiality Filter */}
          <div>
            <select
              value={selectedConfidentiality}
              onChange={(e) => {
                setSelectedConfidentiality(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">Conf: All</option>
              <option value="Public">Public</option>
              <option value="Confidential">Confidential</option>
              <option value="Highly Confidential - Attorneys' Eyes Only">Eyes Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white">{filteredRecords.length}</strong> of{' '}
            {dataset.document_count} records
          </span>
          {(searchTerm ||
            selectedCategory !== 'All' ||
            selectedPrivilege !== 'All' ||
            selectedResponsiveness !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPrivilege('All');
                setSelectedResponsiveness('All');
                setCurrentPage(1);
              }}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Metadata Records Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
              <tr>
                <th
                  onClick={() => handleSort('doc_id')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Doc ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Title / Subject</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('doc_type')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('custodian')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Custodian</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('creation_date')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Privilege</th>
                <th className="py-3 px-4">Responsiveness</th>
                <th className="py-3 px-4">Issue Tags</th>
                <th className="py-3 px-4 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No documents match the current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => (
                  <tr key={rec.doc_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-400 whitespace-nowrap">
                      {rec.doc_id}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-white truncate" title={rec.title}>
                        {rec.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate" title={rec.filename}>
                        {rec.filename} ({rec.file_size_kb} KB)
                      </p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                        {rec.doc_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate" title={rec.custodian}>
                      <span className="text-slate-200">{rec.custodian}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {rec.creation_date.substring(0, 10)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <Badge type="privilege" value={rec.privilege_status} />
                        {rec.privilege_basis && (
                          <p
                            className="text-[9px] text-amber-400/80 truncate max-w-[130px] mt-0.5"
                            title={rec.privilege_basis}
                          >
                            {rec.privilege_basis}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge type="responsiveness" value={rec.responsiveness} />
                    </td>
                    <td className="py-3 px-4 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {rec.issue_tags?.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700/60 truncate"
                          >
                            {t}
                          </span>
                        ))}
                        {rec.issue_tags?.length > 2 && (
                          <span className="text-[10px] text-slate-500">
                            +{rec.issue_tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingRecord(rec)}
                        title="Edit Record"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-300 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Edit Modal */}
      <RecordEditModal
        record={editingRecord}
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveRecord}
      />
    </div>
  );
};
