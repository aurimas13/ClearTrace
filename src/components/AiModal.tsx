import { X, Brain, ShieldAlert, Shield } from 'lucide-react';
import type { SupabaseTransaction } from './TransactionList';
import SanctionsPanel from './SanctionsPanel';

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
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col bg-white border border-rule-strong rounded-none shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule-strong bg-paper-deep">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-ink font-semibold text-sm">Investigation Summary</h3>
              <p className="text-ink-mute text-xs">Transaction #{transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-mute hover:text-ink hover:bg-paper-deep transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction details bar */}
        <div className="px-6 py-4 bg-white border-b border-rule-strong grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-ink-mute font-medium">Sender</span>
            <p className="text-ink font-mono mt-0.5">{transaction.sender_account}</p>
          </div>
          <div>
            <span className="text-ink-mute font-medium">Receiver</span>
            <p className="text-ink font-mono mt-0.5">{transaction.receiver_account}</p>
          </div>
          <div>
            <span className="text-ink-mute font-medium">Amount</span>
            <p className="text-ink font-semibold mt-0.5">
              {transaction.amount.toLocaleString()} {transaction.currency}
            </p>
          </div>
          <div>
            <span className="text-ink-mute font-medium">Risk Score</span>
            <p className={`font-bold mt-0.5 ${transaction.risk_score >= 80 ? 'text-red-600' : transaction.risk_score >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {transaction.risk_score}/100
            </p>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Summary */}
          <div className="px-6 py-5 bg-gradient-to-b from-amber-50/60 to-white">
            <div className="text-xs uppercase tracking-wider font-bold text-ink-soft mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              AI Investigation Summary
            </div>
            <p className="text-ink-soft text-sm leading-relaxed">{summary}</p>
          </div>

          {/* Sanctions screening */}
          <div className="px-6 py-5 border-t border-rule-strong">
            <div className="text-xs uppercase tracking-wider font-bold text-ink-soft mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-vermillion" />
              Sanctions &amp; Watchlist Screening
            </div>
            <SanctionsPanel
              senderAccount={transaction.sender_account}
              receiverAccount={transaction.receiver_account}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-rule-strong bg-paper-deep flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-white border border-rule-strong hover:bg-paper-deep text-ink-soft font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
