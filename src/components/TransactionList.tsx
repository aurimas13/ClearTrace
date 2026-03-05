import { AlertCircle, TrendingUp, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  accountNumber: string;
  amount: number;
  currency: string;
  timestamp: string;
  riskScore: number;
  flags: string[];
  counterparty: string;
  type: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-2024-001',
    accountNumber: '****7892',
    amount: 125000,
    currency: 'USD',
    timestamp: '2024-03-05 14:23:17',
    riskScore: 87,
    flags: ['Rapid Movement', 'High Value'],
    counterparty: 'Offshore Entity Ltd.',
    type: 'Wire Transfer',
  },
  {
    id: 'TXN-2024-002',
    accountNumber: '****3421',
    amount: 45000,
    currency: 'EUR',
    timestamp: '2024-03-05 13:45:33',
    riskScore: 72,
    flags: ['Structuring', 'Round Amount'],
    counterparty: 'Shell Corp Inc.',
    type: 'International Transfer',
  },
  {
    id: 'TXN-2024-003',
    accountNumber: '****9156',
    amount: 89500,
    currency: 'USD',
    timestamp: '2024-03-05 12:11:08',
    riskScore: 94,
    flags: ['PEP Connection', 'High Value', 'Unusual Pattern'],
    counterparty: 'Global Trade LLC',
    type: 'Cash Deposit',
  },
  {
    id: 'TXN-2024-004',
    accountNumber: '****6734',
    amount: 31000,
    currency: 'GBP',
    timestamp: '2024-03-05 11:34:52',
    riskScore: 65,
    flags: ['Geographic Risk'],
    counterparty: 'Import Export Co.',
    type: 'Wire Transfer',
  },
  {
    id: 'TXN-2024-005',
    accountNumber: '****2189',
    amount: 156000,
    currency: 'USD',
    timestamp: '2024-03-05 10:08:24',
    riskScore: 81,
    flags: ['High Value', 'New Relationship'],
    counterparty: 'Investment Holdings SA',
    type: 'International Transfer',
  },
];

export default function TransactionList() {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (score >= 60) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    return 'Medium';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Flagged Transactions</h2>
          <p className="text-slate-400">Real-time suspicious activity monitoring</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">Last updated: 2 mins ago</span>
        </div>
      </div>

      <div className="space-y-3">
        {mockTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:bg-slate-800 transition-all hover:border-slate-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-blue-400 font-mono font-semibold">{transaction.id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{transaction.type}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Account: {transaction.accountNumber}</span>
                  <span>•</span>
                  <span>{transaction.timestamp}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg border ${getRiskColor(transaction.riskScore)}`}>
                <div className="text-xs font-semibold mb-1">{getRiskLabel(transaction.riskScore)}</div>
                <div className="text-2xl font-bold">{transaction.riskScore}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-700">
              <div>
                <p className="text-xs text-slate-500 mb-1">Amount</p>
                <p className="text-lg font-semibold text-white">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Counterparty</p>
                <p className="text-lg font-semibold text-white">{transaction.counterparty}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <div className="flex gap-2 flex-wrap">
                {transaction.flags.map((flag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-900 border border-slate-600 rounded-full text-xs text-slate-300"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
