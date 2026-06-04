import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  /** Honest scope/definition line shown in the footer. */
  note?: string;
}

/**
 * StatCard — Dossier reskin.
 * Paper card with hard ink border + 4px hard-offset shadow (no blur),
 * Fraunces display numerals, smallcaps title, vermillion change indicator.
 */
export default function StatCard({ title, value, change, icon: Icon, trend, note }: StatCardProps) {
  return (
    <article className="group relative bg-paper border border-ink shadow-[4px_4px_0_0_var(--ink)] hover:shadow-[6px_6px_0_0_var(--ink)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all p-5 font-serif">
      {/* Top row — section marker + change pill */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-ink" strokeWidth={1.5} />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-mute">
            {title}
          </span>
        </div>
        {change && (
          <span
            className={`font-mono text-[10px] tracking-wider tabular-nums px-1.5 py-0.5 border ${
              trend === 'up'
                ? 'text-vermillion border-vermillion'
                : 'text-ink border-ink'
            }`}
          >
            {trend === 'up' ? '▲' : '▼'} {change.replace(/^[-+]/, '')}
          </span>
        )}
      </div>

      {/* Numeral — display Fraunces, oversized */}
      <div
        className="font-display text-ink leading-[0.9] tabular-nums"
        style={{
          fontSize: 'clamp(2.6rem, 4.6vw, 3.6rem)',
          fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 1",
        }}
      >
        {value}
      </div>

      {/* Footer rule + scope line */}
      <div className="hairline-thin mt-3 mb-2" />
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
        {note ?? 'Current dataset'}
      </p>
    </article>
  );
}
