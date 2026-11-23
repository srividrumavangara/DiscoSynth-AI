import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  subMessage,
  size = 'md'
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`${iconSizes[size]} text-indigo-400 animate-spin mb-4`} />
      <p className="text-sm font-medium text-slate-200">{message}</p>
      {subMessage && (
        <p className="text-xs text-slate-400 mt-1 max-w-md">{subMessage}</p>
      )}
    </div>
  );
};
