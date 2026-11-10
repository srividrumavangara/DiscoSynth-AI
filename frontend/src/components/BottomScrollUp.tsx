import { useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface BottomScrollUpProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function BottomScrollUp({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: BottomScrollUpProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end justify-center">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-t-2xl shadow-2xl border-t border-slate-200/80 flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Grab bar */}
        <div className="w-full flex justify-center pt-2">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
