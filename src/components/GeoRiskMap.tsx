import { useMemo } from 'react';
import { Globe } from 'lucide-react';
import {
  buildRiskCorridors,
  getCustomerRiskProfile,
  JURISDICTIONS,
  type FatfStatus,
} from '../services/customerRisk';
import type { SupabaseTransaction } from '../types';

interface GeoRiskMapProps {
  transactions: SupabaseTransaction[];
}

const FATF_COLOR: Record<FatfStatus, string> = {
  standard: '#10b981',
  monitored: '#f59e0b',
  high_risk: '#dc2626',
};

const W = 960;
const H = 480;

/**
 * Equirectangular projection: lng \u2208 [-180,180], lat \u2208 [-90,90] \u2192 (x,y).
 */
function project(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return [x, y];
}

/**
 * Rough quadratic Bezier control point that lifts the arc above the great-circle
 * straight line for visual clarity.
 */
function arcPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Lift perpendicular to the segment
  const nx = -dy / dist;
  const ny = dx / dist;
  const lift = Math.min(120, dist * 0.3);
  const cx = mx + nx * lift;
  const cy = my + ny * lift;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

export default function GeoRiskMap({ transactions }: GeoRiskMapProps) {
  const corridors = useMemo(() => buildRiskCorridors(transactions).slice(0, 60), [transactions]);

  const accountStats = useMemo(() => {
    const map = new Map<string, { code: string; lat: number; lng: number; count: number; worstFatf: FatfStatus }>();
    const rank = (s: FatfStatus) => (s === 'high_risk' ? 2 : s === 'monitored' ? 1 : 0);
    for (const t of transactions) {
      for (const acc of [t.sender_account, t.receiver_account]) {
        const p = getCustomerRiskProfile(acc);
        const key = p.jurisdiction.code;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
          if (rank(p.jurisdiction.fatf) > rank(existing.worstFatf)) existing.worstFatf = p.jurisdiction.fatf;
        } else {
          map.set(key, {
            code: key,
            lat: p.jurisdiction.lat,
            lng: p.jurisdiction.lng,
            count: 1,
            worstFatf: p.jurisdiction.fatf,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [transactions]);

  // Stats summary
  const summary = useMemo(() => {
    let high = 0, monitored = 0, standard = 0;
    for (const c of corridors) {
      if (c.worstFatf === 'high_risk') high += 1;
      else if (c.worstFatf === 'monitored') monitored += 1;
      else standard += 1;
    }
    return { high, monitored, standard };
  }, [corridors]);

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Cross-border risk corridors
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <LegendDot color={FATF_COLOR.high_risk} label={`High-risk (${summary.high})`} />
          <LegendDot color={FATF_COLOR.monitored} label={`Monitored (${summary.monitored})`} />
          <LegendDot color={FATF_COLOR.standard} label={`Standard (${summary.standard})`} />
        </div>
      </div>
      <div className="p-3 bg-gradient-to-b from-slate-50 to-white">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Cross-border transaction corridor risk map"
        >
          {/* Subtle graticule */}
          <defs>
            <pattern id="grat" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#ocean)" />
          <rect width={W} height={H} fill="url(#grat)" />

          {/* Corridor arcs */}
          {corridors.map((c, i) => {
            const [x1, y1] = project(c.fromLng, c.fromLat);
            const [x2, y2] = project(c.toLng, c.toLat);
            const color = FATF_COLOR[c.worstFatf];
            const opacity = 0.35 + Math.min(0.55, c.count / 8);
            const width = 1 + Math.min(3, Math.log10(c.totalAmount + 1) / 2);
            return (
              <path
                key={i}
                d={arcPath(x1, y1, x2, y2)}
                fill="none"
                stroke={color}
                strokeWidth={width}
                strokeOpacity={opacity}
                strokeLinecap="round"
              >
                <title>
                  {c.fromCode} → {c.toCode} · {c.count} txn · {c.totalAmount.toLocaleString()} USD ·
                  worst risk {c.highestRisk}/100
                </title>
              </path>
            );
          })}

          {/* Jurisdiction nodes */}
          {accountStats.map((j) => {
            const [x, y] = project(j.lng, j.lat);
            const color = FATF_COLOR[j.worstFatf];
            const r = 3 + Math.min(7, Math.log2(j.count + 1));
            return (
              <g key={j.code}>
                {j.worstFatf !== 'standard' && (
                  <circle
                    cx={x}
                    cy={y}
                    fill={color}
                    fillOpacity={0.4}
                    className="geo-pulse"
                    style={{ r: 3 } as any}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={color}
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeWidth={1.2}
                />
                <text
                  x={x + r + 3}
                  y={y + 3}
                  fontSize="10"
                  fill="#334155"
                  fontWeight={600}
                  className="select-none"
                >
                  {j.code}
                </text>
              </g>
            );
          })}

          {/* Reference labels for FATF black-list jurisdictions, even if no data */}
          {JURISDICTIONS.filter((j) => j.fatf === 'high_risk').map((j) => {
            const [x, y] = project(j.lng, j.lat);
            return (
              <g key={`hr-${j.code}`} opacity={0.45}>
                <circle cx={x} cy={y} r={2.5} fill={FATF_COLOR.high_risk} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-5 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
        Equirectangular projection · arc thickness ∝ log corridor volume · pulsing markers indicate FATF
        monitored or call-for-action jurisdictions touched in the current dataset.
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-slate-600 font-medium">{label}</span>
    </div>
  );
}
