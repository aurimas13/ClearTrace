import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Brain } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { analyzeTransaction } from '../services/aiAnalysis';
import AiModal from './AiModal';

export interface SupabaseTransaction {
  id: number;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency: string;
  transaction_date: string;
  risk_score: number;
  is_flagged: boolean;
  transaction_type: string;
}

interface TransactionListProps {
  transactions?: SupabaseTransaction[];
}

interface ModalState {
  transaction: SupabaseTransaction;
  summary: string;
}

export default function TransactionList({ transactions: propTransactions }: TransactionListProps) {
  const [transactions, setTransactions] = useState<SupabaseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  async function handleAnalyze(tx: SupabaseTransaction) {
    setAnalyzingId(tx.id);
    try {
      const summary = await analyzeTransaction(tx);
      setModal({ transaction: tx, summary });
    } catch (err: any) {
      alert('AI analysis failed: ' + err.message);
    } finally {
      setAnalyzingId(null);
    }
  }

  useEffect(() => {
    if (propTransactions) {
      setTransactions(propTransactions);
      setLoading(false);
      return;
    }
    fetchTransactions();
  }, [propTransactions]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading transactions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold">Failed to load transactions</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center card-shadow">
        <p className="text-slate-600">No transactions found.</p>
      </div>
    );
  }

  return (
  <>
    <div className="overflow-x-auto rounded-2xl bg-white card-shadow">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Sender</th>
            <th className="px-4 py-3">Receiver</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3">Currency</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-center">Risk</th>
            <th className="px-4 py-3 text-center">Flagged</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className={`transition-colors hover:bg-slate-50 ${
                tx.is_flagged
                  ? 'bg-red-50/40 border-l-2 border-l-red-500'
                  : 'bg-white'
              }`}
            >
              <td className="px-4 py-3 font-mono text-blue-700 font-semibold">{tx.id}</td>
              <td className="px-4 py-3 text-slate-700 capitalize">{tx.transaction_type}</td>
              <td className="px-4 py-3 font-mono text-slate-600 text-xs">{tx.sender_account}</td>
              <td className="px-4 py-3 font-mono text-slate-600 text-xs">{tx.receiver_account}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-slate-600 font-medium">{tx.currency}</td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(tx.transaction_date)}</td>
              <td className="px-4 py-3 text-center">
                <span className={`font-bold ${getRiskColor(tx.risk_score)}`}>
                  {tx.risk_score}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {tx.is_flagged ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    Yes
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">No</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => handleAnalyze(tx)}
                  disabled={analyzingId === tx.id}
                  title="Run AI investigation to assess fraud risk"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white primary-shadow hover:-translate-y-0.5"
                >
                  {analyzingId === tx.id ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>
                  ) : (
                    <><Brain className="w-3.5 h-3.5" /> Investigate</>
                  )}
                </button>
              </td>
            </tr>
          ))}
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
