import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Download, RefreshCw, ExternalLink, Clock, RotateCcw, Radio, UserCircle2, Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TransactionList from './components/TransactionList';
import NetworkGraph from './components/NetworkGraph';
import StatCard from './components/StatCard';
import LandingPage from './components/LandingPage';
import CaseStudy from './components/CaseStudy';
import Investigations from './components/Investigations';
import DataPipelines from './components/DataPipelines';
import Compliance from './components/Compliance';
import CommandPalette, { type CommandAction } from './components/CommandPalette';
import CustomerRiskDrawer from './components/CustomerRiskDrawer';
import AlertsFilterBar, { DEFAULT_FILTERS } from './components/AlertsFilterBar';
import type { AlertFilters } from './components/AlertsFilterBar';
import { supabase } from './supabaseClient';
import { AlertTriangle, FileCheck, TrendingUp } from 'lucide-react';
import type { SupabaseTransaction, Investigation } from './types';
import {
  ANALYSTS,
  type AnalystName,
  getCurrentAnalyst,
  setCurrentAnalyst,
  clearAuditLog,
  clearAssignees,
} from './services/sessionStore';
import { exportTransactionsCsv, exportInvestigationsCsv } from './services/exporters';
import { useToast } from './components/Toast';
import ActivityInsightsDrawer from './components/ActivityInsightsDrawer';
import {
  bootstrapSession,
  recordEvent,
  resetActivity,
} from './services/userActivity';

type Page = 'landing' | 'demo' | 'casestudy';

const SESSION_FRESH_KEY = 'cleartrace_session_initialized';

