import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, Download, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TransactionList from './components/TransactionList';
import NetworkGraph from './components/NetworkGraph';
import StatCard from './components/StatCard';
import LandingPage from './components/LandingPage';
import CaseStudy from './components/CaseStudy';
import Investigations from './components/Investigations';
import DataPipelines from './components/DataPipelines';
import { supabase } from './supabaseClient';
import { AlertTriangle, FileCheck, TrendingUp } from 'lucide-react';
import type { SupabaseTransaction, Investigation } from './types';

type Page = 'landing' | 'demo' | 'casestudy';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState('alerts');
  const [transactions, setTransactions] = useState<SupabaseTransaction[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [, setTick] = useState(0); // forces re-render every 10s for relative timestamps

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [txRes, invRes] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('investigations').select('*').order('created_at', { ascending: false }),
      ]);
      if (!txRes.error && txRes.data) setTransactions(txRes.data);
      if (!invRes.error && invRes.data) setInvestigations(invRes.data);
      setLastRefreshed(new Date());
    } finally {
      // Keep the spin visible for at least 400ms so the refresh feels responsive
      setTimeout(() => setRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    if (page === 'demo') fetchAll();
  }, [page, fetchAll]);

  // Tick every 10s so "Last updated Xs ago" stays accurate
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (page !== 'demo') return;
    tickRef.current = window.setInterval(() => setTick((t) => t + 1), 10_000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
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
      <CaseStudy onBack={() => setPage('landing')} onEnterDemo={() => setPage('demo')} />
    );
  }

  // ─── Dashboard derived metrics ────────────────────────────────────────────
  const investigatedTxIds = new Set(investigations.map((i) => i.transaction_id));
  const openInvestigations = investigations.filter((i) => i.investigation_status === 'open').length;
  const highRiskCount = transactions.filter((t) => t.risk_score >= 80).length;
  const pendingReviewCount = transactions.filter((t) => t.is_flagged && !investigatedTxIds.has(t.id)).length;
  const avgRiskScore = transactions.length
    ? Math.round(transactions.reduce((sum, t) => sum + t.risk_score, 0) / transactions.length)
    : 0;

  const tabTitle =
    activeTab === 'alerts'
      ? 'Alert Dashboard'
      : activeTab === 'investigations'
      ? 'Active Investigations'
      : 'Data Pipelines';
  const tabSubtitle =
    activeTab === 'alerts'
      ? 'Real-time monitoring of suspicious financial activities'
      : activeTab === 'investigations'
      ? 'Review AI investigation summaries and set case dispositions'
      : 'Source-system ingestion health, throughput and audit trail';

  return (
    <div className="min-h-screen bg-[#fafbff] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            alerts: pendingReviewCount,
            investigations: openInvestigations,
          }}
        />

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
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{tabTitle}</h2>
                  <p className="text-slate-600">{tabSubtitle}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {lastRefreshed && (
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {formatRelative(lastRefreshed)}
                    </span>
                  )}
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-2 transition-all shadow-sm font-medium">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-2 transition-all shadow-sm font-medium">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={fetchAll}
                    disabled={refreshing}
                    className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg flex items-center gap-2 transition-all primary-shadow font-semibold disabled:opacity-70"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
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
                      Showing {transactions.length} transactions ·{' '}
                      <span className="text-emerald-700 font-medium">
                        {investigations.length} reviewed
                      </span>
                    </span>
                  </div>
                  <TransactionList
                    transactions={transactions}
                    investigations={investigations}
                    onInvestigated={fetchAll}
                  />
                </div>
              </div>
            )}

            {activeTab === 'investigations' && (
              <Investigations
                transactions={transactions}
                investigations={investigations}
                onChanged={fetchAll}
              />
            )}

            {activeTab === 'pipelines' && (
              <DataPipelines
                transactions={transactions}
                investigations={investigations}
                lastRefreshed={lastRefreshed}
              />
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

function formatRelative(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  return `${hrs}h ago`;
}

export default App;
