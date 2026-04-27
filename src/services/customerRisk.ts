/**
 * Deterministic customer risk profile generator.
 *
 * In production this is fed by KYC/CIP, beneficial ownership registries, and
 * the bank's CRR engine. Here we hash the account string into a stable profile
 * so the demo is reproducible.
 */

import type { SupabaseTransaction } from '../types';

export type KycTier = 'tier_1' | 'tier_2' | 'tier_3';
export type FatfStatus = 'standard' | 'monitored' | 'high_risk';
export type CustomerType = 'individual' | 'corporate' | 'trust' | 'shell_suspect';

export interface Jurisdiction {
  code: string; // ISO-2
  name: string;
  /** Approx country centroid lat/lng for the geo map */
  lat: number;
  lng: number;
  fatf: FatfStatus;
}

export interface BeneficialOwner {
  name: string;
  ownershipPct: number;
  pep: boolean;
  jurisdictionCode: string;
}

export interface CustomerRiskProfile {
  account: string;
  customerType: CustomerType;
  legalName: string;
  kycTier: KycTier;
  /** 0-100 internal CRR */
  crr: number;
  jurisdiction: Jurisdiction;
  beneficialOwners: BeneficialOwner[];
  /** ISO date of last KYC review */
  lastReviewIso: string;
  /** Daily transaction volume samples (last 90 days) */
  history90d: number[];
  /** Concentration risk: top counterparty as % of total volume */
  topCounterpartyPct: number;
  notes: string;
}

// ─── Jurisdiction catalogue (synthetic but realistic) ───────────────────────

export const JURISDICTIONS: Jurisdiction[] = [
  // Standard
  { code: 'US', name: 'United States',  lat: 38,    lng: -97,   fatf: 'standard' },
  { code: 'GB', name: 'United Kingdom', lat: 54,    lng: -2,    fatf: 'standard' },
  { code: 'DE', name: 'Germany',        lat: 51,    lng: 10,    fatf: 'standard' },
  { code: 'FR', name: 'France',         lat: 46,    lng: 2,     fatf: 'standard' },
  { code: 'NL', name: 'Netherlands',    lat: 52,    lng: 5,     fatf: 'standard' },
  { code: 'CH', name: 'Switzerland',    lat: 46.8,  lng: 8.2,   fatf: 'standard' },
  { code: 'SG', name: 'Singapore',      lat: 1.35,  lng: 103.8, fatf: 'standard' },
  { code: 'JP', name: 'Japan',          lat: 36,    lng: 138,   fatf: 'standard' },
  { code: 'CA', name: 'Canada',         lat: 56,    lng: -106,  fatf: 'standard' },
  { code: 'AU', name: 'Australia',      lat: -25,   lng: 134,   fatf: 'standard' },
  { code: 'LT', name: 'Lithuania',      lat: 55,    lng: 24,    fatf: 'standard' },
  // Monitored (FATF grey list \u2013 increased monitoring)
  { code: 'AE', name: 'UAE',            lat: 24,    lng: 54,    fatf: 'monitored' },
  { code: 'TR', name: 'T\u00fcrkiye',           lat: 39,    lng: 35,    fatf: 'monitored' },
  { code: 'CY', name: 'Cyprus',         lat: 35,    lng: 33,    fatf: 'monitored' },
  { code: 'PA', name: 'Panama',         lat: 9,     lng: -80,   fatf: 'monitored' },
  { code: 'KY', name: 'Cayman Islands', lat: 19.3,  lng: -81.2, fatf: 'monitored' },
  { code: 'VG', name: 'BVI',            lat: 18.4,  lng: -64.6, fatf: 'monitored' },
  // High-risk (FATF black list \u2013 call for action)
  { code: 'IR', name: 'Iran',           lat: 32,    lng: 53,    fatf: 'high_risk' },
  { code: 'KP', name: 'DPRK',           lat: 40,    lng: 127,   fatf: 'high_risk' },
  { code: 'MM', name: 'Myanmar',        lat: 22,    lng: 96,    fatf: 'high_risk' },
];

