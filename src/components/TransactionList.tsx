import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Transaction } from '../data/mockTransactions';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/10 border-red-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-green-500/10 border-green-500/20';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'escalated':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:bg-slate-800 transition-all hover:border-slate-600 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-lg border ${getRiskBgColor(transaction.riskScore)}`}>
                <AlertTriangle className={`w-5 h-5 ${getRiskColor(transaction.riskScore)}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{transaction.id}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>{transaction.timestamp}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-slate-500">From:</span>
                    <span className="text-slate-300 ml-2 font-mono">{transaction.fromAccount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">To:</span>
                    <span className="text-slate-300 ml-2 font-mono">{transaction.toAccount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-slate-500">Amount:</span>
                    <span className="text-white ml-2 font-semibold">
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {transaction.flags.map((flag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs border border-slate-600"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className={`w-4 h-4 ${getRiskColor(transaction.riskScore)}`} />
                <span className="text-slate-400 text-sm">Risk Score</span>
              </div>
              <div className={`text-3xl font-bold ${getRiskColor(transaction.riskScore)}`}>
                {transaction.riskScore}
              </div>
              <div className="text-xs text-slate-500 mt-1">/ 100</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
