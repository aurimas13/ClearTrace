import { useMemo } from 'react';
import {
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Globe,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Banknote,
  Clock,
} from 'lucide-react';
import type { SupabaseTransaction, Investigation } from '../types';

interface DataPipelinesProps {
  transactions: SupabaseTransaction[];
  investigations: Investigation[];
  lastRefreshed: Date | null;
}

type PipelineStatus = 'healthy' | 'degraded' | 'paused';

interface Pipeline {
  id: string;
  name: string;
  source: string;
  description: string;
  icon: typeof Database;
  status: PipelineStatus;
  recordsToday: number;
  recordsPerMin: number;
  latencyMs: number;
  lastSync: string;
  format: string;
}

const STATUS_META: Record<PipelineStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  healthy: {
    label: 'Healthy',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
  },
  paused: {
    label: 'Paused',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: Pause,
  },
};

export default function DataPipelines({ transactions, investigations, lastRefreshed }: DataPipelinesProps) {
  const totalToday = transactions.length;
  const investigationsCount = investigations.length;

  // Build a realistic banking pipeline list. Numbers are anchored to the actual
  // demo data and jittered slightly on every refresh so the dashboard feels
  // alive (mirrors how Datadog / Grafana ingest health dashboards behave).
  const refreshKey = lastRefreshed ? lastRefreshed.getTime() : 0;
  const pipelines: Pipeline[] = useMemo(() => {
    const corebanking = Math.round(totalToday * 0.62);
    const swift = Math.round(totalToday * 0.18);
    const cards = Math.round(totalToday * 0.20);
    // Re-anchor `lastSync` against the current refresh moment so
    // "Synced Xs ago" actually moves when the user clicks Refresh.
    const anchor = lastRefreshed ? lastRefreshed.getTime() : Date.now();
    const ts = (secsBack: number) => new Date(anchor - secsBack * 1000).toISOString();
    // Lightweight pseudo-random jitter (deterministic per refreshKey + seed)
    const jitter = (seed: number, range: number) => {
      const x = Math.sin(refreshKey * 0.000_001 + seed) * 10_000;
      return (x - Math.floor(x)) * range - range / 2;
    };
    const j = (base: number, seed: number, pct: number) =>
      Math.max(0, Math.round(base + jitter(seed, base * pct)));

    return [
      {
        id: 'core-banking',
        name: 'Core Banking',
        source: 'PostgreSQL · core_banking.transactions',
        description: 'Primary deposit & wire transactions ingested via CDC stream.',
        icon: Banknote,
        status: 'healthy',
        recordsToday: corebanking,
        recordsPerMin: j(142, 1, 0.12),
        latencyMs: j(38, 2, 0.25),
        lastSync: ts(Math.max(2, Math.round(8 + jitter(3, 6)))),
        format: 'Avro',
      },
      {
        id: 'swift',
        name: 'SWIFT Gateway',
        source: 'MQ · swift.mt103.in',
        description: 'Cross-border wires (MT103/MT202) parsed and normalized.',
        icon: Globe,
        status: 'healthy',
        recordsToday: swift,
        recordsPerMin: j(24, 4, 0.18),
        latencyMs: j(187, 5, 0.20),
        lastSync: ts(Math.max(5, Math.round(45 + jitter(6, 30)))),
        format: 'MT / ISO 20022',
      },
      {
        id: 'cards',
        name: 'Card Network',
        source: 'Kafka · card_auth.events',
        description: 'Authorizations and clearings from Visa/Mastercard rails.',
        icon: CreditCard,
        status: 'degraded',
        recordsToday: cards,
        recordsPerMin: j(380, 7, 0.10),
        latencyMs: j(612, 8, 0.15),
        lastSync: ts(Math.max(10, Math.round(90 + jitter(9, 30)))),
        format: 'ISO 8583',
      },
      {
        id: 'sanctions',
        name: 'Sanctions Screening',
        source: 'API · ofac + eu_consolidated',
        description: 'OFAC, EU and UN sanctions list matching for senders/receivers.',
        icon: ShieldCheck,
        status: 'healthy',
        recordsToday: totalToday,
        recordsPerMin: j(142, 10, 0.12),
        latencyMs: j(54, 11, 0.20),
        lastSync: ts(Math.max(1, Math.round(4 + jitter(12, 4)))),
        format: 'JSON',
      },
      {
        id: 'kyc',
        name: 'KYC / Customer Profile',
        source: 'API · kyc_service.v3',
        description: 'Customer risk profiles, beneficial ownership and PEP status.',
        icon: UserCheck,
        status: 'healthy',
        recordsToday: j(182, 13, 0.05),
        recordsPerMin: Math.max(1, j(6, 14, 0.30)),
        latencyMs: j(92, 15, 0.18),
        lastSync: ts(Math.max(60, Math.round(180 + jitter(16, 90)))),
        format: 'JSON',
      },
      {
        id: 'investigations-store',
        name: 'Investigations Store',
        source: 'Supabase · public.investigations',
        description: 'AI investigation summaries and analyst dispositions (audit trail).',
        icon: Database,
        status: 'healthy',
        recordsToday: investigationsCount,
        recordsPerMin: investigationsCount > 0 ? Math.max(1, Math.round(investigationsCount / 60)) : 0,
        latencyMs: j(24, 17, 0.30),
        lastSync: ts(Math.max(1, Math.round(3 + jitter(18, 4)))),
        format: 'PostgREST',
      },
    ];
  }, [totalToday, investigationsCount, refreshKey, lastRefreshed]);

  const totals = useMemo(() => {
    const records = pipelines.reduce((sum, p) => sum + p.recordsToday, 0);
    const healthy = pipelines.filter((p) => p.status === 'healthy').length;
    const avgLatency = Math.round(
      pipelines.reduce((sum, p) => sum + p.latencyMs, 0) / pipelines.length
    );
    return { records, healthy, total: pipelines.length, avgLatency };
  }, [pipelines]);

  return (
    <div className="space-y-6">
      {/* Overview strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <OverviewCard
          icon={Database}
          label="Active pipelines"
          value={`${totals.healthy} / ${totals.total}`}
          accent="text-emerald-700"
        />
        <OverviewCard
          icon={Activity}
          label="Records ingested today"
          value={totals.records.toLocaleString()}
          accent="text-blue-700"
        />
        <OverviewCard
          icon={Clock}
          label="Avg. ingest latency"
          value={`${totals.avgLatency} ms`}
          accent="text-indigo-700"
        />
        <OverviewCard
          icon={CheckCircle2}
          label="Last refresh"
          value={lastRefreshed ? formatRelative(lastRefreshed) : '—'}
          accent="text-slate-700"
        />
      </div>

      {/* Pipeline table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ingestion Pipelines</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Source systems feeding ClearTrace · realtime health monitoring
            </p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {pipelines.map((p) => {
            const meta = STATUS_META[p.status];
            const StatusIcon = meta.icon;
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="px-6 py-5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/60 transition-colors"
              >
                <div className="col-span-12 md:col-span-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${meta.classes}`}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{p.source}</p>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.description}</p>
                  </div>
                </div>

                <Stat label="Today" value={p.recordsToday.toLocaleString()} />
                <Stat label="Records / min" value={p.recordsPerMin.toLocaleString()} />
                <Stat
                  label="Latency"
                  value={`${p.latencyMs} ms`}
                  accent={p.latencyMs > 500 ? 'text-amber-700' : 'text-slate-900'}
                />
                <Stat label="Format" value={p.format} mono />
                <div className="col-span-6 md:col-span-1 text-right">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Synced
                  </div>
                  <div className="text-sm text-slate-700 font-medium">{formatRelative(new Date(p.lastSync))}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-slate-500 italic px-1">
        Demo environment. Pipeline metrics are derived from the synthetic dataset and refresh when you press{' '}
        <span className="font-semibold text-slate-700">Refresh</span>.
      </p>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div className={`text-2xl font-extrabold ${accent || 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="col-span-6 md:col-span-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div
        className={`text-sm font-semibold ${mono ? 'font-mono' : ''} ${accent || 'text-slate-900'}`}
      >
        {value}
      </div>
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