function App() {
  const toast = useToast();
  const [page, setPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState('alerts');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [inspectedAccount, setInspectedAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<SupabaseTransaction[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_FILTERS);
  const [focusedAccount, setFocusedAccount] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [analyst, setAnalyst] = useState<AnalystName>(getCurrentAnalyst());
  const [, setTick] = useState(0);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [txRes, invRes] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('investigations').select('*').order('created_at', { ascending: false }),
      ]);
      if (txRes.error) {
        console.error('[fetchAll] transactions error:', txRes.error);
      } else if (txRes.data) {
        setTransactions(txRes.data);
      }
      if (invRes.error) {
        console.error('[fetchAll] investigations error:', invRes.error);
      } else if (invRes.data) {
        setInvestigations(invRes.data);
      }
      setLastRefreshed(new Date());
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  }, []);

  // ─── Reset demo ───────────────────────────────────────────────────────────
  const resetDemo = useCallback(async (silent: boolean = false) => {
    if (!silent) setResetting(true);
    try {
      // Delete all investigations. The id column is a UUID, so we cannot use
      // a bigint comparison (`.gt('id', 0)` / `.neq('id', 0)`) — PostgREST
      // returns 400 "invalid input syntax for type uuid". The universal,
      // type-agnostic 'match every row' filter is `.not('id', 'is', null)`
      // since every row has a non-null primary key.
      const { error: delErr } = await supabase
        .from('investigations')
        .delete()
        .not('id', 'is', null);
      if (delErr && !silent) {
        toast.warning(
          'Could not clear investigations table',
          delErr.message || 'Database returned an error — local audit log was still cleared.'
        );
      }
      // Clear analyst notes, audit log, assignees (sessionStorage)
      try {
        sessionStorage.removeItem('cleartrace_analyst_notes');
      } catch {
        // ignore
      }
      clearAuditLog();
      clearAssignees();
      await fetchAll();
      if (!silent) {
        // Don't wipe the user's identity — just log the reset and clear the
        // current session's activity buffer so the panel reflects the new
        // baseline, while preserving lifetime totals.
        resetActivity(false);
        recordEvent('demo_reset');
        toast.success(
          'Demo reset',
          'Investigations, audit log, notes and assignments cleared. Your user identity was preserved.'
        );
      }
    } finally {
      if (!silent) setTimeout(() => setResetting(false), 400);
    }
  }, [fetchAll, toast]);

  // ─── First-time entry: hybrid fresh-start ─────────────────────────────
  useEffect(() => {
    if (page !== 'demo') return;

    // Bootstrap user activity tracker once per browser session and surface a
    // welcome toast appropriate to whether this is a first-visit, returning
    // or power user.
    const { state, isNewUser, isNewSession } = bootstrapSession();
    if (isNewSession) {
      if (isNewUser) {
        toast.info(
          'Welcome to ClearTrace',
          'We\u2019ll remember you locally so we can show your activity history on return visits.'
        );
      } else if (state.sessionCount >= 5 || state.eventCount >= 100) {
        toast.success(
          `Welcome back — visit #${state.sessionCount}`,
          `Power user with ${state.eventCount} lifetime events. Press ⌘K for the command palette.`
        );
      } else {
        toast.success(
          `Welcome back — visit #${state.sessionCount}`,
          'Your activity history is intact. Open the Activity panel in the top bar to review.'
        );
      }
    }
    recordEvent('demo_entered', { session_number: state.sessionCount });

    const initialized = sessionStorage.getItem(SESSION_FRESH_KEY);
    if (!initialized) {
      sessionStorage.setItem(SESSION_FRESH_KEY, '1');
      // Clear once per browser session, then fetch
      resetDemo(true);
    } else {
      fetchAll();
    }
  }, [page, fetchAll, resetDemo, toast]);

  // ─── Tick every 10s for relative timestamps ───────────────────────────────
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    if (page !== 'demo') return;
    tickRef.current = window.setInterval(() => setTick((t) => t + 1), 10_000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [page]);

  // ─── Live mode: auto-refresh every 30s when enabled ──────────────────────
  const liveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (page !== 'demo' || !liveMode) {
      if (liveTimerRef.current) {
        window.clearInterval(liveTimerRef.current);
        liveTimerRef.current = null;
      }
      return;
    }
    liveTimerRef.current = window.setInterval(() => {
      fetchAll();
    }, 30_000);
    return () => {
      if (liveTimerRef.current) window.clearInterval(liveTimerRef.current);
    };
  }, [page, liveMode, fetchAll]);

  // ─── Cmd+K / Ctrl+K to open command palette ────────────────────────────
  useEffect(() => {
    if (page !== 'demo') return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen((v) => {
          if (!v) recordEvent('command_palette_opened', { trigger: 'keyboard' });
          return !v;
        });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page]);

  // ─── Activity-tracking wrappers ──────────────────────────────────────
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab((prev) => {
      if (prev !== tab) recordEvent('tab_switched', { from: prev, to: tab });
      return tab;
    });
  }, []);

  const handleInspectAccount = useCallback((account: string) => {
    setInspectedAccount(account);
    recordEvent('account_inspected', { account });
  }, []);

  // ─── Derived state ────────────────────────────────────────────────────────
  // IMPORTANT: All hooks must be declared before any early return so the hook
  // call order stays identical across renders (React Rules of Hooks). The
  // landing/casestudy early returns live AFTER this block.
  // Unique transactions that have at least one investigation record (deduplicated).
  const investigatedTxIds = useMemo(() => {
    const set = new Set<number>();
    for (const inv of investigations) set.add(inv.transaction_id);
    return set;
  }, [investigations]);

  const totalInvestigatedCount = investigatedTxIds.size;

  const highRiskCount = transactions.filter((t) => t.risk_score >= 80).length;
  const pendingReviewCount = transactions.filter((t) => t.is_flagged && !investigatedTxIds.has(t.id)).length;
  const avgRiskScore = transactions.length
    ? Math.round(transactions.reduce((sum, t) => sum + t.risk_score, 0) / transactions.length)
    : 0;

  // Available transaction types for filter dropdown
  const txTypes = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) if (t.transaction_type) set.add(t.transaction_type);
    return Array.from(set).sort();
  }, [transactions]);

  // ─── Filter pipeline ──────────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Account focus from network graph
      if (focusedAccount && t.sender_account !== focusedAccount && t.receiver_account !== focusedAccount) {
        return false;
      }
      // Risk
      if (filters.risk === 'high' && t.risk_score < 80) return false;
      if (filters.risk === 'medium' && (t.risk_score < 60 || t.risk_score >= 80)) return false;
      if (filters.risk === 'low' && t.risk_score >= 60) return false;
      // Status
      const reviewed = investigatedTxIds.has(t.id);
      if (filters.status === 'pending' && reviewed) return false;
      if (filters.status === 'reviewed' && !reviewed) return false;
      // Type
      if (filters.type !== 'all' && t.transaction_type !== filters.type) return false;
      // Flagged only
      if (filters.flaggedOnly && !t.is_flagged) return false;
      // Search
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const hay = `${t.id} ${t.sender_account} ${t.receiver_account} ${t.transaction_type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filters, investigatedTxIds, focusedAccount]);

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

  // ─── Routing (post-hooks early returns) ──────────────────────────────────
  if (page === 'landing') {
    return (
      <LandingPage onEnterDemo={() => setPage('demo')} onCaseStudy={() => setPage('casestudy')} />
    );
  }
  if (page === 'casestudy') {
    return <CaseStudy onBack={() => setPage('landing')} onEnterDemo={() => setPage('demo')} />;
  }

  return (
    <div className="min-h-screen bg-[#fafbff] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={{
            alerts: pendingReviewCount,
            investigations: totalInvestigatedCount,
          }}
          onOpenCommandPalette={() => {
            recordEvent('command_palette_opened', { trigger: 'sidebar' });
            setPaletteOpen(true);
          }}
        />

        <main className="flex-1 overflow-auto">
          {/* Top bar with back links + analyst selector */}
          <div className="border-b border-slate-200 bg-white px-8 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => setPage('landing')}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
              ← Back to overview
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  recordEvent('activity_panel_opened');
                  setActivityOpen(true);
                }}
                title="View your activity insights"
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                Activity
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <label className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                <UserCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Signed in as
                </span>
                <select
                  id="cleartrace-current-analyst"
                  name="current_analyst"
                  aria-label="Current analyst"
                  value={analyst}
                  onChange={(e) => {
                    const v = e.target.value as AnalystName;
                    setAnalyst(v);
                    setCurrentAnalyst(v);
                    recordEvent('analyst_switched', { analyst: v });
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {ANALYSTS.filter((a) => a !== 'Unassigned').map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <span className="h-3 w-px bg-slate-200" />
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
                  <button
                    onClick={() => setLiveMode((v) => !v)}
                    title={liveMode ? 'Auto-refreshing every 30s — click to pause' : 'Enable live auto-refresh (30s)'}
                    className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all font-medium text-sm ${
                      liveMode
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      {liveMode && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          liveMode ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                    </span>
                      <Radio className="w-3.5 h-3.5" />
                      <span>{liveMode ? 'Live · 30s' : 'Go live'}</span>
                    </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Reset the demo? This will clear all investigations, analyst notes, audit log and assignments.'
                        )
                      ) {
                        resetDemo();
                      }
                    }}
                    disabled={resetting || refreshing}
                    title="Clear all investigations, notes, audit log and assignments (demo only)"
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-2 transition-all shadow-sm font-medium disabled:opacity-60"
                  >
                    <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                    <span>{resetting ? 'Resetting…' : 'Reset Demo'}</span>
                  </button>
                  <button
                    onClick={() => {
                      try {
                        if (activeTab === 'investigations') {
                          exportInvestigationsCsv(investigations, transactions);
                          recordEvent('export_cases', { count: investigations.length });
                          toast.success('Cases exported', `${investigations.length} case record(s) saved as CSV.`);
                        } else {
                          exportTransactionsCsv(filteredTransactions);
                          recordEvent('export_alerts', { count: filteredTransactions.length });
                          toast.success(
                            'Alerts exported',
                            `${filteredTransactions.length} transaction(s) saved as CSV with risk profile.`
                          );
                        }
                      } catch (err: any) {
                        toast.error('Export failed', err?.message || 'Could not generate the file.');
                      }
                    }}
                    title="Export current view as CSV"
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-2 transition-all shadow-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      recordEvent('data_refreshed');
                      fetchAll();
                    }}
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
                  <NetworkGraph
                    transactions={transactions}
                    selectedAccount={focusedAccount}
                    onSelectAccount={setFocusedAccount}
                  />
                  {focusedAccount && (
                    <p className="text-xs text-slate-500 mt-2 italic">
                      Click anywhere on the canvas to clear the focused account.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">Flagged Transactions</h3>
                    <span className="text-sm text-slate-600">
                      <span className="text-emerald-700 font-medium">{totalInvestigatedCount}</span> reviewed of{' '}
                      {transactions.length} total
                    </span>
                  </div>

                  <div className="mb-4">
                    <AlertsFilterBar
                      filters={filters}
                      onChange={setFilters}
                      onReset={() => {
                        setFilters(DEFAULT_FILTERS);
                        setFocusedAccount(null);
                      }}
                      txTypes={txTypes}
                      resultCount={filteredTransactions.length}
                      totalCount={transactions.length}
                    />
                  </div>

                  <TransactionList
                    transactions={filteredTransactions}
                    investigations={investigations}
                    onInvestigated={fetchAll}
                    onInspectAccount={handleInspectAccount}
                  />
                </div>
              </div>
            )}

            {activeTab === 'investigations' && (
              <Investigations
                transactions={transactions}
                investigations={investigations}
                onChanged={fetchAll}
                onInspectAccount={handleInspectAccount}
              />
            )}

            {activeTab === 'compliance' && (
              <Compliance transactions={transactions} investigations={investigations} />
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

      {/* Command palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAction={(action: CommandAction) => {
          if (action.type === 'tab') {
            handleTabChange(action.tab);
          } else if (action.type === 'open_account') {
            handleInspectAccount(action.account);
          } else if (action.type === 'focus_tx') {
            handleTabChange('alerts');
            const tx = transactions.find((t) => t.id === action.txId);
            if (tx) setFocusedAccount(tx.sender_account);
            recordEvent('transaction_focused', { txId: action.txId });
          } else if (action.type === 'open_case') {
            handleTabChange('investigations');
          } else if (action.type === 'reset_demo') {
            if (window.confirm('Reset the demo? This will clear all investigations, audit log and assignments.')) {
              resetDemo();
            }
          } else if (action.type === 'toggle_live') {
            setLiveMode((v) => !v);
            recordEvent('live_mode_toggled', { enabled: !liveMode });
            toast.info(liveMode ? 'Live mode disabled' : 'Live mode enabled', 'Auto-refreshing every 30 seconds.');
          } else if (action.type === 'export_alerts') {
            exportTransactionsCsv(filteredTransactions);
            recordEvent('export_alerts', { count: filteredTransactions.length });
            toast.success('Alerts exported', `${filteredTransactions.length} transaction(s) saved as CSV.`);
          }
        }}
        transactions={transactions}
        investigations={investigations}
      />

      {/* Activity insights drawer */}
      <ActivityInsightsDrawer open={activityOpen} onClose={() => setActivityOpen(false)} />

      {/* Customer risk drawer */}
      <CustomerRiskDrawer
        account={inspectedAccount}
        transactions={transactions}
        onClose={() => setInspectedAccount(null)}
      />

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
