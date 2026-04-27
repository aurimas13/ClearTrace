/**
 * Deterministic SHAP-style feature contribution generator.
 *
 * Real banks expose model feature attributions to analysts so dispositions are
 * defensible to regulators (cf. EU AI Act, OCC SR 11-7, BSA exam handbook).
 * Here we compute stable contribution values from transaction attributes so
 * the demo is reproducible and the bars feel "earned".
 *
 * Contributions are signed: positive = pushes toward suspicious, negative =
 * pushes toward benign. Sum (loosely) corresponds to log-odds delta.
 */

import type { SupabaseTransaction } from '../types';
import { getCustomerRiskProfile } from './customerRisk';
import { classifyTransaction } from './typology';

export interface FeatureContribution {
  feature: string;
  /** Positive = increases suspicion, negative = decreases. Magnitude ~0..1 */
  value: number;
  rationale: string;
}

export interface Explanation {
  txId: number;
  baseRate: number; // baseline P(suspicious) before any features, e.g. 0.05
  finalScore: number; // 0..1
  contributions: FeatureContribution[];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function explainTransaction(tx: SupabaseTransaction): Explanation {
  const baseRate = 0.05;
  const sender = getCustomerRiskProfile(tx.sender_account);
  const receiver = getCustomerRiskProfile(tx.receiver_account);
  const typologies = classifyTransaction(tx);

  const contribs: FeatureContribution[] = [];

  // 1. Risk score (largest single feature)
  const riskNorm = (tx.risk_score - 50) / 50; // -1..+1
  contribs.push({
    feature: 'Model risk score',
    value: clamp(riskNorm * 0.6, -0.6, 0.6),
    rationale: `Ensemble model assigned ${tx.risk_score}/100; the population mean is 50.`,
  });

  // 2. Jurisdiction risk
  const jRank = (s: 'standard' | 'monitored' | 'high_risk') =>
    s === 'high_risk' ? 0.45 : s === 'monitored' ? 0.22 : -0.05;
  const jurContrib = Math.max(jRank(sender.jurisdiction.fatf), jRank(receiver.jurisdiction.fatf));
  contribs.push({
    feature: 'Counterparty jurisdiction',
    value: jurContrib,
    rationale:
      sender.jurisdiction.fatf !== 'standard'
        ? `Sender domiciled in ${sender.jurisdiction.name} (FATF: ${sender.jurisdiction.fatf.replace('_', ' ')}).`
        : receiver.jurisdiction.fatf !== 'standard'
        ? `Receiver domiciled in ${receiver.jurisdiction.name} (FATF: ${receiver.jurisdiction.fatf.replace('_', ' ')}).`
        : 'Both counterparties in low-risk jurisdictions.',
  });

  // 3. Amount anomaly (just-under-threshold)
  const usd =
    tx.currency === 'USD' ? tx.amount : tx.currency === 'EUR' ? tx.amount * 1.08 : tx.amount;
  const justUnder = (usd >= 9000 && usd < 10000) || (usd >= 4500 && usd < 5000);
  contribs.push({
    feature: 'Amount vs. reporting threshold',
    value: justUnder ? 0.35 : usd > 50000 ? 0.18 : -0.04,
    rationale: justUnder
      ? `${usd.toFixed(0)} USD-equivalent sits just below a CTR/SAR reporting threshold.`
      : usd > 50000
      ? `Amount of ${usd.toFixed(0)} USD-equivalent is in the top decile for this customer segment.`
      : `Amount within normal corridor for this customer segment.`,
  });

  // 4. Customer type / shell signal
  const shellLike = sender.customerType === 'shell_suspect' || receiver.customerType === 'shell_suspect';
  contribs.push({
    feature: 'Counterparty entity type',
    value: shellLike ? 0.28 : sender.customerType === 'trust' || receiver.customerType === 'trust' ? 0.12 : -0.02,
    rationale: shellLike
      ? 'At least one counterparty matches shell-company onboarding heuristics.'
      : 'Both counterparties are established entities with verified beneficial ownership.',
  });

  // 5. Beneficial owner PEP
  const hasPep =
    sender.beneficialOwners.some((b) => b.pep) || receiver.beneficialOwners.some((b) => b.pep);
  contribs.push({
    feature: 'PEP exposure (beneficial owner)',
    value: hasPep ? 0.22 : -0.03,
    rationale: hasPep
      ? 'A politically-exposed person appears in the beneficial-owner chain (>10% stake).'
      : 'No PEP identified in beneficial-owner chains.',
  });

  // 6. Typology presence
  if (typologies.length > 0) {
    contribs.push({
      feature: 'Behavioural typology match',
      value: 0.15 * typologies.length,
      rationale: `Detected typologies: ${typologies.map((t) => t.label).join(', ')}.`,
    });
  } else {
    contribs.push({
      feature: 'Behavioural typology match',
      value: -0.05,
      rationale: 'No AML typology rules triggered.',
    });
  }

  // 7. Customer relationship age (synthetic)
  const ageDays =
    (Date.now() - new Date(sender.lastReviewIso).getTime()) / (1000 * 60 * 60 * 24);
  contribs.push({
    feature: 'KYC review recency',
    value: ageDays > 270 ? 0.08 : -0.04,
    rationale:
      ageDays > 270
        ? `Sender KYC was last refreshed ${Math.floor(ageDays)} days ago — outside policy window.`
        : `Sender KYC refreshed ${Math.floor(ageDays)} days ago — within policy.`,
  });

  // Aggregate to final score (sigmoid of base + sum)
  const sum = contribs.reduce((s, c) => s + c.value, 0);
  const logit = Math.log(baseRate / (1 - baseRate)) + sum;
  const finalScore = 1 / (1 + Math.exp(-logit));

  // Sort by absolute contribution desc
  contribs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return {
    txId: tx.id,
    baseRate,
    finalScore,
    contributions: contribs,
  };
}
