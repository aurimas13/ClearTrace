import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function StatsCards() {
  const stats = [
    {
      label: 'Active Alerts',
      value: '23',
      change: '+12%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
    },
    {
      label: 'Investigations',
      value: '8',
      change: '+3 new',
      trend: 'up',
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
    },
    {
      label: 'Resolved Cases',
      value: '142',
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
    },
    {
      label: 'Total Volume',
      value: '$8.2M',
      change: '+24%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:bg-slate-800 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${stat.bgColor} ${stat.textColor}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
