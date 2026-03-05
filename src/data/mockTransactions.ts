export interface Transaction {
  id: string;
  timestamp: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  riskScore: number;
  flags: string[];
  status: 'pending' | 'reviewed' | 'escalated';
}

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-2024-001',
    timestamp: '2024-03-05 14:23:15',
    fromAccount: 'ACC-8472-US',
    toAccount: 'ACC-2934-KY',
    amount: 487500,
    currency: 'USD',
    riskScore: 94,
    flags: ['Structuring', 'High-Risk Jurisdiction', 'Unusual Pattern'],
    status: 'escalated',
  },
  {
    id: 'TXN-2024-002',
    timestamp: '2024-03-05 13:47:32',
    fromAccount: 'ACC-1923-GB',
    toAccount: 'ACC-5671-CH',
    amount: 125000,
    currency: 'EUR',
    riskScore: 87,
    flags: ['Rapid Movement', 'Shell Company'],
    status: 'pending',
  },
  {
    id: 'TXN-2024-003',
    timestamp: '2024-03-05 12:15:08',
    fromAccount: 'ACC-4512-US',
    toAccount: 'ACC-8834-PA',
    amount: 9950,
    currency: 'USD',
    riskScore: 82,
    flags: ['Just Below Threshold', 'PEP Association'],
    status: 'pending',
  },
  {
    id: 'TXN-2024-004',
    timestamp: '2024-03-05 11:32:44',
    fromAccount: 'ACC-7721-SG',
    toAccount: 'ACC-3398-HK',
    amount: 2400000,
    currency: 'USD',
    riskScore: 79,
    flags: ['Large Transaction', 'Cross-Border'],
    status: 'reviewed',
  },
  {
    id: 'TXN-2024-005',
    timestamp: '2024-03-05 10:18:27',
    fromAccount: 'ACC-9012-AE',
    toAccount: 'ACC-1847-US',
    amount: 67800,
    currency: 'USD',
    riskScore: 76,
    flags: ['Layering Pattern', 'Multiple Intermediaries'],
    status: 'pending',
  },
  {
    id: 'TXN-2024-006',
    timestamp: '2024-03-05 09:45:13',
    fromAccount: 'ACC-5634-DE',
    toAccount: 'ACC-2209-LU',
    amount: 345000,
    currency: 'EUR',
    riskScore: 71,
    flags: ['Anomalous Behavior', 'New Relationship'],
    status: 'pending',
  },
  {
    id: 'TXN-2024-007',
    timestamp: '2024-03-05 08:52:39',
    fromAccount: 'ACC-4409-JP',
    toAccount: 'ACC-8871-CN',
    amount: 156000,
    currency: 'USD',
    riskScore: 68,
    flags: ['Velocity Alert', 'Round Amount'],
    status: 'reviewed',
  },
  {
    id: 'TXN-2024-008',
    timestamp: '2024-03-05 07:31:55',
    fromAccount: 'ACC-7823-CA',
    toAccount: 'ACC-9934-BM',
    amount: 89200,
    currency: 'CAD',
    riskScore: 64,
    flags: ['Geographic Risk', 'Cash Intensive'],
    status: 'pending',
  },
];
