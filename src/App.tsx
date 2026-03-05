import { useState, useEffect } from 'react';
import { Filter, Download, RefreshCw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TransactionList from './components/TransactionList';
import type { SupabaseTransaction } from './components/TransactionList';
import NetworkGraph from './components/NetworkGraph';
import StatCard from './components/StatCard';
import { supabase } from './supabaseClient';
import { AlertTriangle, FileCheck, TrendingUp } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [transactions, setTransactions] = useState<SupabaseTransaction[]>([]);
  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const highRiskCount = transactions.filter(t => t.risk_score >= 80).length;
  const pendingReviewCount = transactions.filter(t => t.is_flagged).length;
  const avgRiskScore = transactions.length
    ? Math.round(transactions.reduce((sum, t) => sum + t.risk_score, 0) / transactions.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {activeTab === 'alerts' && 'Alert Dashboard'}
                  {activeTab === 'investigations' && 'Active Investigations'}
                  {activeTab === 'pipelines' && 'Data Pipelines'}
                </h2>
                <p className="text-slate-400">
                  Real-time monitoring of suspicious financial activities
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center gap-2 transition-all">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center gap-2 transition-all">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button onClick={fetchTransactions} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard
                title="High Risk Alerts"
                value={highRiskCount}
                change="+12%"
                icon={AlertTriangle}
                trend="up"
              />
              <StatCard
                title="Pending Review"
                value={pendingReviewCount}
                change="-5%"
                icon={FileCheck}
                trend="down"
              />
              <StatCard
                title="Avg Risk Score"
                value={avgRiskScore}
                change="+3%"
                icon={TrendingUp}
                trend="up"
              />
            </div>
          </div>

          {activeTab === 'alerts' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Network Analysis</h3>
                <NetworkGraph transactions={transactions} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Flagged Transactions</h3>
                  <span className="text-sm text-slate-400">
                    Showing {transactions.length} transactions
                  </span>
                </div>
                <TransactionList transactions={transactions} />
              </div>
            </div>
          )}

          {activeTab === 'investigations' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Active Investigations</h3>
                <p className="text-slate-400">
                  Investigation case management and detailed transaction analysis will appear here
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Data Pipeline Status</h3>
                <p className="text-slate-400">
                  Real-time data ingestion monitoring and pipeline health metrics will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
