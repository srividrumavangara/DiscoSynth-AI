import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onRowClick,
  loading = false,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-[#111111] rounded-xl border border-[#262626] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-[#262626] bg-[#141414]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-[#737373]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#737373]">
                  <div className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2" />
                  <div className="text-xs">Loading records...</div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#737373]">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors text-[#D4D4D4] ${
                    onRowClick ? 'cursor-pointer hover:bg-[#191919]' : 'hover:bg-[#141414]'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="px-4 py-3 border-t border-[#262626] flex items-center justify-between bg-[#141414]">
          <span className="text-[11px] text-[#737373] font-mono">
            Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total.toLocaleString()} records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded border border-[#303030] text-[#A3A3A3] hover:text-white hover:bg-[#202020] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-mono px-2 text-[#F5F5F5]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-[#303030] text-[#A3A3A3] hover:text-white hover:bg-[#202020] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
