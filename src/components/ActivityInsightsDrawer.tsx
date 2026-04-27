import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Activity,
  Sparkles,
  Clock,
  TrendingUp,
  ListChecks,
  UserCheck,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  getActivityState,
  getUserStatus,
  getEventTypeBreakdown,
  getHourlyActivityBuckets,
  formatEventType,
  resetActivity,
  type ActivityEventType,
  type UserStatus,
} from '../services/userActivity';
import Sparkline from './Sparkline';

interface ActivityInsightsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_META: Record<UserStatus, { label: string; classes: string; description: string }> = {
  first_visit: {
    label: 'First visit',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Welcome to ClearTrace! This is your first session.',
  },
  returning: {
    label: 'Returning user',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Welcome back \u2014 we kept your session history.',
  },
  power_user: {
    label: 'Power user',
    classes: 'bg-violet-50 text-violet-700 border-violet-200',
    description: '5+ sessions or 100+ events. You know your way around.',
  },
};

export default function ActivityInsightsDrawer({ open, onClose }: ActivityInsightsDrawerProps) {
  // Force a re-read whenever the drawer opens or after a reset
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const state = useMemo(() => getActivityState(), [tick, open]);
  const status = useMemo(() => getUserStatus(), [tick, open]);
  const breakdown = useMemo(() => getEventTypeBreakdown(), [tick, open]);
  const hourly = useMemo(() => getHourlyActivityBuckets(24), [tick, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const meta = STATUS_META[status];

  const recentEvents = state ? [...state.events].reverse().slice(0, 50) : [];

  // Days since first seen
  const daysSinceFirst = state
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(state.firstSeenAt).getTime()) / 86_400_000)
      )
    : 0;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="relative w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-toast-in"
        role="dialog"
        aria-label="Activity insights"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  User insights
                </p>
                <h3 className="text-base font-bold text-slate-900">
                  Your ClearTrace activity
                </h3>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${meta.classes}`}
            >
              <Sparkles className="w-3 h-3" />
              {meta.label}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Hero copy */}
          <p className="text-sm text-slate-600 leading-relaxed">{meta.description}</p>

          {!state ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 inline-flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Activity tracking not yet initialised. Interact with the app to populate this view.</span>
            </div>
          ) : (
            <>
              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  icon={UserCheck}
                  label="Sessions"
                  value={state.sessionCount.toLocaleString()}
                  hint={daysSinceFirst === 0 ? 'First day' : `over ${daysSinceFirst}d`}
                  accent="from-blue-600 to-indigo-600"
                />
                <Stat
                  icon={ListChecks}
                  label="Events recorded"
                  value={state.eventCount.toLocaleString()}
                  hint={`${state.events.length} in buffer`}
                  accent="from-emerald-600 to-teal-600"
                />
                <Stat
                  icon={Clock}
                  label="First seen"
                  value={new Date(state.firstSeenAt).toLocaleDateString()}
                  hint={new Date(state.firstSeenAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  accent="from-slate-700 to-slate-900"
                />
                <Stat
                  icon={TrendingUp}
                  label="Last activity"
                  value={formatRelative(state.lastSeenAt)}
                  hint={new Date(state.lastSeenAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  accent="from-violet-600 to-fuchsia-600"
                />
              </div>

              {/* User identity */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                  Local user identifier
                </p>
                <p className="font-mono text-xs text-slate-700 break-all">{state.userId}</p>
                <p className="text-[10.5px] text-slate-500 mt-1.5 leading-snug">
                  Generated locally on first visit. Stored in your browser only \u2014 no PII leaves
                  this device.
                </p>
              </div>

              {/* 24h sparkline */}
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                  Activity over last 24h
                </h4>
                <Sparkline
                  values={hourly}
                  width={350}
                  height={48}
                  stroke="#7c3aed"
                  fill="rgba(124, 58, 237, 0.12)"
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>24h ago</span>
                  <span>now</span>
                </div>
              </div>

              {/* Event-type breakdown */}
              {breakdown.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                    What you've been doing
                  </h4>
                  <ul className="space-y-1.5">
                    {breakdown.slice(0, 8).map((row) => {
                      const max = breakdown[0].count;
                      const pct = (row.count / max) * 100;
                      return (
                        <li key={row.type}>
                          <div className="flex items-baseline justify-between text-xs mb-0.5">
                            <span className="text-slate-700 font-medium">
                              {formatEventType(row.type)}
                            </span>
                            <span className="font-bold text-slate-800 tabular-nums">{row.count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Recent events */}
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                  Recent events ({recentEvents.length} of {state.events.length})
                </h4>
                {recentEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No events recorded yet \u2014 click around the app and they'll show up here.
                  </p>
                ) : (
                  <ol className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 -mr-1">
                    {recentEvents.map((e) => (
                      <li
                        key={e.id}
                        className="border border-slate-200 rounded-md bg-white px-3 py-2"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800">
                            {formatEventType(e.type)}
                          </span>
                          <span className="text-[10px] text-slate-400 tabular-nums whitespace-nowrap">
                            {formatRelative(e.ts)}
                          </span>
                        </div>
                        {e.payload && Object.keys(e.payload).length > 0 && (
                          <p className="text-[11px] text-slate-500 font-mono leading-snug mt-0.5 truncate">
                            {summarisePayload(e.type, e.payload)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              refresh();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Clear the session event log? Your user identity and session count will be preserved.')) {
                  resetActivity(false);
                  refresh();
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Clear events
            </button>
            <button
              onClick={() => {
                if (window.confirm('Forget this user entirely? On your next visit you will appear as a brand-new user.')) {
                  resetActivity(true);
                  refresh();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Forget me
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-md bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className="text-lg font-extrabold text-slate-900 tabular-nums leading-none">{value}</p>
      {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 5_000) return 'just now';
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

function summarisePayload(_type: ActivityEventType, payload: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (v === null || v === undefined) continue;
    parts.push(`${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`);
    if (parts.length >= 3) break;
  }
  return parts.join(' \u00b7 ');
}
