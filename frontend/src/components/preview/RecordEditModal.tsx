import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { DocumentMetadata } from '../../types';

interface RecordEditModalProps {
  record: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (docId: string, updatedFields: Partial<DocumentMetadata>) => Promise<void>;
}

export const RecordEditModal: React.FC<RecordEditModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !record) return null;

  const [title, setTitle] = useState(record.title);
  const [docType, setDocType] = useState(record.doc_type);
  const [custodian, setCustodian] = useState(record.custodian);
  const [confidentiality, setConfidentiality] = useState(record.confidentiality_level);
  const [privilege, setPrivilege] = useState(record.privilege_status);
  const [privilegeBasis, setPrivilegeBasis] = useState(record.privilege_basis || '');
  const [responsiveness, setResponsiveness] = useState(record.responsiveness);
  const [issueTagsStr, setIssueTagsStr] = useState(record.issue_tags.join(', '));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = issueTagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave(record.doc_id, {
        title,
        doc_type: docType,
        custodian,
        confidentiality_level: confidentiality,
        privilege_status: privilege,
        privilege_basis: privilege !== 'Not Privileged' ? privilegeBasis : null,
        responsiveness,
        issue_tags: tags
      });
      onClose();
    } catch (err) {
      alert('Failed to update record: ' + err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 font-bold block">
              {record.doc_id}
            </span>
            <h2 className="text-sm font-bold text-white mt-0.5">Edit Metadata Record</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Filename & Creation Date (Readonly) */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Filename:</span>
              <span className="font-mono text-slate-300 truncate block">{record.filename}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Created Date:</span>
              <span className="font-mono text-slate-300">{record.creation_date}</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="font-medium text-slate-300">Document Title / Subject</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Custodian & Doc Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-slate-300">Custodian</label>
              <input
                type="text"
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-slate-300">Document Type</label>
              <input
                type="text"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Privilege Status & Basis */}
          <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-300">Privilege Status</label>
                <select
                  value={privilege}
                  onChange={(e) => setPrivilege(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Not Privileged">Not Privileged</option>
                  <option value="Attorney-Client">Attorney-Client</option>
                  <option value="Work Product">Work Product</option>
                  <option value="Joint Defense">Joint Defense</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">Responsiveness</label>
                <select
                  value={responsiveness}
                  onChange={(e) => setResponsiveness(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Responsive">Responsive</option>
                  <option value="Non-Responsive">Non-Responsive</option>
                </select>
              </div>
            </div>

            {privilege !== 'Not Privileged' && (
              <div className="space-y-1 pt-1">
                <label className="font-medium text-amber-300">Privilege Basis / Justification</label>
                <input
                  type="text"
                  value={privilegeBasis}
                  onChange={(e) => setPrivilegeBasis(e.target.value)}
                  placeholder="e.g. Legal advice provided by outside counsel regarding restatement risks"
                  className="w-full bg-slate-950 border border-amber-900/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Confidentiality & Tags */}
          <div className="space-y-1">
            <label className="font-medium text-slate-300">Confidentiality Level</label>
            <select
              value={confidentiality}
              onChange={(e) => setConfidentiality(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Public">Public</option>
              <option value="Confidential">Confidential</option>
              <option value="Highly Confidential - Attorneys' Eyes Only">
                Highly Confidential - Attorneys' Eyes Only
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-300">Issue Tags (Comma separated)</label>
            <input
              type="text"
              value={issueTagsStr}
              onChange={(e) => setIssueTagsStr(e.target.value)}
              placeholder="e.g. Audit Finding, Q3 Restatement, Executive Knowledge"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
