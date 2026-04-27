import { useMemo } from 'react';
import {
  Activity,
  Target,
  Timer,
  TrendingDown,
  FileWarning,
  ListChecks,
  AlertOctagon,
  ShieldCheck,
} from 'lucide-react';
import type { Investigation, SupabaseTransaction } from '../types';
import GeoRiskMap from './GeoRiskMap';
import { classifyTransaction, TYPOLOGY_META, type TypologyId } from '../services/typology';
import { getAuditLog } from '../services/sessionStore';

interface ComplianceProps {
  transactions: SupabaseTransaction[];
  investigations: Investigation[];
}

export default function Compliance({ transactions, investigations }: ComplianceProps) {
  // ─── Hourly alert volume (today) ─────────────────────────────────────────
  const hourlyVolume = useMemo(() => {
    const buckets = new Array(24).fill(0) as number[];
    for (const t of transactions) {
      if (!t.is_flagged) continue;
      const h = new Date(t.transaction_date).getHours();
      buckets[h] += 1;
    }
    return buckets;
  }, [transactions]);

  // ─── Conversion funnel ───────────────────────────────────────────────────
  const flagged = transactions.filter((t) => t.is_flagged).length;
  const investigated = useMemo(() => {
    const ids = new Set(investigations.map((i) => i.transaction_id));
    return transactions.filter((t) => ids.has(t.id)).length;
  }, [transactions, investigations]);
  const escalated = investigations.filter(
    (i) => i.investigation_status === 'escalated' || i.investigation_status === 'sar_filed'
  ).length;
  const sarFiled = investigations.filter((i) => i.investigation_status === 'sar_filed').length;
  const cleared = investigations.filter((i) => i.investigation_status === 'cleared').length;
  const totalInv = investigations.length || 1;

  // False-positive proxy: cleared / total dispositioned
  const dispositioned = investigations.filter(
    (i) => i.investigation_status !== 'open'
  ).length;
  const fpRate = dispositioned > 0 ? Math.round((cleared / dispositioned) * 100) : 0;

  // ─── SLA: median time-from-open-to-disposition (audit log driven) ────────
  const slaMinutes = useMemo(() => {
    const durations: number[] = [];
    for (const inv of investigations) {
      const audit = getAuditLog(inv.id);
      if (audit.length === 0) continue;
      const sorted = [...audit].sort((a, b) => a.ts.localeCompare(b.ts));
      const opened = sorted.find((e) => e.type === 'case_opened' || e.type === 'reinvestigated');
      const disposed = [...sorted]
        .reverse()
        .find(
          (e) =>
            e.type === 'status_changed' || e.type === 'sar_filed'
        );
      if (opened && disposed) {
        const ms = new Date(disposed.ts).getTime() - new Date(opened.ts).getTime();
        if (ms > 0) durations.push(ms / 60000);
      }
    }
    if (durations.length === 0) return null;
    durations.sort((a, b) => a - b);
    return durations[Math.floor(durations.length / 2)];
  }, [investigations]);

  // ─── Typology mix ────────────────────────────────────────────────────────
  const typologyMix = useMemo(() => {
    const counts: Record<TypologyId, number> = {
      structuring: 0,
      smurfing: 0,
      layering: 0,
      round_tripping: 0,
      velocity: 0,
      tbml: 0,
    };
    for (const t of transactions) {
      const tys = classifyTransaction(t);
      for (const ty of tys) counts[ty.id] += 1;
    }
    const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
    return Object.entries(counts).map(([id, count]) => ({
      id: id as TypologyId,
      meta: TYPOLOGY_META[id as TypologyId],
      count,
      pct: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          icon={Activity}
          label="Alerts (today)"
          value={flagged.toLocaleString()}
          accent="from-blue-600 to-indigo-600"
          sublabel={`${investigated} investigated`}
        />
        <KpiTile
          icon={Target}
          label="Alert\u2192SAR conversion"
          value={`${totalInv > 0 ? Math.round((sarFiled / totalInv) * 100) : 0}%`}
          accent="from-rose-600 to-red-600"
          sublabel={`${sarFiled} SAR filed`}
        />
        <KpiTile
          icon={Timer}
          label="Median SLA"
          value={slaMinutes != null ? formatMinutes(slaMinutes) : '—'}
          accent="from-emerald-600 to-teal-600"
          sublabel="open\u2192disposition"
        />
        <KpiTile
          icon={TrendingDown}
          label="False-positive rate"
          value={`${fpRate}%`}
          accent="from-amber-600 to-orange-600"
          sublabel={`${cleared} cleared / ${dispositioned} dispositioned`}
        />
      </div>

      {/* Hourly alert volume */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Alert volume by hour
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Peak: hour {hourlyVolume.indexOf(Math.max(...hourlyVolume))}:00 ·{' '}
            {Math.max(...hourlyVolume)} alerts
          </p>
        </div>
        <div className="p-5">
          <HourlyBarChart values={hourlyVolume} />
        </div>
      </div>

      {/* Conversion funnel + Typology mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Alert \u2192 SAR conversion funnel
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <FunnelRow
              label="Flagged transactions"
              count={flagged}
              max={flagged}
              color="bg-blue-500"
              icon={Activity}
            />
            <FunnelRow
              label="Cases opened"
              count={investigated}
              max={flagged}
              color="bg-indigo-500"
              icon={ListChecks}
            />
            <FunnelRow
              label="Escalated / under review"
              count={escalated}
              max={flagged}
              color="bg-amber-500"
              icon={AlertOctagon}
            />
            <FunnelRow
              label="SAR filed"
              count={sarFiled}
              max={flagged}
              color="bg-red-500"
              icon={FileWarning}
            />
            <FunnelRow
              label="Cleared (false positive)"
              count={cleared}
              max={flagged}
              color="bg-emerald-500"
              icon={ShieldCheck}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AML typology mix
            </h3>
          </div>
          <div className="p-5 space-y-2.5">
            {typologyMix.map((row) => (
              <div key={row.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{row.meta.label}</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {row.count}{' '}
                    <span className="text-slate-400 font-medium">({row.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-600"
                    style={{ width: `${Math.min(100, row.pct)}%` }}
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
                  {row.meta.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geo-risk world map */}
      <GeoRiskMap transactions={transactions} />
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  accent,
  sublabel,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  accent: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl card-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tabular-nums leading-none">{value}</p>
      {sublabel && <p className="text-[11px] text-slate-500 mt-1.5">{sublabel}</p>}
    </div>
  );
}

function HourlyBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-700 transition-colors relative"
            style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? '4px' : '0' }}
            title={`${i}:00 — ${v} alerts`}
          >
            {v > 0 && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                {v}
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400 font-medium tabular-nums">
            {i % 3 === 0 ? `${String(i).padStart(2, '0')}` : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function FunnelRow({
  label,
  count,
  max,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
  icon: typeof Activity;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-700 font-semibold inline-flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </span>
        <span className="font-bold text-slate-800 tabular-nums">
          {count}{' '}
          <span className="text-slate-400 font-medium">({pct}%)</span>
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function formatMinutes(m: number) {
  if (m < 1) return '<1m';
  if (m < 60) return `${Math.round(m)}m`;
  const hrs = m / 60;
  if (hrs < 24) return `${hrs.toFixed(1)}h`;
  return `${Math.round(hrs / 24)}d`;
}
