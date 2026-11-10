import type { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-[#555]">
        {icon || <FileQuestion className="h-12 w-12 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-[#F5F5F5] mb-1.5">{title}</h3>
      <p className="text-xs text-[#737373] max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
