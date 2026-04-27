import { useEffect, useMemo } from 'react';
import {
  X,
  Building2,
  User,
  Globe2,
  ShieldCheck,
  Crown,
  Hash,
  CalendarClock,
  TrendingUp,
} from 'lucide-react';
import { getCustomerRiskProfile, type FatfStatus } from '../services/customerRisk';
import type { SupabaseTransaction } from '../types';
import Sparkline from './Sparkline';
import { screenAccount } from '../services/sanctions';

interface CustomerRiskDrawerProps {
  account: string | null;
  transactions: SupabaseTransaction[];
  onClose: () => void;
}

const FATF_META: Record<FatfStatus, { label: string; classes: string }> = {
  standard: { label: 'Standard', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  monitored: { label: 'Monitored (FATF grey list)', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  high_risk: { label: 'High-risk (FATF call for action)', classes: 'bg-red-50 text-red-700 border-red-200' },
};

const KYC_META = {
  tier_1: { label: 'Tier 1 — Simplified DD', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  tier_2: { label: 'Tier 2 — Standard DD', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  tier_3: { label: 'Tier 3 — Enhanced DD', classes: 'bg-red-50 text-red-700 border-red-200' },
} as const;

export default function CustomerRiskDrawer({
  account,
  transactions,
  onClose,
}: CustomerRiskDrawerProps) {
  // Lock body scroll
  useEffect(() => {
    if (!account) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [account]);

  // ESC to close
  useEffect(() => {
    if (!account) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [account, onClose]);

  const profile = useMemo(() => (account ? getCustomerRiskProfile(account) : null), [account]);
  const sanctions = useMemo(() => (account ? screenAccount(account) : null), [account]);

  const involvedTxns = useMemo(() => {
    if (!account) return [] as SupabaseTransaction[];
    return transactions
      .filter((t) => t.sender_account === account || t.receiver_account === account)
      .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
      .slice(0, 10);
  }, [account, transactions]);

  if (!account || !profile) return null;

  const fatf = FATF_META[profile.jurisdiction.fatf];
  const kyc = KYC_META[profile.kycTier];
  const TypeIcon = profile.customerType === 'individual' ? User : Building2;

  const totalSent = involvedTxns
    .filter((t) => t.sender_account === account)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = involvedTxns
    .filter((t) => t.receiver_account === account)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="relative w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-toast-in"
        role="dialog"
        aria-label="Customer risk profile"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                <TypeIcon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  {profile.customerType === 'shell_suspect'
                    ? 'Shell-suspect entity'
                    : profile.customerType === 'corporate'
                    ? 'Corporate'
                    : profile.customerType === 'trust'
                    ? 'Trust / fiduciary'
                    : 'Individual'}
                </p>
                <h3 className="text-base font-bold text-slate-900 truncate">{profile.legalName}</h3>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-600 truncate">{profile.account}</p>
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
          {/* Risk header bar */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                Customer Risk Rating (CRR)
              </span>
              <span
                className={`text-3xl font-extrabold tabular-nums ${
                  profile.crr >= 80
                    ? 'text-red-600'
                    : profile.crr >= 60
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {profile.crr}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  profile.crr >= 80
                    ? 'bg-red-500'
                    : profile.crr >= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${profile.crr}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold ${kyc.classes}`}
              >
                <ShieldCheck className="w-3 h-3" />
                {kyc.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold ${fatf.classes}`}
              >
                <Globe2 className="w-3 h-3" />
                {fatf.label}
              </span>
            </div>
          </div>

          {/* Jurisdiction */}
          <Section icon={Globe2} title="Jurisdiction">
            <div className="text-sm text-slate-800 font-semibold">
              {profile.jurisdiction.name}{' '}
              <span className="text-xs text-slate-500 font-mono">({profile.jurisdiction.code})</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{profile.notes}</p>
          </Section>

          {/* Beneficial owners */}
          <Section icon={Crown} title="Beneficial owner chain">
            <ul className="space-y-1.5">
              {profile.beneficialOwners.map((b, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 truncate">{b.name}</span>
                      {b.pep && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                          PEP
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{b.jurisdictionCode}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700 tabular-nums">{b.ownershipPct}%</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 90-day volume */}
          <Section icon={TrendingUp} title="90-day daily volume">
            <Sparkline
              values={profile.history90d}
              width={350}
              height={64}
              stroke="#2563eb"
              fill="rgba(37, 99, 235, 0.12)"
              className="w-full"
            />
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <Stat label="Mean (USD)" value={Math.round(profile.history90d.reduce((s, x) => s + x, 0) / profile.history90d.length).toLocaleString()} />
              <Stat label="Peak day" value={Math.max(...profile.history90d).toLocaleString()} />
              <Stat label="Top counterparty" value={`${profile.topCounterpartyPct}%`} />
            </div>
          </Section>

          {/* Sanctions snapshot */}
          {sanctions && (
            <Section icon={ShieldCheck} title="Sanctions screening (live)">
              <div
                className={`px-3 py-2 rounded-md border text-xs font-semibold ${
                  sanctions.overall === 'match'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : sanctions.overall === 'review'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                Overall:{' '}
                {sanctions.overall === 'match'
                  ? 'Confirmed match'
                  : sanctions.overall === 'review'
                  ? 'Possible match — review'
                  : 'Clear'}
              </div>
              {sanctions.pep && (
                <p className="text-[11px] text-amber-700 mt-1">PEP exposure detected.</p>
              )}
              {sanctions.adverseMedia > 0 && (
                <p className="text-[11px] text-slate-600 mt-1">
                  {sanctions.adverseMedia} adverse media hits in last 24 months.
                </p>
              )}
            </Section>
          )}

          {/* Recent activity */}
          <Section icon={Hash} title="Recent activity (last 10)">
            <table className="w-full text-xs">
              <thead className="text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="text-left py-1">Date</th>
                  <th className="text-left py-1">Direction</th>
                  <th className="text-right py-1">Amount</th>
                  <th className="text-right py-1">Risk</th>
                </tr>
              </thead>
              <tbody>
                {involvedTxns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-2 text-slate-500 italic text-center">
                      No transactions in current dataset.
                    </td>
                  </tr>
                )}
                {involvedTxns.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="py-1.5 text-slate-600 whitespace-nowrap">
                      {new Date(t.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-1.5 text-slate-700 font-medium">
                      {t.sender_account === account ? 'OUT' : 'IN'}
                    </td>
                    <td className="py-1.5 text-right font-semibold text-slate-800 tabular-nums">
                      {t.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t.currency}
                    </td>
                    <td
                      className={`py-1.5 text-right font-bold tabular-nums ${
                        t.risk_score >= 80
                          ? 'text-red-600'
                          : t.risk_score >= 60
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {t.risk_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {involvedTxns.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Stat label="Total OUT" value={totalSent.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <Stat label="Total IN" value={totalReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              </div>
            )}
          </Section>

          {/* KYC review */}
          <Section icon={CalendarClock} title="KYC review">
            <p className="text-xs text-slate-600">
              Last refreshed:{' '}
              <span className="font-semibold text-slate-800">
                {new Date(profile.lastReviewIso).toLocaleDateString()}
              </span>
            </p>
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-sm font-bold text-slate-800 tabular-nums">{value}</p>
    </div>
  );
}
