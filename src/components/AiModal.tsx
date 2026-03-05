import { X, Brain, ShieldAlert } from 'lucide-react';
import type { SupabaseTransaction } from './TransactionList';

interface AiModalProps {
  transaction: SupabaseTransaction;
  summary: string;
  onClose: () => void;
}

export default function AiModal({ transaction, summary, onClose }: AiModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Investigation Summary</h3>
              <p className="text-slate-400 text-xs">Transaction #{transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction details bar */}
        <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-700/50 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Sender</span>
            <p className="text-slate-300 font-mono mt-0.5">{transaction.sender_account}</p>
          </div>
          <div>
            <span className="text-slate-500">Receiver</span>
            <p className="text-slate-300 font-mono mt-0.5">{transaction.receiver_account}</p>
          </div>
          <div>
            <span className="text-slate-500">Amount</span>
            <p className="text-white font-semibold mt-0.5">
              {transaction.amount.toLocaleString()} {transaction.currency}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Risk Score</span>
            <p className={`font-bold mt-0.5 ${transaction.risk_score >= 80 ? 'text-red-400' : transaction.risk_score >= 60 ? 'text-orange-400' : 'text-green-400'}`}>
              {transaction.risk_score}/100
            </p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
