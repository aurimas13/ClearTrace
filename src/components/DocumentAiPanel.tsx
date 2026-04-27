import { useMemo, useState } from 'react';
import { FileScan, FileCheck2, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { getCustomerRiskProfile } from '../services/customerRisk';
import type { SupabaseTransaction } from '../types';

interface DocumentAiPanelProps {
  transaction: SupabaseTransaction;
}

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  /** Field is consistent with the transaction record */
  consistent: boolean;
  /** Optional discrepancy note */
  discrepancy?: string;
}

/**
 * Document AI panel.
 *
 * Mocks a vision-LLM pipeline ("DocumentAI") that ingests the wire-instruction
 * PDF / SWIFT MT103 attached to the transaction and extracts structured
 * fields, comparing each one to the booked record to flag tampering or
 * mismatch. Real systems use Donut, LayoutLMv3, or Anthropic/Gemini vision
 * models for this. The point here is to show the cross-modal AI angle that
 * regulators and CV-oriented hiring managers care about.
 */
export default function DocumentAiPanel({ transaction }: DocumentAiPanelProps) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const fields = useMemo<ExtractedField[]>(() => {
    const sp = getCustomerRiskProfile(transaction.sender_account);
    const rp = getCustomerRiskProfile(transaction.receiver_account);
    // Inject deterministic discrepancies in ~one third of high-risk txns to
    // create teachable moments.
    const introduceMismatch = transaction.risk_score >= 70 && transaction.id % 3 === 0;
    const swiftMessageType = transaction.amount > 100000 ? 'MT103' : 'MT202';
    return [
      {
        field: 'Document type',
        value: `${swiftMessageType} \u2014 Single Customer Credit Transfer`,
        confidence: 0.99,
        consistent: true,
      },
      {
        field: 'Ordering customer',
        value: sp.legalName,
        confidence: 0.97,
        consistent: !introduceMismatch,
        discrepancy: introduceMismatch
          ? 'Name on document differs from KYC record by 2 tokens (possible alias use).'
          : undefined,
      },
      {
        field: 'Beneficiary',
        value: rp.legalName,
        confidence: 0.96,
        consistent: true,
      },
      {
        field: 'Amount',
        value: `${transaction.amount.toLocaleString()} ${transaction.currency}`,
        confidence: 0.99,
        consistent: true,
      },
      {
        field: 'Value date',
        value: new Date(transaction.transaction_date).toLocaleDateString(),
        confidence: 0.95,
        consistent: true,
      },
      {
        field: 'Ordering institution BIC',
        value: `${sp.jurisdiction.code}BANK${(transaction.id % 90 + 10).toString()}XXX`,
        confidence: 0.92,
        consistent: sp.jurisdiction.fatf !== 'high_risk',
        discrepancy:
          sp.jurisdiction.fatf === 'high_risk'
            ? 'BIC routes through correspondent in FATF call-for-action jurisdiction.'
            : undefined,
      },
      {
        field: 'Purpose code',
        value:
          (transaction.transaction_type || '').toLowerCase().includes('trade')
            ? 'GDDS \u2014 Goods purchase / sale'
            : 'INTC \u2014 Intra-company transfer',
        confidence: 0.88,
        consistent: true,
      },
      {
        field: 'Field 70 \u2014 Remittance information',
        value: introduceMismatch
          ? 'INV-2026-' + (transaction.id * 7) + ' / consulting fee'
          : 'INV-2026-' + (transaction.id * 7),
        confidence: introduceMismatch ? 0.71 : 0.86,
        consistent: !introduceMismatch,
        discrepancy: introduceMismatch
          ? "Free-text mentions 'consulting fee' but Field 26T (purpose code) is GDDS — semantic mismatch."
          : undefined,
      },
    ];
  }, [transaction]);

  function startScan() {
    setScanning(true);
    setScanned(false);
    // Simulate vision-LLM latency
    window.setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 1100);
  }

  const discrepancies = fields.filter((f) => !f.consistent);

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FileScan className="w-4 h-4 text-violet-700" />
          <span className="text-xs uppercase tracking-wider font-bold text-slate-700">
            Document AI \u2014 Wire-instruction extraction
          </span>
        </div>
        {!scanning && !scanned && (
          <button
            onClick={startScan}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Run vision extraction
          </button>
        )}
        {scanning && (
          <span className="inline-flex items-center gap-1.5 text-xs text-violet-700 font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Vision-LLM parsing MT-format PDF…
          </span>
        )}
        {scanned && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <FileCheck2 className="w-3.5 h-3.5" />
            Extraction complete
          </span>
        )}
      </div>

      {scanned && (
        <div className="p-4 space-y-3">
          {discrepancies.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>{discrepancies.length} discrepanc{discrepancies.length === 1 ? 'y' : 'ies'}</strong>{' '}
                detected between source document and booked record. Review highlighted rows.
              </span>
            </div>
          )}

          <table className="w-full text-xs">
            <thead className="text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="text-left py-1.5">Field</th>
                <th className="text-left py-1.5">Extracted value</th>
                <th className="text-right py-1.5 w-20">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr
                  key={f.field}
                  className={`border-t border-slate-100 ${!f.consistent ? 'bg-amber-50/50' : ''}`}
                >
                  <td className="py-1.5 pr-3 text-slate-600 font-medium align-top">
                    {f.field}
                    {!f.consistent && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                        MISMATCH
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-3 text-slate-800 align-top">
                    <div className="font-mono">{f.value}</div>
                    {f.discrepancy && (
                      <div className="text-[11px] text-amber-700 mt-0.5">{f.discrepancy}</div>
                    )}
                  </td>
                  <td className="py-1.5 text-right tabular-nums align-top">
                    <span
                      className={`font-bold ${
                        f.confidence >= 0.95
                          ? 'text-emerald-600'
                          : f.confidence >= 0.85
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {(f.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!scanned && !scanning && (
        <div className="p-6 text-center text-xs text-slate-500">
          Click <span className="font-semibold text-violet-700">Run vision extraction</span> to parse
          the source SWIFT message PDF and cross-check every field against the booked transaction.
        </div>
      )}

      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 leading-relaxed">
        Vision-LLM (Donut + LayoutLMv3 ensemble) extracts structured fields from MT103/MT202 PDFs with
        layout-aware token alignment. Mismatches are surfaced for analyst review per BSA documentation
        retention rules.
      </div>
    </div>
  );
}
