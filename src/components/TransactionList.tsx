import { useState, useMemo } from 'react';
import { AlertTriangle, Loader2, Brain, CheckCircle2 } from 'lucide-react';
import { analyzeTransaction } from '../services/aiAnalysis';
import AiModal from './AiModal';
import TypologyChips from './TypologyChips';
import { classifyTransaction } from '../services/typology';
import { useToast } from './Toast';
import { recordEvent } from '../services/userActivity';
import type { SupabaseTransaction, Investigation } from '../types';

// Re-export for backwards compat with imports elsewhere
export type { SupabaseTransaction } from '../types';

interface TransactionListProps {
  transactions: SupabaseTransaction[];
  investigations: Investigation[];
  onInvestigated: () => void;
  onInspectAccount?: (account: string) => void;
}

interface ModalState {
  transaction: SupabaseTransaction;
  summary: string;
}

export default function TransactionList({
  transactions,
  investigations,
  onInvestigated,
  onInspectAccount,
}: TransactionListProps) {
  const toast = useToast();
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  // Map of transaction_id -> latest investigation (for "Reviewed" badge)
  const investigatedMap = useMemo(() => {
    const m = new Map<number, Investigation>();
    for (const inv of investigations) {
      const existing = m.get(inv.transaction_id);
      if (
        !existing ||
        (inv.created_at && existing.created_at && inv.created_at > existing.created_at) ||
        (!existing.created_at && inv.created_at)
      ) {
        m.set(inv.transaction_id, inv);
      }
    }
    return m;
  }, [investigations]);

  async function handleAnalyze(tx: SupabaseTransaction) {
    setAnalyzingId(tx.id);
    try {
      const summary = await analyzeTransaction(tx);
      setModal({ transaction: tx, summary });
      onInvestigated();
      recordEvent('transaction_investigated', {
        tx_id: tx.id,
        risk_score: tx.risk_score,
        amount: tx.amount,
        currency: tx.currency,
      });
      toast.success(`Investigation opened for #${tx.id}`, 'Audit event logged. Review summary in the modal.');
    } catch (err: any) {
      toast.error('AI analysis failed', err?.message || 'See console for details.');
    } finally {
      setAnalyzingId(null);
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center card-shadow">
        <p className="text-slate-600">No transactions match the current filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl bg-white card-shadow">
        <table className="w-full text-sm text-left border-separate border-spacing-0">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <tr>
              <th className="px-4 py-3 border-b border-slate-200">ID</th>
              <th className="px-4 py-3 border-b border-slate-200">Type</th>
              <th className="px-4 py-3 border-b border-slate-200">Sender</th>
              <th className="px-4 py-3 border-b border-slate-200">Receiver</th>
              <th className="px-4 py-3 border-b border-slate-200 text-right">Amount</th>
              <th className="px-4 py-3 border-b border-slate-200">Currency</th>
              <th className="px-4 py-3 border-b border-slate-200">Date</th>
              <th className="px-4 py-3 border-b border-slate-200 text-center">Risk</th>
              <th className="px-4 py-3 border-b border-slate-200 text-center">Flagged</th>
              {/* Sticky right column so the Investigate action is always visible */}
              <th className="px-4 py-3 border-b border-slate-200 text-center sticky right-0 bg-slate-50 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.08)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const reviewed = investigatedMap.get(tx.id);
              const rowBg = reviewed
                ? 'bg-slate-50/60'
                : tx.is_flagged
                ? 'bg-red-50/40'
                : 'bg-white';
              return (
                <tr
                  key={tx.id}
                  className={`group transition-colors hover:bg-slate-50 ${rowBg} ${
                    tx.is_flagged && !reviewed ? 'border-l-2 border-l-red-500' : ''
                  }`}
                >
                  <td className={`px-4 py-3 font-mono text-blue-700 font-semibold border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {tx.id}
                  </td>
                  <td className={`px-4 py-3 text-slate-700 capitalize border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {tx.transaction_type}
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {onInspectAccount ? (
                      <button
                        onClick={() => onInspectAccount(tx.sender_account)}
                        className="text-blue-700 hover:text-blue-900 hover:underline font-medium text-left"
                        title="View customer risk profile"
                      >
                        {tx.sender_account}
                      </button>
                    ) : (
                      <span className="text-slate-600">{tx.sender_account}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {onInspectAccount ? (
                      <button
                        onClick={() => onInspectAccount(tx.receiver_account)}
                        className="text-blue-700 hover:text-blue-900 hover:underline font-medium text-left"
                        title="View customer risk profile"
                      >
                        {tx.receiver_account}
                      </button>
                    ) : (
                      <span className="text-slate-600">{tx.receiver_account}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold text-slate-900 border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 text-slate-600 font-medium border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {tx.currency}
                  </td>
                  <td className={`px-4 py-3 text-slate-500 whitespace-nowrap border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {formatDate(tx.transaction_date)}
                  </td>
                  <td className={`px-4 py-3 text-center border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    <span className={`font-bold ${getRiskColor(tx.risk_score)}`}>{tx.risk_score}</span>
                    <div className="mt-1 flex justify-center">
                      <TypologyChips typologies={classifyTransaction(tx)} size="xs" />
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-center border-b border-slate-100 ${reviewed ? 'opacity-70' : ''}`}>
                    {tx.is_flagged ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No</span>
                    )}
                  </td>
                  {/* Sticky right action column */}
                  <td
                    className={`px-4 py-3 text-center border-b border-slate-100 sticky right-0 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.08)] ${
                      reviewed ? 'bg-slate-50/95' : tx.is_flagged ? 'bg-red-50/60' : 'bg-white'
                    } group-hover:bg-slate-50`}
                  >
                    {reviewed ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reviewed
                        </span>
                        <button
                          onClick={() => handleAnalyze(tx)}
                          disabled={analyzingId === tx.id}
                          className="text-[11px] text-blue-700 hover:text-blue-900 hover:underline font-medium disabled:opacity-50"
                        >
                          {analyzingId === tx.id ? 'Re-analyzing…' : 'Re-investigate'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAnalyze(tx)}
                        disabled={analyzingId === tx.id}
                        title="Run AI investigation to assess fraud risk"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white primary-shadow hover:-translate-y-0.5"
                      >
                        {analyzingId === tx.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…
                          </>
                        ) : (
                          <>
                            <Brain className="w-3.5 h-3.5" /> Investigate
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <AiModal
          transaction={modal.transaction}
          summary={modal.summary}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
