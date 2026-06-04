import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side proxy for the Claude (Anthropic) API.
 *
 * The API key lives ONLY in the server environment (`CLAUDE_API_KEY`) and is
 * never shipped to the browser. The client posts a prompt to `/api/analyze`;
 * this function forwards it to Anthropic and returns just the summary text.
 *
 * Configure the key in Vercel: Project → Settings → Environment Variables →
 *   CLAUDE_API_KEY = sk-ant-...
 * (No `VITE_` prefix — that would re-expose it to the client bundle.)
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_PROMPT_CHARS = 4000;

// ── Best-effort in-memory rate limiter ──────────────────────────────────────
// Fixed window per client IP. This protects a warm serverless instance from
// bursts/abuse; it is not a global guarantee (instances are ephemeral and
// horizontally scaled). For hard limits, front this with a shared store
// (e.g. Upstash/Vercel KV) — kept dependency-free here on purpose.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now >= entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw?.split(',')[0].trim()) || req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ok, retryAfter } = rateLimit(clientIp(req));
  if (!ok) {
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many requests', retryAfter });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    // Not configured — let the client fall back to its local summary.
    return res.status(503).json({ error: 'AI proxy is not configured' });
  }

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) ?? {};
  const prompt = (body as { prompt?: unknown }).prompt;

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Missing "prompt" string in request body' });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: 'Prompt too large' });
  }

  try {
    const upstream = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      console.error('[api/analyze] upstream error', upstream.status, detail);
      return res.status(502).json({ error: 'Upstream AI error', status: upstream.status });
    }

    const data = (await upstream.json()) as { content?: Array<{ text?: string }> };
    const summary = data.content?.[0]?.text ?? '';
    return res.status(200).json({ summary });
  } catch (err) {
    console.error('[api/analyze] request failed', err);
    return res.status(502).json({ error: 'AI request failed' });
  }
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
