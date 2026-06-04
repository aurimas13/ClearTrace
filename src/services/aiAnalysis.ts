import { supabase } from '../supabaseClient';
import type { SupabaseTransaction } from '../components/TransactionList';
import { addAuditEvent, getCurrentAnalyst } from './sessionStore';

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE INTEGRATION
//
// The Claude API key is NEVER exposed to the browser. AI requests are proxied
// through a Vercel serverless function (`/api/analyze`) that holds the key in
// the server environment (`CLAUDE_API_KEY`). See `api/analyze.ts`.
//
// To enable real AI in production, set CLAUDE_API_KEY in your Vercel project
// (Settings → Environment Variables) — no `VITE_` prefix. If the proxy is
// unavailable (e.g. `npm run dev`, which doesn't run serverless functions, or
// no key configured), the client gracefully falls back to a local summary.
// ─────────────────────────────────────────────────────────────────────────────

const ANALYZE_ENDPOINT = '/api/analyze';

/**
 * Calls the Claude API to analyze a transaction.
 * Replace this function body with your own LLM integration if needed.
 */
function generateFallbackSummary(tx: SupabaseTransaction): string {
  const summaries: string[] = [];

  if (tx.risk_score >= 80) {
    summaries.push(
      `This ${tx.transaction_type.replace(/_/g, ' ').toLowerCase()} of ${tx.amount.toLocaleString()} ${tx.currency} from ${tx.sender_account} to ${tx.receiver_account} carries a critically elevated risk score of ${tx.risk_score}/100, which is consistent with transactions flagged under layering or rapid-movement AML typologies.`
    );
  } else if (tx.risk_score >= 50) {
    summaries.push(
      `The ${tx.transaction_type.replace(/_/g, ' ').toLowerCase()} of ${tx.amount.toLocaleString()} ${tx.currency} between ${tx.sender_account} and ${tx.receiver_account} shows a moderate risk score of ${tx.risk_score}/100, suggesting patterns that may align with structuring or smurfing activity.`
    );
  } else {
    summaries.push(
      `This ${tx.transaction_type.replace(/_/g, ' ').toLowerCase()} of ${tx.amount.toLocaleString()} ${tx.currency} from ${tx.sender_account} to ${tx.receiver_account} has a low risk score of ${tx.risk_score}/100, though the transaction path warrants review for potential trade-based money laundering indicators.`
    );
  }

  if (tx.is_flagged) {
    summaries.push('The transaction has been flagged by automated screening rules, indicating behavioral anomalies relative to the account\'s historical transaction profile.');
  } else {
    summaries.push('While not currently flagged, the sender-receiver relationship and transaction corridor should be cross-referenced against known shell-entity registries.');
  }

  summaries.push('Further investigation is recommended to verify the economic purpose and confirm beneficial ownership on both ends of this transaction.');

  return summaries.join(' ');
}

async function callClaudeAPI(prompt: string, tx: SupabaseTransaction): Promise<string> {
  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      // 404 locally (no serverless runtime under `vite`), or 503 when the key
      // isn't configured — fall back to the deterministic local summary.
      console.warn('AI proxy returned', response.status, '— using local analysis.');
      await new Promise((r) => setTimeout(r, 600));
      return generateFallbackSummary(tx);
    }

    const data = (await response.json()) as { summary?: string };
    const summary = data.summary?.trim();
    return summary ? summary : generateFallbackSummary(tx);
  } catch (err) {
    console.warn('AI proxy unreachable, falling back to local analysis:', err);
    await new Promise((r) => setTimeout(r, 600));
    return generateFallbackSummary(tx);
  }
}

/**
 * Main entry point — builds the prompt, calls the LLM, saves to Supabase,
 * and returns the AI summary text.
 */
export async function analyzeTransaction(tx: SupabaseTransaction): Promise<string> {
  const prompt = `Act as a FinCrime Analyst. Review this transaction and explain in 3 short sentences why it might be suspicious based on AML typologies.

Transaction details:
- Amount: ${tx.amount.toLocaleString()} ${tx.currency}
- Sender: ${tx.sender_account}
- Receiver: ${tx.receiver_account}
- Risk Score: ${tx.risk_score}/100
- Type: ${tx.transaction_type}
- Flagged: ${tx.is_flagged ? 'Yes' : 'No'}`;

  const aiSummary = await callClaudeAPI(prompt, tx);

  // Detect whether a prior investigation already exists for this txn
  const { data: existing } = await supabase
    .from('investigations')
    .select('id')
    .eq('transaction_id', tx.id)
    .limit(1);
  const isReinvestigation = (existing?.length ?? 0) > 0;

  // Save investigation record to Supabase
  const { data: inserted, error } = await supabase
    .from('investigations')
    .insert({
      transaction_id: tx.id,
      ai_summary: aiSummary,
      investigation_status: 'open',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save investigation:', error.message);
  }

  // Append to audit log (sessionStorage). Falls back to txn-id if insert
  // didn't return a record (e.g., RLS rejection — still log the action).
  const investigationId = inserted?.id ?? `tx-${tx.id}`;
  const analyst = getCurrentAnalyst();
  if (isReinvestigation) {
    addAuditEvent(
      investigationId,
      'reinvestigated',
      `Re-investigated transaction #${tx.id} — new AI summary generated.`,
      analyst
    );
  } else {
    addAuditEvent(
      investigationId,
      'case_opened',
      `Case opened for transaction #${tx.id} (${tx.transaction_type}, ${tx.amount.toLocaleString()} ${tx.currency}). AI risk assessment ${tx.risk_score}/100.`,
      analyst
    );
  }

  return aiSummary;
}