const J_BY_CODE = new Map(JURISDICTIONS.map((j) => [j.code, j] as const));

function fnv1a(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Account string \u2192 stable jurisdiction. Suspicious keywords push toward
// monitored/high-risk lists, mimicking a real bank's onboarding heuristics.
function pickJurisdiction(account: string, r: () => number): Jurisdiction {
  const lower = account.toLowerCase();
  const offshoreKw = ['cayman', 'bvi', 'panama', 'cyprus', 'offshore', 'shell', 'trust', 'holdings'];
  const sanctionedKw = ['nk', 'iran', 'tehran', 'dprk', 'myanmar'];
  if (sanctionedKw.some((k) => lower.includes(k)) || r() > 0.97) {
    const high = JURISDICTIONS.filter((j) => j.fatf === 'high_risk');
    return high[Math.floor(r() * high.length)];
  }
  if (offshoreKw.some((k) => lower.includes(k)) || r() > 0.82) {
    const mon = JURISDICTIONS.filter((j) => j.fatf === 'monitored');
    return mon[Math.floor(r() * mon.length)];
  }
  const std = JURISDICTIONS.filter((j) => j.fatf === 'standard');
  return std[Math.floor(r() * std.length)];
}

const CORP_SUFFIXES = ['Holdings Ltd', 'Trading SA', 'Capital LLC', 'Group GmbH', 'Partners LP', 'Industries Inc'];
const FIRST_NAMES = ['James', 'Maria', 'Chen', 'Aisha', 'Olga', 'Tomas', 'Priya', 'Marco', 'Yusuf', 'Anya'];
const LAST_NAMES = ['Carter', 'Schmidt', 'Wong', 'Khan', 'Petrov', 'Silva', 'Mehta', 'Russo', 'Demir', 'Volkov'];

export function getCustomerRiskProfile(account: string): CustomerRiskProfile {
  const seed = fnv1a(account);
  const r = rng(seed);
  const lower = account.toLowerCase();

  // Customer type
  const looksCorporate = /[a-z]{3,}/i.test(account) && !/^[a-z]{2}\d/i.test(account);
  const looksShell =
    ['shell', 'holdings', 'trust', 'capital', 'offshore', 'cayman', 'bvi', 'panama'].some((k) =>
      lower.includes(k)
    );
  const customerType: CustomerType = looksShell
    ? 'shell_suspect'
    : looksCorporate
    ? r() > 0.5
      ? 'corporate'
      : 'trust'
    : 'individual';

  // Legal name
  let legalName: string;
  if (customerType === 'individual') {
    legalName = `${FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]} ${
      LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]
    }`;
  } else {
    const root =
      account.replace(/[^a-zA-Z]/g, '').slice(0, 8) ||
      `${FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]}`;
    legalName = `${root.charAt(0).toUpperCase()}${root.slice(1).toLowerCase()} ${
      CORP_SUFFIXES[Math.floor(r() * CORP_SUFFIXES.length)]
    }`;
  }

  const jurisdiction = pickJurisdiction(account, r);

  // KYC tier: high-risk jurisdiction + shell -> Tier 3 (enhanced due diligence)
  let kycTier: KycTier = 'tier_1';
  if (jurisdiction.fatf === 'high_risk' || customerType === 'shell_suspect') kycTier = 'tier_3';
  else if (jurisdiction.fatf === 'monitored' || customerType === 'trust') kycTier = 'tier_2';

  // CRR (0-100), biased by jurisdiction + type
  let crr = Math.floor(r() * 30) + 20;
  if (jurisdiction.fatf === 'monitored') crr += 25;
  if (jurisdiction.fatf === 'high_risk') crr += 50;
  if (customerType === 'shell_suspect') crr += 20;
  if (customerType === 'trust') crr += 10;
  crr = Math.min(99, crr);

  // Beneficial owners
  const ownerCount = customerType === 'individual' ? 1 : 1 + Math.floor(r() * 3);
  const beneficialOwners: BeneficialOwner[] = [];
  let remaining = 100;
  for (let i = 0; i < ownerCount; i++) {
    const last = i === ownerCount - 1;
    const pct = last ? remaining : Math.max(10, Math.floor(remaining * (0.3 + r() * 0.4)));
    remaining -= pct;
    const oJur = pickJurisdiction(account + i, r);
    beneficialOwners.push({
      name: `${FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]} ${
        LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]
      }`,
      ownershipPct: pct,
      pep: r() > 0.93,
      jurisdictionCode: oJur.code,
    });
  }

  // 90-day daily volume history (loose log-normal-ish)
  const history90d: number[] = [];
  let baseline = 5000 + Math.floor(r() * 50000);
  for (let i = 0; i < 90; i++) {
    const noise = 0.6 + r() * 0.8;
    const spike = r() > 0.97 ? 3 + r() * 4 : 1;
    history90d.push(Math.max(0, Math.floor(baseline * noise * spike)));
    baseline = baseline * (0.97 + r() * 0.06);
  }

  const topCounterpartyPct = Math.floor(20 + r() * 70);
  const lastReviewIso = new Date(
    Date.now() - Math.floor(r() * 365) * 24 * 60 * 60 * 1000
  ).toISOString();

  const notes = customerType === 'shell_suspect'
    ? 'Account name pattern matches shell-company heuristics; enhanced due diligence applied.'
    : jurisdiction.fatf === 'high_risk'
    ? 'Counterparty domiciled in FATF call-for-action jurisdiction; transaction monitoring uplifted.'
    : jurisdiction.fatf === 'monitored'
    ? 'Counterparty under FATF increased monitoring; standard EDD applied.'
    : 'Standard customer due diligence on file. No outstanding KYC remediation actions.';

  return {
    account,
    customerType,
    legalName,
    kycTier,
    crr,
    jurisdiction,
    beneficialOwners,
    lastReviewIso,
    history90d,
    topCounterpartyPct,
    notes,
  };
}

export function getJurisdictionByCode(code: string): Jurisdiction | undefined {
  return J_BY_CODE.get(code);
}

// ─── Bulk geo-corridor extraction for the world map ────────────────────────

export interface RiskCorridor {
  fromCode: string;
  toCode: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  count: number;
  totalAmount: number;
  highestRisk: number;
  worstFatf: FatfStatus;
}

export function buildRiskCorridors(transactions: SupabaseTransaction[]): RiskCorridor[] {
  const map = new Map<string, RiskCorridor>();
  for (const tx of transactions) {
    const sp = getCustomerRiskProfile(tx.sender_account);
    const rp = getCustomerRiskProfile(tx.receiver_account);
    if (sp.jurisdiction.code === rp.jurisdiction.code) continue;
    const key = `${sp.jurisdiction.code}->${rp.jurisdiction.code}`;
    const fatfRank = (s: FatfStatus) => (s === 'high_risk' ? 2 : s === 'monitored' ? 1 : 0);
    const existing = map.get(key);
    const worstFatf =
      fatfRank(sp.jurisdiction.fatf) >= fatfRank(rp.jurisdiction.fatf)
        ? sp.jurisdiction.fatf
        : rp.jurisdiction.fatf;
    if (existing) {
      existing.count += 1;
      existing.totalAmount += tx.amount;
      existing.highestRisk = Math.max(existing.highestRisk, tx.risk_score);
      if (fatfRank(worstFatf) > fatfRank(existing.worstFatf)) existing.worstFatf = worstFatf;
    } else {
      map.set(key, {
        fromCode: sp.jurisdiction.code,
        toCode: rp.jurisdiction.code,
        fromLat: sp.jurisdiction.lat,
        fromLng: sp.jurisdiction.lng,
        toLat: rp.jurisdiction.lat,
        toLng: rp.jurisdiction.lng,
        count: 1,
        totalAmount: tx.amount,
        highestRisk: tx.risk_score,
        worstFatf,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.highestRisk - a.highestRisk);
}
