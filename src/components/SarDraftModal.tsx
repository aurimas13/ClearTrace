import { useState, useMemo } from 'react';
import { X, FileWarning, Copy, Download, Check, Loader2 } from 'lucide-react';
import type { SupabaseTransaction, Investigation } from '../types';

interface SarDraftModalProps {
  investigation: Investigation;
  transaction: SupabaseTransaction;
  relatedTransactions: SupabaseTransaction[];
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

/**
 * FinCEN-style SAR (Suspicious Activity Report) draft modal.
 * Mirrors the structure of FinCEN Form 111 / FCA SAR submission:
 *   1. Subject Information
 *   2. Suspicious Activity Information
 *   3. Narrative
 *   4. Supporting Transactions
 */
export default function SarDraftModal({
  investigation,
  transaction,
  relatedTransactions,
  onCancel,
  onConfirm,
}: SarDraftModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const caseId = `INV-${String(investigation.id).padStart(4, '0')}`;
  const sarRef = `SAR-${new Date().getFullYear()}-${String(investigation.id).padStart(6, '0')}`;

  const suspiciousActivityTypes = useMemo(() => {
    const types: string[] = [];
    if (transaction.risk_score >= 80) types.push('Layering / Rapid movement of funds');
    if (transaction.amount >= 10000) types.push('Structuring (potential CTR avoidance)');
    if (transaction.transaction_type?.toUpperCase().includes('WIRE')) types.push('Wire fraud / Cross-border transfer');
    if (transaction.is_flagged) types.push('Behavioural anomaly (rule-based screening)');
    if (types.length === 0) types.push('Suspicious activity \u2014 unspecified');
    return types;
  }, [transaction]);

  const narrative = useMemo(() => {
    const parts: string[] = [];
    parts.push(
      `On ${new Date(transaction.transaction_date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}, the subject account ${transaction.sender_account} initiated a ${transaction.transaction_type
        .replace(/_/g, ' ')
        .toLowerCase()} of ${transaction.amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${transaction.currency} to ${transaction.receiver_account}.`
    );
    parts.push(
      `Automated risk scoring assigned this transaction a value of ${transaction.risk_score}/100${
        transaction.is_flagged ? ', and the activity was independently flagged by behavioural screening rules' : ''
      }.`
    );
    parts.push(`AI investigation summary: ${investigation.ai_summary}`);
    if (relatedTransactions.length > 0) {
      parts.push(
        `Network analysis identified ${relatedTransactions.length} additional related transaction${
          relatedTransactions.length === 1 ? '' : 's'
        } involving the same counterparties, suggesting a potential pattern of activity.`
      );
    }
    parts.push(
      'Based on the above, the institution is filing this Suspicious Activity Report in accordance with applicable AML regulations and reserves the right to provide additional documentation upon request.'
    );
    return parts.join('\n\n');
  }, [transaction, investigation, relatedTransactions]);

  function buildPlaintext() {
    return [
      `SUSPICIOUS ACTIVITY REPORT (DRAFT)`,
      `SAR Reference: ${sarRef}`,
      `Internal Case: ${caseId}`,
      `Filed: ${new Date().toISOString()}`,
      ``,
      `1. SUBJECT INFORMATION`,
      `   Account: ${transaction.sender_account}`,
      `   Counterparty: ${transaction.receiver_account}`,
      ``,
      `2. SUSPICIOUS ACTIVITY`,
      `   Date: ${transaction.transaction_date}`,
      `   Amount: ${transaction.amount.toLocaleString()} ${transaction.currency}`,
      `   Type: ${transaction.transaction_type}`,
      `   Risk Score: ${transaction.risk_score}/100`,
      `   Auto-flagged: ${transaction.is_flagged ? 'Yes' : 'No'}`,
      `   Activity types: ${suspiciousActivityTypes.join('; ')}`,
      ``,
      `3. NARRATIVE`,
      narrative,
      ``,
      `4. SUPPORTING TRANSACTIONS`,
      ...(relatedTransactions.length === 0
        ? ['   (none)']
        : relatedTransactions.map(
            (t) =>
              `   #${t.id} ${t.transaction_date} ${t.amount.toLocaleString()} ${t.currency} ${t.sender_account} -> ${t.receiver_account} risk=${t.risk_score}`
          )),
    ].join('\n');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildPlaintext());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function handleDownload() {
    const blob = new Blob([buildPlaintext()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sarRef}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-red-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-sm">
              <FileWarning className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-base">Suspicious Activity Report — Draft</h3>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {sarRef} · Case {caseId}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 1. Subject */}
          <Section title="1. Subject Information">
            <Field label="Primary Account">
              <span className="font-mono text-slate-900">{transaction.sender_account}</span>
            </Field>
            <Field label="Counterparty">
              <span className="font-mono text-slate-900">{transaction.receiver_account}</span>
            </Field>
          </Section>

          {/* 2. Activity */}
          <Section title="2. Suspicious Activity">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                {new Date(transaction.transaction_date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Field>
              <Field label="Amount">
                <span className="font-semibold text-slate-900">
                  {transaction.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {transaction.currency}
                </span>
              </Field>
              <Field label="Transaction Type">{transaction.transaction_type}</Field>
              <Field label="Risk Score">
                <span
                  className={`font-bold ${
                    transaction.risk_score >= 80
                      ? 'text-red-600'
                      : transaction.risk_score >= 60
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {transaction.risk_score}/100
                </span>
              </Field>
            </div>
            <div className="mt-3">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                Activity types
              </div>
              <div className="flex flex-wrap gap-2">
                {suspiciousActivityTypes.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Section>

          {/* 3. Narrative */}
          <Section title="3. Narrative">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {narrative}
            </div>
          </Section>

          {/* 4. Supporting */}
          <Section title={`4. Supporting Transactions (${relatedTransactions.length})`}>
            {relatedTransactions.length === 0 ? (
              <p className="text-sm text-slate-500 italic">
                No additional related transactions identified in network analysis.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">ID</th>
                      <th className="px-3 py-2 text-left font-semibold">Date</th>
                      <th className="px-3 py-2 text-right font-semibold">Amount</th>
                      <th className="px-3 py-2 text-center font-semibold">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatedTransactions.slice(0, 8).map((t) => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 font-mono text-blue-700 font-semibold">{t.id}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {new Date(t.transaction_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-900">
                          {t.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}{' '}
                          {t.currency}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`font-bold ${
                              t.risk_score >= 80
                                ? 'text-red-600'
                                : t.risk_score >= 60
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {t.risk_score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Filing…
                </>
              ) : (
                <>
                  <FileWarning className="w-4 h-4" />
                  Confirm File SAR
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-sm">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-0.5">{label}</div>
      <div className="text-slate-700">{children}</div>
    </div>
  );
}
