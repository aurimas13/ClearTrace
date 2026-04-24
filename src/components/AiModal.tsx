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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-slate-900 font-semibold text-sm">Investigation Summary</h3>
              <p className="text-slate-500 text-xs">Transaction #{transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction details bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Sender</span>
            <p className="text-slate-900 font-mono mt-0.5">{transaction.sender_account}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Receiver</span>
            <p className="text-slate-900 font-mono mt-0.5">{transaction.receiver_account}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Amount</span>
            <p className="text-slate-900 font-semibold mt-0.5">
              {transaction.amount.toLocaleString()} {transaction.currency}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Risk Score</span>
            <p className={`font-bold mt-0.5 ${transaction.risk_score >= 80 ? 'text-red-600' : transaction.risk_score >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {transaction.risk_score}/100
            </p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="px-6 py-5 bg-gradient-to-b from-amber-50/60 to-white">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-slate-700 text-sm leading-relaxed">{summary}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
