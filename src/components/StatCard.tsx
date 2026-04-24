import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

export default function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="relative group bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 rounded-xl">
          <Icon className="w-6 h-6 text-indigo-300" />
        </div>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend === 'up' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="relative text-slate-400 text-sm mb-1 font-medium">{title}</h3>
      <p className="relative text-white text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
