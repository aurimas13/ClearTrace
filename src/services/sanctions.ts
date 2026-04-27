/**
 * Deterministic synthetic sanctions screening.
 *
 * In production this is a real call to OFAC / EU consolidated / UN lists with
 * fuzzy name-matching + adverse media. Here we generate stable results from
 * the account string so the demo is reproducible: the same account always
 * yields the same screening result.
 */

export type SanctionsListId = 'OFAC_SDN' | 'EU_CONSOLIDATED' | 'UN_SC' | 'UK_HMT';

export interface SanctionsListResult {
  list: SanctionsListId;
  listLabel: string;
  status: 'clear' | 'review' | 'match';
  /** 0-100 fuzzy name-match similarity */
  matchScore: number;
  notes?: string;
}

export interface SanctionsScreening {
  account: string;
  /** Worst status across all lists */
  overall: 'clear' | 'review' | 'match';
  results: SanctionsListResult[];
  pep: boolean; // politically exposed person
  adverseMedia: number; // count of adverse media hits
  lastScreened: string; // ISO timestamp
}

const LIST_LABELS: Record<SanctionsListId, string> = {
  OFAC_SDN: 'OFAC SDN',
  EU_CONSOLIDATED: 'EU Consolidated',
  UN_SC: 'UN Security Council',
  UK_HMT: 'UK HM Treasury',
};

/**
 * Hash a string into a stable 32-bit unsigned int.
 * Used so the same account always gets the same screening result.
 */
function hash(str: string): number {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function pseudoRandom(seed: number): number {
  // mulberry32-ish
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function screenAccount(account: string): SanctionsScreening {
  const seed = hash(account);
  const r1 = pseudoRandom(seed);
  const r2 = pseudoRandom(seed + 7);
  const r3 = pseudoRandom(seed + 13);
  const r4 = pseudoRandom(seed + 23);

  // Account-specific risk: ~7% have a sanctions match, ~12% need review,
  // ~5% are PEPs, adverse-media follows risk.
  const baseRisk = r1;
  const lowerName = account.toLowerCase();
  // Simple keyword bumps so accounts that look "shell-like" trend higher
  const suspiciousKeywords = [
    'shell',
    'offshore',
    'cayman',
    'caribbean',
    'bvi',
    'panama',
    'cyprus',
    'trust',
    'holdings',
    'global',
    'capital',
  ];
  let bump = 0;
  for (const kw of suspiciousKeywords) {
    if (lowerName.includes(kw)) bump += 0.08;
  }
  const risk = Math.min(1, baseRisk + bump);

  let overall: SanctionsScreening['overall'] = 'clear';
  if (risk > 0.93) overall = 'match';
  else if (risk > 0.78) overall = 'review';

  // Generate per-list results. Most lists are clear; the "worst" list carries
  // the overall status.
  const lists: SanctionsListId[] = ['OFAC_SDN', 'EU_CONSOLIDATED', 'UN_SC', 'UK_HMT'];
  const worstIdx = Math.floor(r2 * lists.length);
  const results: SanctionsListResult[] = lists.map((list, i) => {
    if (overall !== 'clear' && i === worstIdx) {
      const score = overall === 'match' ? 88 + Math.floor(r3 * 12) : 62 + Math.floor(r3 * 18);
      return {
        list,
        listLabel: LIST_LABELS[list],
        status: overall,
        matchScore: score,
        notes:
          overall === 'match'
            ? `Strong name similarity (${score}%) to a designated entity`
            : `Possible name similarity (${score}%) — manual review recommended`,
      };
    }
    return {
      list,
      listLabel: LIST_LABELS[list],
      status: 'clear',
      matchScore: Math.floor(r4 * 25), // 0-25 noise
    };
  });

  const pep = r3 > 0.95;
  const adverseMedia = overall === 'match' ? Math.floor(r4 * 8) + 3 : overall === 'review' ? Math.floor(r4 * 4) : 0;

  return {
    account,
    overall,
    results,
    pep,
    adverseMedia,
    lastScreened: new Date().toISOString(),
  };
}

/** Combine sender + receiver screening into a single transaction-level result. */
export function screenTransaction(senderAccount: string, receiverAccount: string) {
  const sender = screenAccount(senderAccount);
  const receiver = screenAccount(receiverAccount);
  const rank = (s: 'clear' | 'review' | 'match') => (s === 'match' ? 2 : s === 'review' ? 1 : 0);
  const overall =
    rank(sender.overall) >= rank(receiver.overall) ? sender.overall : receiver.overall;
  return { sender, receiver, overall };
}
