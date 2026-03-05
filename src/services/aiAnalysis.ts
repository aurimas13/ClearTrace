import { supabase } from '../supabaseClient';
import type { SupabaseTransaction } from '../components/TransactionList';

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO GET YOUR CLAUDE API KEY:
//
// 1. Go to https://console.anthropic.com/
// 2. Sign up or log in to your Anthropic account.
// 3. Navigate to "API Keys" in the dashboard sidebar.
// 4. Click "Create Key", give it a name, and copy the key.
// 5. Add it to your .env file as:
//      VITE_CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx
//
// ⚠️  IMPORTANT: Calling the Claude API directly from the browser exposes your
//     API key. For production, proxy requests through a backend / Edge Function.
// ─────────────────────────────────────────────────────────────────────────────

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY as string | undefined;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Calls the Claude API to analyze a transaction.
 * Replace this function body with your own LLM integration if needed.
 */
async function callClaudeAPI(prompt: string): Promise<string> {
  if (!CLAUDE_API_KEY) {
    // ── PLACEHOLDER: Remove this block once you add your real API key ──
    // Simulates a short delay and returns a mock response so the UI flow
    // works end-to-end even without a real key.
    await new Promise((r) => setTimeout(r, 1500));
    return (
      'This transaction exhibits characteristics consistent with layering — a common AML typology where funds are rapidly moved between accounts to obscure their origin. ' +
      'The high risk score and cross-border transfer pattern suggest potential structuring to avoid reporting thresholds. ' +
      'Further investigation is recommended to verify the legitimacy of the sender-receiver relationship and the underlying economic purpose.'
    );
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? 'No response from Claude.';
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

  const aiSummary = await callClaudeAPI(prompt);

  // Save investigation record to Supabase
  const { error } = await supabase.from('investigations').insert({
    transaction_id: tx.id,
    ai_summary: aiSummary,
    investigation_status: 'open',
  });

  if (error) {
    console.error('Failed to save investigation:', error.message);
  }

  return aiSummary;
}
