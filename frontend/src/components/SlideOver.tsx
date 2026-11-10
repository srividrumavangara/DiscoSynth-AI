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
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={`w-screen ${width} bg-[#0e0e0e] text-[#F5F5F5] shadow-2xl border-l border-[#262626] flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#262626] bg-[#141414] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F5] tracking-tight">{title}</h2>
              {subtitle && <p className="text-[11px] text-[#737373] mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
                onClick={onClose}
                className="p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#202020] rounded-md transition-colors"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
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
