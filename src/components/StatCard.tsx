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
    <div className="group bg-white rounded-2xl p-6 card-shadow hover:card-shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
          <Icon className="w-6 h-6 text-blue-700" />
        </div>
        {change && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              trend === 'up' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <h3 className="text-slate-600 text-sm mb-1 font-medium">{title}</h3>
      <p className="text-slate-900 text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
