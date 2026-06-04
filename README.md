# ClearTrace Intelligence: Agentic AML Investigation Platform

ClearTrace Intelligence is a proof-of-concept AI architecture designed to accelerate Financial Crime (FinCrime) operations. It bridges the gap between raw transaction data pipelines and human compliance officers by utilizing Large Language Models to orchestrate initial investigations and visualize money movement.

## System Architecture
* Frontend: React, Tailwind CSS, React Flow (for complex node-based network visualizations).
* Backend & Data Storage: Supabase (PostgreSQL) handling structured transaction data and state management.
* AI Orchestration: LLM integration for automated Suspicious Activity Report (SAR) generation and contextual risk scoring. Claude is called via a Vercel serverless proxy (`api/analyze.ts`) so the API key stays server-side and is never shipped to the browser.
* Hosting: Vercel (CI/CD pipeline integrated with GitHub Actions).

## Local Development
```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # Vite dev server (serverless /api routes are NOT served here)
```
Under `npm run dev`, AI requests fall back to a deterministic local summary, so
the demo stays fully functional offline.

To exercise the real `/api/analyze` proxy locally (Vite + serverless functions
together), use the Vercel CLI instead:
```bash
npm run dev:api        # runs `vercel dev`
```
The first run links the project and prompts to pull environment variables;
`CLAUDE_API_KEY` from `.env` (or `vercel env pull`) is then used server-side.

The proxy applies a best-effort per-IP rate limit (20 requests/minute per warm
instance). For a hard, cross-instance limit, back it with a shared store such as
Vercel KV / Upstash.

## Environment Variables
| Variable | Scope | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | client | Public Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | client | Public anon key, protected by Row Level Security. |
| `CLAUDE_API_KEY` | **server only** | Used by `/api/analyze`. No `VITE_` prefix — keep it out of the bundle. Set it in Vercel → Settings → Environment Variables. |

## Business Impact Hypothesis
* Reduces manual transaction review time via automated, plain-English context summaries.
* Improves false-positive resolution by visualizing multi-hop transaction networks (circular funding, smurfing).
* Maintains a "Human-in-the-Loop" standard for regulatory compliance, acting as an intelligent co-pilot rather than an autonomous decision-maker.