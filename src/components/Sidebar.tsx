import { AlertTriangle, FileSearch, Database, ExternalLink } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'investigations', label: 'Investigations', icon: FileSearch },
    { id: 'pipelines', label: 'Data Pipelines', icon: Database },
  ];

  return (
    <div className="w-64 bg-[#0a0a12]/80 backdrop-blur-sm border-r border-white/5 h-screen flex flex-col">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <FileSearch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">ClearTrace</h1>
            <p className="text-slate-400 text-xs">Intelligence Suite</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-300' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-white font-medium">All Systems Operational</span>
          </div>
        </div>
        <a
          href="https://aurimas.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors py-1"
        >
          <ExternalLink className="w-3 h-3" />
          Back to aurimas.io
        </a>
      </div>
    </div>
  );
}
