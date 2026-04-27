/**
 * CSV + printable case-file exporters (PDF via window.print()).
 *
 * Browser-only; no server dependencies. Generates real downloadable files
 * that an examiner could attach to an audit packet.
 */

import type { Investigation, SupabaseTransaction } from '../types';
import { getCustomerRiskProfile } from './customerRisk';
import { classifyTransaction } from './typology';
import { getAuditLog, getAssignee } from './sessionStore';
import { screenAccount } from './sanctions';
import { explainTransaction } from './explainability';

// ─── CSV ─────────────────────────────────────────────────────────────────────

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const head = headers.map(csvEscape).join(',');
  const body = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  return `${head}\n${body}`;
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportTransactionsCsv(transactions: SupabaseTransaction[]) {
  const headers = [
    'tx_id',
    'date',
    'type',
    'sender_account',
    'sender_legal_name',
    'sender_jurisdiction',
    'sender_fatf',
    'receiver_account',
    'receiver_legal_name',
    'receiver_jurisdiction',
    'receiver_fatf',
    'amount',
    'currency',
    'risk_score',
    'flagged',
    'typologies',
    'sender_sanctions',
    'receiver_sanctions',
  ];
  const rows = transactions.map((t) => {
    const sp = getCustomerRiskProfile(t.sender_account);
    const rp = getCustomerRiskProfile(t.receiver_account);
    const tys = classifyTransaction(t).map((x) => x.label).join(' | ');
    const ss = screenAccount(t.sender_account);
    const rs = screenAccount(t.receiver_account);
    return [
      t.id,
      t.transaction_date,
      t.transaction_type,
      t.sender_account,
      sp.legalName,
      sp.jurisdiction.code,
      sp.jurisdiction.fatf,
      t.receiver_account,
      rp.legalName,
      rp.jurisdiction.code,
      rp.jurisdiction.fatf,
      t.amount.toFixed(2),
      t.currency,
      t.risk_score,
      t.is_flagged,
      tys,
      ss.overall,
      rs.overall,
    ];
  });
  const csv = rowsToCsv(headers, rows);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  downloadFile(`cleartrace-alerts-${stamp}.csv`, csv, 'text/csv');
}

export function exportInvestigationsCsv(
  investigations: Investigation[],
  transactions: SupabaseTransaction[]
) {
  const txById = new Map(transactions.map((t) => [t.id, t] as const));
  const headers = [
    'case_id',
    'tx_id',
    'status',
    'opened',
    'assignee',
    'amount',
    'currency',
    'risk_score',
    'sender_jurisdiction',
    'receiver_jurisdiction',
    'typologies',
    'audit_event_count',
    'ai_summary',
  ];
  const rows = investigations.map((inv) => {
    const tx = txById.get(inv.transaction_id);
    const sp = tx ? getCustomerRiskProfile(tx.sender_account) : null;
    const rp = tx ? getCustomerRiskProfile(tx.receiver_account) : null;
    const tys = tx ? classifyTransaction(tx).map((x) => x.label).join(' | ') : '';
    const audit = getAuditLog(inv.id);
    return [
      `INV-${String(inv.id).padStart(4, '0')}`,
      inv.transaction_id,
      inv.investigation_status,
      inv.created_at || '',
      getAssignee(inv.id),
      tx?.amount.toFixed(2) || '',
      tx?.currency || '',
      tx?.risk_score ?? '',
      sp?.jurisdiction.code || '',
      rp?.jurisdiction.code || '',
      tys,
      audit.length,
      inv.ai_summary,
    ];
  });
  const csv = rowsToCsv(headers, rows);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  downloadFile(`cleartrace-cases-${stamp}.csv`, csv, 'text/csv');
}

// ─── Printable case file (HTML \u2192 user "Save as PDF" via browser print) ──────

