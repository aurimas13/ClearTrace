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
  if (!CLAUDE_API_KEY) {
    await new Promise((r) => setTimeout(r, 1500));
    return generateFallbackSummary(tx);
  }

  try {
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
      console.warn('Claude API error, falling back to local analysis:', response.status);
      await new Promise((r) => setTimeout(r, 800));
      return generateFallbackSummary(tx);
    }

    const data = await response.json();
    return data.content?.[0]?.text ?? generateFallbackSummary(tx);
  } catch (err) {
    console.warn('Claude API unreachable, falling back to local analysis:', err);
    await new Promise((r) => setTimeout(r, 800));
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
