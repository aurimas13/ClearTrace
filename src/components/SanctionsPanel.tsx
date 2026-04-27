import { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Newspaper, Crown } from 'lucide-react';
import { screenAccount, type SanctionsScreening } from '../services/sanctions';

interface SanctionsPanelProps {
  senderAccount: string;
  receiverAccount: string;
  /** Compact = stacked single-column for narrow areas like the AI modal. */
  compact?: boolean;
}

const STATUS_META = {
  clear: {
    label: 'Clear',
    Icon: ShieldCheck,
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: 'text-emerald-700',
  },
  review: {
    label: 'Review',
    Icon: ShieldAlert,
    bar: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: 'text-amber-700',
  },
  match: {
    label: 'Match',
    Icon: ShieldX,
    bar: 'bg-red-500',
    chip: 'bg-red-50 text-red-700 border-red-200',
    accent: 'text-red-700',
  },
} as const;

export default function SanctionsPanel({ senderAccount, receiverAccount, compact }: SanctionsPanelProps) {
  const sender = useMemo(() => screenAccount(senderAccount), [senderAccount]);
  const receiver = useMemo(() => screenAccount(receiverAccount), [receiverAccount]);

  return (
    <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
      <PartyCard title="Sender" account={senderAccount} screening={sender} />
      <PartyCard title="Receiver" account={receiverAccount} screening={receiver} />
    </div>
  );
}

function PartyCard({
  title,
  account,
  screening,
}: {
  title: string;
  account: string;
  screening: SanctionsScreening;
}) {
  const meta = STATUS_META[screening.overall];
  const Icon = meta.Icon;
  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{title}</div>
          <div className="text-xs font-mono text-slate-700 truncate">{account}</div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${meta.chip}`}
        >
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {screening.results.map((r) => {
          const rMeta = STATUS_META[r.status];
          const RIcon = rMeta.Icon;
          return (
            <div
              key={r.list}
              className="flex items-center justify-between gap-2 text-[11px]"
              title={r.notes || ''}
            >
              <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                <RIcon className={`w-3 h-3 ${rMeta.accent} shrink-0`} />
                {r.listLabel}
              </span>
              <span className={`font-semibold ${rMeta.accent}`}>
                {r.status === 'clear' ? 'No match' : `${r.matchScore}% match`}
              </span>
            </div>
          );
        })}
        {(screening.pep || screening.adverseMedia > 0) && (
          <div className="pt-2 mt-1 border-t border-slate-100 flex flex-wrap gap-1.5">
            {screening.pep && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Crown className="w-2.5 h-2.5" />
                PEP
              </span>
            )}
            {screening.adverseMedia > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Newspaper className="w-2.5 h-2.5" />
                {screening.adverseMedia} adverse media
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
