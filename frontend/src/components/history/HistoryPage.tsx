import React, { useState } from 'react';
import {
  History,
  FileSpreadsheet,
  FileCode,
  Eye,
  Trash2,
  CheckCircle2,
  Search
} from 'lucide-react';
import { DatasetSummary } from '../../types';
import { Badge } from '../common/Badge';
import { apiClient } from '../../api/client';

interface HistoryPageProps {
  datasets: DatasetSummary[];
  onSelectDataset: (id: string) => void;
  onRefresh: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  datasets,
  onSelectDataset,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('All');

  const filtered = datasets.filter((ds) => {
    const matchesSearch =
      ds.dataset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.scenario_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScenario = selectedScenario === 'All' || ds.scenario_type === selectedScenario;
    return matchesSearch && matchesScenario;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Permanently delete dataset ${id}?`)) {
      try {
        await apiClient.deleteDataset(id);
        onRefresh();
      } catch (err) {
        alert('Failed to delete dataset: ' + err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-400" />
          Generation History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, open, export, or manage previously generated synthetic litigation metadata sets.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative md:col-span-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by dataset ID, case name, or scenario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Scenarios</option>
            <option value="Corporate Fraud">Corporate Fraud</option>
            <option value="Intellectual Property Dispute">Intellectual Property Dispute</option>
            <option value="Employment Litigation">Employment Litigation</option>
            <option value="Contract Dispute">Contract Dispute</option>
            <option value="Financial Misconduct">Financial Misconduct</option>
            <option value="Regulatory Investigation">Regulatory Investigation</option>
          </select>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No datasets found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Dataset ID</th>
                  <th className="py-3 px-4">Case Title</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Generated Date</th>
                  <th className="py-3 px-4">Validation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((ds) => (
                  <tr
                    key={ds.dataset_id}
                    onClick={() => onSelectDataset(ds.dataset_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-400 whitespace-nowrap">
                      {ds.dataset_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white max-w-sm truncate">
                      {ds.name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge type="scenario" value={ds.scenario_type} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {ds.document_count} records
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(ds.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ds.validation_status?.is_valid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-medium">
                          {ds.validation_status?.error_count} warnings
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        title="View Preview"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDataset(ds.dataset_id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        title="Download CSV"
                        href={apiClient.getExportCsvUrl(ds.dataset_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </a>
                      <a
                        title="Download JSON"
                        href={apiClient.getExportJsonUrl(ds.dataset_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                      </a>
                      <button
                        title="Delete"
                        onClick={(e) => handleDelete(ds.dataset_id, e)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
