import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
}

export default function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-[#111111] rounded-xl border border-[#262626] p-5 shadow-sm hover:border-[#333333] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-1.5">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-[#F5F5F5]">{value}</p>
          {subtitle && <p className="text-xs text-[#737373] mt-1.5">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1.5 font-mono ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-[#191919] border border-[#303030] text-[#A3A3A3]">
          {icon}
        </div>
      </div>
    </div>
  );
}
