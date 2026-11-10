import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
  actions?: React.ReactNode;
}

export default function SlideOver({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-xl',
  actions,
}: SlideOverProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={`w-screen ${width} bg-white shadow-2xl border-l border-slate-200/80 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0 animate-in slide-in-from-right`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
