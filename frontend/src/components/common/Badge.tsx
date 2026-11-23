import React from 'react';

interface BadgeProps {
  type: 'privilege' | 'responsiveness' | 'confidentiality' | 'scenario' | 'generic';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let colorStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'privilege') {
    if (value === 'Attorney-Client') {
      colorStyle = 'bg-amber-950/70 text-amber-300 border-amber-800/60';
    } else if (value === 'Work Product' || value === 'Joint Defense') {
      colorStyle = 'bg-purple-950/70 text-purple-300 border-purple-800/60';
    } else {
      colorStyle = 'bg-slate-800/80 text-slate-400 border-slate-700';
    }
  } else if (type === 'responsiveness') {
    if (value === 'Responsive') {
      colorStyle = 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    } else {
      colorStyle = 'bg-rose-950/60 text-rose-300 border-rose-800/50';
    }
  } else if (type === 'confidentiality') {
    if (value.toLowerCase().includes('highly') || value.toLowerCase().includes('eyes only')) {
      colorStyle = 'bg-red-950/70 text-red-300 border-red-800/60';
    } else if (value.toLowerCase().includes('confidential')) {
      colorStyle = 'bg-amber-950/60 text-amber-300 border-amber-800/50';
    } else {
      colorStyle = 'bg-blue-950/60 text-blue-300 border-blue-800/50';
    }
  } else if (type === 'scenario') {
    colorStyle = 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyle} ${className}`}
    >
      {value}
    </span>
  );
};
