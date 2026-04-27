/**
 * Deterministic AML typology classifier.
 *
 * Real banks run a battery of behavioural rules on top of ML scoring to assign
 * each suspicious transaction one or more "typology" labels — these labels are
 * what's reported in the SAR narrative. Here we mock the classifier output
 * deterministically based on transaction attributes so the demo is stable.
 *
 * Typologies modelled:
 *  - Structuring   : just-below-threshold cash deposits/wires
 *  - Smurfing      : many small txns from many accounts to one beneficiary
 *  - Layering      : rapid pass-through to obscure origin (round amounts)
 *  - Round-tripping: funds returning to origin via intermediate hops
 *  - Velocity      : abnormal frequency vs. baseline
 *  - TBML          : trade-based money laundering (over/under-invoicing)
 */

import type { SupabaseTransaction } from '../types';

export type TypologyId =
  | 'structuring'
  | 'smurfing'
  | 'layering'
  | 'round_tripping'
  | 'velocity'
  | 'tbml';

export interface TypologyMeta {
  id: TypologyId;
  label: string;
  short: string;
  description: string;
  /** Tailwind classes for the chip */
  classes: string;
  /** Severity 1-5 */
  severity: number;
}

export const TYPOLOGY_META: Record<TypologyId, TypologyMeta> = {
  structuring: {
    id: 'structuring',
    label: 'Structuring',
    short: 'STRUCT',
    description:
      'Transactions deliberately split or sized just under reporting thresholds (e.g., $10k CTR) to avoid scrutiny.',
    classes: 'bg-red-50 text-red-700 border-red-200',
    severity: 5,
  },
  smurfing: {
    id: 'smurfing',
    label: 'Smurfing',
    short: 'SMURF',
    description:
      'Many small deposits from multiple accounts converging on a single beneficiary — classic placement layer.',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
    severity: 5,
  },
  layering: {
    id: 'layering',
    label: 'Layering',
    short: 'LAYER',
    description:
      'Rapid pass-through transfers (often round amounts) used to obscure the origin of illicit funds.',
    classes: 'bg-orange-50 text-orange-700 border-orange-200',
    severity: 4,
  },
  round_tripping: {
    id: 'round_tripping',
    label: 'Round-tripping',
    short: 'ROUND',
    description:
      'Funds leave and return to the originating party via intermediaries — typical of sham trade schemes.',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    severity: 4,
  },
  velocity: {
    id: 'velocity',
    label: 'Velocity anomaly',
    short: 'VEL',
    description:
      'Transaction frequency or volume departs significantly from the customer\u2019s 90-day baseline behaviour.',
    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    severity: 3,
  },
  tbml: {
    id: 'tbml',
    label: 'Trade-based ML',
    short: 'TBML',
    description:
      'Trade transactions with over/under-invoicing or mismatched goods/value — used to move value across borders.',
    classes: 'bg-purple-50 text-purple-700 border-purple-200',
    severity: 4,
  },
};

function fnv1a(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Classify a single transaction. Returns 0..2 typologies sorted by severity.
 * Deterministic — same tx -> same labels.
 */
export function classifyTransaction(tx: SupabaseTransaction): TypologyMeta[] {
  const out = new Set<TypologyId>();

  // ─── Structuring: amount just under classic reporting thresholds ─────────
  const usdEquiv =
    tx.currency === 'USD' ? tx.amount : tx.currency === 'EUR' ? tx.amount * 1.08 : tx.amount;
  if (usdEquiv >= 9000 && usdEquiv < 10000) out.add('structuring');
  if (usdEquiv >= 4500 && usdEquiv < 5000) out.add('structuring');

  // ─── Layering: very round amounts at high risk ───────────────────────────
  const isRound = tx.amount % 1000 === 0 && tx.amount >= 5000;
  if (isRound && tx.risk_score >= 70) out.add('layering');

  // ─── TBML: trade-related types ───────────────────────────────────────────
  const lowerType = (tx.transaction_type || '').toLowerCase();
  if (lowerType.includes('trade') || lowerType.includes('invoice') || lowerType.includes('lc')) {
    out.add('tbml');
  }

  // ─── Smurfing: small wire/deposit + flagged ──────────────────────────────
  if (tx.is_flagged && usdEquiv < 3000 && (lowerType.includes('deposit') || lowerType.includes('wire'))) {
    out.add('smurfing');
  }

  // ─── Round-tripping: deterministic from hash, biased high for risk>75 ────
  const seed = fnv1a(`rt-${tx.sender_account}-${tx.receiver_account}`);
  if (tx.risk_score >= 75 && seed % 5 === 0) out.add('round_tripping');

  // ─── Velocity: deterministic from hash, biased to flagged + high risk ────
  const vSeed = fnv1a(`v-${tx.id}`);
  if (tx.is_flagged && tx.risk_score >= 65 && vSeed % 4 === 0) out.add('velocity');

  // Fallback: nothing matched but flagged → at least Velocity
  if (out.size === 0 && tx.is_flagged) out.add('velocity');

  // Sort by severity desc, take top 2
  return Array.from(out)
    .map((id) => TYPOLOGY_META[id])
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 2);
}
