import { Network, Users, ArrowRight } from 'lucide-react';

export default function NetworkGraph() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Transaction Network</h3>
          <p className="text-sm text-slate-400">Entity relationship visualization</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">12 entities • 28 connections</span>
        </div>
      </div>

      <div className="relative bg-slate-900 rounded-lg border border-slate-700 h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>

        <div className="relative z-10 grid grid-cols-3 gap-8 w-full h-full p-8">
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-slate-900 shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A1</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-4 border-slate-900 shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A2</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-4 border-slate-900 shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A3</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-4 border-slate-900 shadow-lg shadow-red-500/30 flex items-center justify-center animate-pulse">
                <span className="text-white font-bold">HUB</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-4 border-slate-900 shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">B1</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 border-4 border-slate-900 shadow-lg shadow-orange-500/30 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B2</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-4 border-slate-900 shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">B3</span>
            </div>
          </div>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <line x1="30%" y1="30%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="30%" y1="50%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="30%" y1="70%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="70%" y1="30%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="70%" y1="50%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="70%" y1="70%" x2="50%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
        </svg>

        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Source Account</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">Flagged Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-400">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <span className="text-slate-400">Related Entity</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Network Depth</span>
          </div>
          <p className="text-2xl font-bold text-white">3 levels</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Transactions</span>
          </div>
          <p className="text-2xl font-bold text-white">$2.4M</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">Connected Entities</span>
          </div>
          <p className="text-2xl font-bold text-white">12</p>
        </div>
      </div>
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
