import { Network, Zap } from 'lucide-react';

export default function NetworkGraph() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 h-[500px] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full flex items-center justify-center border-2 border-blue-600/30">
            <Network className="w-12 h-12 text-blue-400" />
          </div>
          <div className="absolute top-0 right-1/3 w-16 h-16 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full border border-cyan-600/30 flex items-center justify-center">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute bottom-0 left-1/3 w-16 h-16 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-600/30 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
            <line x1="50%" y1="50%" x2="65%" y2="20%" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
            <line x1="50%" y1="50%" x2="35%" y2="80%" stroke="#06b6d4" strokeWidth="2" opacity="0.3" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">Transaction Network Graph</h3>
        <p className="text-slate-400 mb-4 max-w-md mx-auto">
          Interactive network visualization showing relationships between flagged accounts and transaction flows
        </p>

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-400">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-slate-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-400">Low Risk</span>
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/30 rounded-lg text-blue-400 text-sm">
          <Zap className="w-4 h-4" />
          <span>Graph analytics powered by AI</span>
        </div>
      </div>
    </div>
  );
}