export function printCaseFile(inv: Investigation, tx: SupabaseTransaction | null) {
  const audit = getAuditLog(inv.id);
  const assignee = getAssignee(inv.id);
  const sp = tx ? getCustomerRiskProfile(tx.sender_account) : null;
  const rp = tx ? getCustomerRiskProfile(tx.receiver_account) : null;
  const tys = tx ? classifyTransaction(tx) : [];
  const ss = tx ? screenAccount(tx.sender_account) : null;
  const rs = tx ? screenAccount(tx.receiver_account) : null;
  const explanation = tx ? explainTransaction(tx) : null;
  const caseId = `INV-${String(inv.id).padStart(4, '0')}`;
  const sarRef = `SAR-${new Date().getFullYear()}-${String(inv.id).padStart(6, '0')}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${caseId} \u2014 ClearTrace Case File</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 32px; max-width: 820px; margin: 0 auto; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  h2 { margin: 28px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: .08em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; }
  th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #f1f5f9; }
  th { background: #f8fafc; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 10px; letter-spacing: .06em; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; border: 1px solid; }
  .pill-red { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
  .pill-amber { background: #fffbeb; color: #b45309; border-color: #fde68a; }
  .pill-green { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
  .narrative { background: #f8fafc; padding: 12px 14px; border-left: 3px solid #2563eb; font-size: 13px; line-height: 1.55; border-radius: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .small { font-size: 11px; color: #64748b; }
  .bar-row { display: flex; align-items: center; gap: 6px; font-size: 11px; margin: 2px 0; }
  .bar { height: 8px; border-radius: 4px; }
  .footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="no-print" style="text-align:right; margin-bottom:8px;">
    <button onclick="window.print()" style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer; font-size:12px;">Print / Save as PDF</button>
  </div>
  <h1>ClearTrace Case File \u2014 ${caseId}</h1>
  <div class="meta">SAR Reference: <strong>${sarRef}</strong> \u00b7 Status: <strong>${inv.investigation_status.replace('_', ' ')}</strong> \u00b7 Assignee: <strong>${assignee}</strong></div>

  <h2>Subject Transaction</h2>
  ${tx ? `<table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Transaction ID</td><td>#${tx.id}</td></tr>
    <tr><td>Date</td><td>${new Date(tx.transaction_date).toLocaleString()}</td></tr>
    <tr><td>Type</td><td>${tx.transaction_type}</td></tr>
    <tr><td>Amount</td><td><strong>${tx.amount.toLocaleString()} ${tx.currency}</strong></td></tr>
    <tr><td>Risk score</td><td><strong>${tx.risk_score}/100</strong></td></tr>
    <tr><td>Auto-flagged</td><td>${tx.is_flagged ? 'Yes' : 'No'}</td></tr>
    <tr><td>Typologies</td><td>${tys.map((t) => `<span class="pill pill-amber">${t.label}</span>`).join(' ') || '<span class="small">None</span>'}</td></tr>
  </table>` : '<p class="small">Underlying transaction record not available.</p>'}

  ${tx && sp && rp ? `<h2>Counterparties</h2>
  <div class="grid">
    <div>
      <strong>Sender</strong><br/>
      <span class="small">${sp.legalName}</span><br/>
      <span class="small">${tx.sender_account} \u00b7 ${sp.jurisdiction.name} (${sp.jurisdiction.code}) \u00b7 FATF: ${sp.jurisdiction.fatf.replace('_', ' ')}</span><br/>
      <span class="small">KYC ${sp.kycTier.replace('_', ' ')} \u00b7 CRR ${sp.crr}/100 \u00b7 Sanctions: ${ss?.overall}</span>
    </div>
    <div>
      <strong>Receiver</strong><br/>
      <span class="small">${rp.legalName}</span><br/>
      <span class="small">${tx.receiver_account} \u00b7 ${rp.jurisdiction.name} (${rp.jurisdiction.code}) \u00b7 FATF: ${rp.jurisdiction.fatf.replace('_', ' ')}</span><br/>
      <span class="small">KYC ${rp.kycTier.replace('_', ' ')} \u00b7 CRR ${rp.crr}/100 \u00b7 Sanctions: ${rs?.overall}</span>
    </div>
  </div>` : ''}

  <h2>AI Investigation Summary</h2>
  <div class="narrative">${inv.ai_summary.replace(/</g, '&lt;')}</div>

  ${explanation ? `<h2>Model Feature Attributions</h2>
  ${explanation.contributions.slice(0, 6).map((c) => {
    const pct = Math.min(100, Math.abs(c.value) * 100);
    const color = c.value >= 0 ? '#dc2626' : '#10b981';
    return `<div class="bar-row"><div style="width:200px; color:#475569;">${c.feature}</div><div class="bar" style="width:${pct}%; background:${color};"></div><div class="small">${c.value >= 0 ? '+' : ''}${c.value.toFixed(2)}</div></div>`;
  }).join('')}` : ''}

  <h2>Audit Trail</h2>
  ${audit.length === 0 ? '<p class="small">No audit events recorded.</p>' : `<table>
    <tr><th>Timestamp (UTC)</th><th>Actor</th><th>Event</th></tr>
    ${audit.map((e) => `<tr><td>${new Date(e.ts).toISOString().replace('T', ' ').slice(0, 19)}</td><td>${e.actor}</td><td>${e.message}</td></tr>`).join('')}
  </table>`}

  <div class="footer">
    Generated by ClearTrace AML Intelligence Suite \u2022 ${new Date().toISOString()} \u2022 For demonstration purposes only.
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) {
    // Pop-up blocked \u2014 fall back to download
    downloadFile(`${caseId}-case-file.html`, html, 'text/html');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
