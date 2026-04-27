import { useState, useMemo } from 'react';
import {
  Brain,
  ShieldAlert,
  CheckCircle2,
  FileWarning,
  ArrowUpRight,
  Clock,
  Filter as FilterIcon,
  Loader2,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { SupabaseTransaction, Investigation, InvestigationStatus } from '../types';

interface InvestigationsProps {
  transactions: SupabaseTransaction[];
  investigations: Investigation[];
  onChanged: () => void;
}

const STATUS_META: Record<
  InvestigationStatus,
  { label: string; icon: typeof CheckCircle2; classes: string }
> = {
  open: {
    label: 'Open',
    icon: Clock,
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  escalated: {
    label: 'Escalated',
    icon: ArrowUpRight,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  sar_filed: {
    label: 'SAR Filed',
    icon: FileWarning,
    classes: 'bg-red-50 text-red-700 border-red-200',
  },
  cleared: {
    label: 'Cleared',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const ALL_STATUSES: InvestigationStatus[] = ['open', 'escalated', 'sar_filed', 'cleared'];

function formatRelative(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Investigations({ transactions, investigations, onChanged }: InvestigationsProps) {
  const [filter, setFilter] = useState<InvestigationStatus | 'all'>('all');
  const [savingId, setSavingId] = useState<number | null>(null);

  // Latest investigation per transaction (in case there are re-investigations)
  const latestPerTx = useMemo(() => {
    const map = new Map<number, Investigation>();
    for (const inv of investigations) {
      const existing = map.get(inv.transaction_id);
      if (
        !existing ||
        (inv.created_at && existing.created_at && inv.created_at > existing.created_at) ||
        (!existing.created_at && inv.created_at)
      ) {
        map.set(inv.transaction_id, inv);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [investigations]);

  const txById = useMemo(() => {
    const m = new Map<number, SupabaseTransaction>();
    for (const t of transactions) m.set(t.id, t);
    return m;
  }, [transactions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return latestPerTx;
    return latestPerTx.filter((i) => i.investigation_status === filter);
  }, [latestPerTx, filter]);

  const counts = useMemo(() => {
    const c: Record<InvestigationStatus, number> = {
      open: 0,
      escalated: 0,
      sar_filed: 0,
      cleared: 0,
    };
    for (const inv of latestPerTx) c[inv.investigation_status] = (c[inv.investigation_status] || 0) + 1;
    return c;
  }, [latestPerTx]);

  async function updateStatus(inv: Investigation, status: InvestigationStatus) {
    setSavingId(inv.id);
    const { error } = await supabase
      .from('investigations')
      .update({ investigation_status: status })
      .eq('id', inv.id);
    setSavingId(null);
    if (error) {
      alert('Failed to update status: ' + error.message);
      return;
    }
    onChanged();
  }

  if (latestPerTx.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center card-shadow">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-blue-700" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No active investigations</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          When an analyst clicks <span className="font-semibold text-slate-900">Investigate</span> on a transaction in the
          Alerts queue, the case will open here for triage and disposition.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">
          <FilterIcon className="w-3.5 h-3.5" />
          Status
        </div>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          All
          <span className="ml-1.5 text-xs opacity-70">({latestPerTx.length})</span>
        </button>
        {ALL_STATUSES.map((s) => {
          const meta = STATUS_META[s];
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? `${meta.classes} ring-2 ring-offset-1 ring-slate-200`
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {meta.label}
              <span className="ml-1.5 text-xs opacity-70">({counts[s] || 0})</span>
            </button>
          );
        })}
      </div>

      {/* Cases */}
      <div className="space-y-4">
        {filtered.map((inv) => {
          const tx = txById.get(inv.transaction_id);
          const meta = STATUS_META[inv.investigation_status];
          const StatusIcon = meta.icon;
          const isSaving = savingId === inv.id;
          return (
            <div key={inv.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">
                        Case #INV-{String(inv.id).padStart(4, '0')}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.classes}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Transaction #{inv.transaction_id} · Opened {formatRelative(inv.created_at)}
                    </p>
                  </div>
                </div>

                {/* Disposition actions */}
                <div className="flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                  {inv.investigation_status !== 'sar_filed' && (
                    <button
                      onClick={() => updateStatus(inv, 'sar_filed')}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                    >
                      File SAR
                    </button>
                  )}
                  {inv.investigation_status !== 'escalated' && inv.investigation_status === 'open' && (
                    <button
                      onClick={() => updateStatus(inv, 'escalated')}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50"
                    >
                      Escalate
                    </button>
                  )}
                  {inv.investigation_status !== 'cleared' && (
                    <button
                      onClick={() => updateStatus(inv, 'cleared')}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors disabled:opacity-50"
                    >
                      Clear
                    </button>
                  )}
                  {inv.investigation_status !== 'open' && (
                    <button
                      onClick={() => updateStatus(inv, 'open')}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              {tx ? (
                <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Transaction details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Transaction
                    </h4>
                    <DetailRow label="Type" value={tx.transaction_type} />
                    <DetailRow
                      label="Amount"
                      value={`${tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} ${tx.currency}`}
                      valueClass="text-slate-900 font-semibold"
                    />
                    <DetailRow label="Sender" value={tx.sender_account} mono />
                    <DetailRow label="Receiver" value={tx.receiver_account} mono />
                    <DetailRow
                      label="Date"
                      value={new Date(tx.transaction_date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    />
                  </div>

                  {/* Risk indicators */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Risk Indicators
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs text-slate-500 font-medium">Risk Score</span>
                        <span
                          className={`text-2xl font-extrabold ${
                            tx.risk_score >= 80
                              ? 'text-red-600'
                              : tx.risk_score >= 60
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {tx.risk_score}
                          <span className="text-sm text-slate-400 font-normal">/100</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tx.risk_score >= 80
                              ? 'bg-red-500'
                              : tx.risk_score >= 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${tx.risk_score}%` }}
                        />
                      </div>
                    </div>
                    <DetailRow
                      label="Auto-flagged"
                      value={tx.is_flagged ? 'Yes' : 'No'}
                      valueClass={tx.is_flagged ? 'text-red-700 font-semibold' : 'text-slate-600'}
                    />
                  </div>

                  {/* AI summary */}
                  <div className="space-y-3 lg:border-l lg:border-slate-200 lg:pl-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      AI Investigation Summary
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{inv.ai_summary}</p>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-5 text-sm text-slate-500 italic">
                  Underlying transaction record not available.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span
        className={`text-sm text-slate-700 text-right ${mono ? 'font-mono text-xs' : ''} ${valueClass || ''}`}
      >
        {value}
      </span>
    </div>
  );
}
