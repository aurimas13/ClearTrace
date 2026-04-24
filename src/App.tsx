import { useState, useEffect } from 'react';
import { Filter, Download, RefreshCw, ExternalLink } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TransactionList from './components/TransactionList';
import type { SupabaseTransaction } from './components/TransactionList';
import NetworkGraph from './components/NetworkGraph';
import StatCard from './components/StatCard';
import LandingPage from './components/LandingPage';
import CaseStudy from './components/CaseStudy';
import { supabase } from './supabaseClient';
import { AlertTriangle, FileCheck, TrendingUp } from 'lucide-react';

type Page = 'landing' | 'demo' | 'casestudy';

function App() {
  const [page, setPage] = useState<Page>('landing');
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
    if (page === 'demo') {
      fetchTransactions();
    }
  }, [page]);

  if (page === 'landing') {
    return (
      <LandingPage
        onEnterDemo={() => setPage('demo')}
        onCaseStudy={() => setPage('casestudy')}
      />
    );
  }

  if (page === 'casestudy') {
    return (
      <CaseStudy
        onBack={() => setPage('landing')}
        onEnterDemo={() => setPage('demo')}
      />
    );
  }

  const highRiskCount = transactions.filter(t => t.risk_score >= 80).length;
  const pendingReviewCount = transactions.filter(t => t.is_flagged).length;
  const avgRiskScore = transactions.length
    ? Math.round(transactions.reduce((sum, t) => sum + t.risk_score, 0) / transactions.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#fafbff] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 overflow-auto">
          {/* Top bar with back links */}
          <div className="border-b border-slate-200 bg-white px-8 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setPage('landing')}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
              ← Back to overview
            </button>
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setPage('casestudy')}
                className="text-blue-700 hover:text-blue-900 font-semibold transition-colors flex items-center gap-1"
              >
                Case Study <ExternalLink className="w-3 h-3" />
              </button>
              <a
                href="https://aurimas.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                aurimas.io <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                    {activeTab === 'alerts' && 'Alert Dashboard'}
                    {activeTab === 'investigations' && 'Active Investigations'}
                    {activeTab === 'pipelines' && 'Data Pipelines'}
                  </h2>
                  <p className="text-slate-600">
                    Real-time monitoring of suspicious financial activities
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-2 transition-all shadow-sm font-medium">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-2 transition-all shadow-sm font-medium">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button onClick={fetchTransactions} className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg flex items-center gap-2 transition-all primary-shadow font-semibold">
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
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Network Analysis</h3>
                  <NetworkGraph transactions={transactions} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-900">Flagged Transactions</h3>
                    <span className="text-sm text-slate-600">
                      Showing {transactions.length} transactions
                    </span>
                  </div>
                  <TransactionList transactions={transactions} />
                </div>
              </div>
            )}

            {activeTab === 'investigations' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center card-shadow">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Active Investigations</h3>
                  <p className="text-slate-600">
                    Investigation case management and detailed transaction analysis will appear here
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'pipelines' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center card-shadow">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Data Pipeline Status</h3>
                  <p className="text-slate-600">
                    Real-time data ingestion monitoring and pipeline health metrics will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dashboard footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-8">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Built by <span className="text-slate-900 font-semibold">Aurimas Nausėdas</span>
          </p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setPage('casestudy')}
              className="text-blue-700 hover:text-blue-900 font-semibold transition-colors flex items-center gap-1"
            >
              Case study <ExternalLink className="w-3 h-3" />
            </button>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://aurimas.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              aurimas.io
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
