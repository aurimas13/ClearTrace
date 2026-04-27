import { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  ShieldAlert,
  CheckCircle2,
  FileWarning,
  ArrowUpRight,
  Clock,
  Filter as FilterIcon,
  Loader2,
  StickyNote,
  Save,
  History,
  UserCircle2,
  X,
  Shield,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { SupabaseTransaction, Investigation, InvestigationStatus } from '../types';
import SarDraftModal from './SarDraftModal';
import SanctionsPanel from './SanctionsPanel';
import AuditTimeline from './AuditTimeline';
import {
  ANALYSTS,
  type AnalystName,
  addAuditEvent,
  getAuditLog,
  getAllAssignees,
  setAssignee as persistAssignee,
  getCurrentAnalyst,
} from '../services/sessionStore';

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

const NOTES_KEY = 'cleartrace_analyst_notes';

function loadNotes(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(NOTES_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveNotes(notes: Record<string, string>) {
  try {
    sessionStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

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
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [sarTarget, setSarTarget] = useState<Investigation | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState<number | null>(null);
  const [assignees, setAssignees] = useState<Record<string, AnalystName>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openTimelines, setOpenTimelines] = useState<Set<number>>(new Set());
  const [openSanctions, setOpenSanctions] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const me = getCurrentAnalyst();

  useEffect(() => {
    const loadedNotes = loadNotes();
    setNotes(loadedNotes);
    setNotesDraft(loadedNotes);
    setAssignees(getAllAssignees());
  }, [investigations]);

  // Latest investigation per transaction
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
    return latestPerTx.filter((inv) => {
      if (filter !== 'all' && inv.investigation_status !== filter) return false;
      const assignee = assignees[String(inv.id)] || 'Unassigned';
      if (assigneeFilter === 'mine' && assignee !== me) return false;
      if (assigneeFilter === 'unassigned' && assignee !== 'Unassigned') return false;
      return true;
    });
  }, [latestPerTx, filter, assigneeFilter, assignees, me]);

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

  const myCasesCount = useMemo(
    () => latestPerTx.filter((inv) => (assignees[String(inv.id)] || 'Unassigned') === me).length,
    [latestPerTx, assignees, me]
  );
  const unassignedCount = useMemo(
    () => latestPerTx.filter((inv) => (assignees[String(inv.id)] || 'Unassigned') === 'Unassigned').length,
    [latestPerTx, assignees]
  );

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
    addAuditEvent(
      inv.id,
      'status_changed',
      `Status changed: ${STATUS_META[inv.investigation_status].label} → ${STATUS_META[status].label}.`,
      me
    );
    onChanged();
  }

  function openSarModal(inv: Investigation) {
    addAuditEvent(inv.id, 'sar_drafted', 'SAR draft opened for review.', me);
    setSarTarget(inv);
  }

  async function confirmFileSar() {
    if (!sarTarget) return;
    addAuditEvent(sarTarget.id, 'sar_filed', 'SAR draft confirmed and filed.', me);
    await updateStatus(sarTarget, 'sar_filed');
    setSarTarget(null);
  }

  function setDraftNote(invId: number, value: string) {
    setNotesDraft((prev) => ({ ...prev, [String(invId)]: value }));
  }

  function commitNote(invId: number) {
    const next = { ...notes, [String(invId)]: notesDraft[String(invId)] || '' };
    setNotes(next);
    saveNotes(next);
    addAuditEvent(invId, 'note_saved', 'Analyst note updated.', me);
    setSavedFlash(invId);
    setTimeout(() => setSavedFlash((curr) => (curr === invId ? null : curr)), 1500);
  }

  function changeAssignee(invId: number, analyst: AnalystName) {
    persistAssignee(invId, analyst);
    setAssignees((prev) => ({ ...prev, [String(invId)]: analyst }));
    addAuditEvent(invId, 'assigned', `Case assigned to ${analyst}.`, me);
  }

  // ─── Bulk selection ──────────────────────────────────────────────────────
  function toggleSelect(invId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(invId)) next.delete(invId);
      else next.add(invId);
      return next;
    });
  }
  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((i) => i.id)));
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }
  async function bulkUpdate(status: InvestigationStatus) {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from('investigations')
      .update({ investigation_status: status })
      .in('id', ids);
    setBulkBusy(false);
    if (error) {
      alert('Bulk update failed: ' + error.message);
      return;
    }
    for (const id of ids) {
      addAuditEvent(id, 'status_changed', `Bulk update: status set to ${STATUS_META[status].label}.`, me);
    }
    clearSelection();
    onChanged();
  }
  async function bulkAssign(analyst: AnalystName) {
    if (selectedIds.size === 0) return;
    for (const id of selectedIds) {
      persistAssignee(id, analyst);
      addAuditEvent(id, 'assigned', `Bulk assigned to ${analyst}.`, me);
    }
    setAssignees(getAllAssignees());
    clearSelection();
  }

  function toggleTimeline(invId: number) {
    setOpenTimelines((prev) => {
      const next = new Set(prev);
      if (next.has(invId)) next.delete(invId);
      else next.add(invId);
      return next;
    });
  }
  function toggleSanctionsPanel(invId: number) {
    setOpenSanctions((prev) => {
      const next = new Set(prev);
      if (next.has(invId)) next.delete(invId);
      else next.add(invId);
      return next;
    });
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

  // Build "related transactions" for SAR modal context
  const relatedFor = (inv: Investigation): SupabaseTransaction[] => {
    const tx = txById.get(inv.transaction_id);
    if (!tx) return [];
    return transactions
      .filter(
        (t) =>
          t.id !== tx.id &&
          (t.sender_account === tx.sender_account ||
            t.receiver_account === tx.receiver_account ||
            t.sender_account === tx.receiver_account ||
            t.receiver_account === tx.sender_account)
      )
      .slice(0, 8);
  };

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="space-y-3">
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
            All<span className="ml-1.5 text-xs opacity-70">({latestPerTx.length})</span>
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">
            <UserCircle2 className="w-3.5 h-3.5" />
            Reviewer
          </div>
          {(['all', 'mine', 'unassigned'] as const).map((opt) => {
            const active = assigneeFilter === opt;
            const label = opt === 'all' ? 'All cases' : opt === 'mine' ? `My cases (${me.split(' ')[0]})` : 'Unassigned';
            const count = opt === 'all' ? latestPerTx.length : opt === 'mine' ? myCasesCount : unassignedCount;
            return (
              <button
                key={opt}
                onClick={() => setAssigneeFilter(opt)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-offset-1 ring-slate-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {label}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-lg">
          <span className="text-sm font-semibold">
            {selectedIds.size} case{selectedIds.size === 1 ? '' : 's'} selected
          </span>
          <span className="h-4 w-px bg-slate-700" />
          <button
            onClick={() => bulkUpdate('cleared')}
            disabled={bulkBusy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 transition-colors"
          >
            Mark all Cleared
          </button>
          <button
            onClick={() => bulkUpdate('escalated')}
            disabled={bulkBusy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-60 transition-colors"
          >
            Escalate all
          </button>
          <select
            disabled={bulkBusy}
            onChange={(e) => {
              if (e.target.value) {
                bulkAssign(e.target.value as AnalystName);
                e.target.value = '';
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-60 transition-colors cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Assign all to…
            </option>
            {ANALYSTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {bulkBusy && <Loader2 className="w-4 h-4 animate-spin" />}
          <button
            onClick={clearSelection}
            className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </div>
      )}

      {/* Select-all toggle */}
      {filtered.length > 0 && (
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectedIds.size === filtered.length && filtered.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-blue-700 cursor-pointer"
          />
          Select all visible ({filtered.length})
        </label>
      )}

      {/* Cases */}
      <div className="space-y-4">
        {filtered.map((inv) => {
          const tx = txById.get(inv.transaction_id);
          const meta = STATUS_META[inv.investigation_status];
          const StatusIcon = meta.icon;
          const isSaving = savingId === inv.id;
          const draft = notesDraft[String(inv.id)] ?? '';
          const stored = notes[String(inv.id)] ?? '';
          const noteDirty = draft !== stored;
          const assignee: AnalystName = (assignees[String(inv.id)] as AnalystName) || 'Unassigned';
          const isSelected = selectedIds.has(inv.id);
          const auditEvents = getAuditLog(inv.id);
          const timelineOpen = openTimelines.has(inv.id);
          const sanctionsOpen = openSanctions.has(inv.id);

          return (
            <div
              key={inv.id}
              className={`bg-white rounded-2xl card-shadow overflow-hidden transition-shadow ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(inv.id)}
                    className="mt-2 w-4 h-4 accent-blue-700 cursor-pointer"
                    aria-label={`Select case ${inv.id}`}
                  />
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
                    <div className="flex items-center gap-2 mt-2">
                      <UserCircle2 className="w-4 h-4 text-slate-400" />
                      <select
                        value={assignee}
                        onChange={(e) => changeAssignee(inv.id, e.target.value as AnalystName)}
                        className="text-xs font-semibold bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {ANALYSTS.map((a) => (
                          <option key={a} value={a}>
                            {a === me ? `${a} (me)` : a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Disposition actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {isSaving && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                  {inv.investigation_status !== 'sar_filed' && (
                    <button
                      onClick={() => openSarModal(inv)}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <FileWarning className="w-3.5 h-3.5" />
                      File SAR
                    </button>
                  )}
                  {inv.investigation_status === 'open' && (
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
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transaction</h4>
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
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Indicators</h4>
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

              {/* Sanctions panel toggle */}
              {tx && (
                <div className="px-6 pb-3">
                  <button
                    onClick={() => toggleSanctionsPanel(inv.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-700" />
                    {sanctionsOpen ? 'Hide' : 'Show'} sanctions screening
                  </button>
                  {sanctionsOpen && (
                    <div className="mt-3">
                      <SanctionsPanel
                        senderAccount={tx.sender_account}
                        receiverAccount={tx.receiver_account}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Analyst notes */}
              <div className="px-6 pb-3">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                      Analyst notes
                    </label>
                    <div className="flex items-center gap-2">
                      {savedFlash === inv.id && (
                        <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Saved
                        </span>
                      )}
                      <button
                        onClick={() => commitNote(inv.id)}
                        disabled={!noteDirty}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Save note
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraftNote(inv.id, e.target.value)}
                    placeholder="Document your findings, decisions and next steps for the audit trail…"
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
                  />
                </div>
              </div>

              {/* Audit timeline */}
              <div className="px-6 pb-5">
                <button
                  onClick={() => toggleTimeline(inv.id)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5 mb-2"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  {timelineOpen ? 'Hide' : 'Show'} audit timeline
                  <span className="text-slate-400 font-normal">({auditEvents.length} events)</span>
                </button>
                {timelineOpen && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-white">
                    <AuditTimeline events={auditEvents} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SAR Modal */}
      {sarTarget && (() => {
        const tx = txById.get(sarTarget.transaction_id);
        if (!tx) return null;
        return (
          <SarDraftModal
            investigation={sarTarget}
            transaction={tx}
            relatedTransactions={relatedFor(sarTarget)}
            onCancel={() => setSarTarget(null)}
            onConfirm={confirmFileSar}
          />
        );
      })()}
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
