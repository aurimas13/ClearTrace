import { AlertTriangle, FileSearch, Database, ExternalLink } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    alerts?: number;
    investigations?: number;
    pipelines?: number;
  };
}

export default function Sidebar({ activeTab, onTabChange, counts }: SidebarProps) {
  const menuItems = [
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, count: counts?.alerts },
    { id: 'investigations', label: 'Investigations', icon: FileSearch, count: counts?.investigations },
    { id: 'pipelines', label: 'Data Pipelines', icon: Database, count: counts?.pipelines },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
            <FileSearch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 font-bold text-lg tracking-tight">ClearTrace</h1>
            <p className="text-slate-500 text-xs">Intelligence Suite</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1.5 font-medium">System Status</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-slate-900 font-semibold">All Systems Operational</span>
          </div>
        </div>
        <a
          href="https://aurimas.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors py-1"
        >
          <ExternalLink className="w-3 h-3" />
          Back to aurimas.io
        </a>
      </div>
    </div>
  );
}
