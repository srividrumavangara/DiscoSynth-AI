import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0e0e0e] text-[#F5F5F5] rounded-t-2xl shadow-2xl border-t border-x border-[#262626] flex flex-col z-10 duration-300">
        {/* Grab bar */}
        <div className="w-full flex justify-center pt-2">
          <div className="w-12 h-1 rounded-full bg-[#303030]" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F5]">{title}</h2>
            {subtitle && <p className="text-[11px] text-[#737373] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#202020] rounded-md transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
