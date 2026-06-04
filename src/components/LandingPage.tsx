import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

interface LandingPageProps {
  onEnterDemo: () => void;
  onCaseStudy: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Editorial helpers                                                         */
/* -------------------------------------------------------------------------- */

/** Roman numerals for the colophon date (no library needed for one number). */
function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) { out += s; n -= v; }
  }
  return out;
}

/** Wraps text in a redaction bar that slides off after `delay`. */
function Redacted({
  children, delay = 0.2, className = '',
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span
      className={`redact ${className}`}
      style={{ ['--redact-delay' as never]: `${delay}s` } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  The Method modal — replaces the old "How it works"                        */
/* -------------------------------------------------------------------------- */

function MethodModal({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      num: 'I',
      title: 'Ingestion',
      desc: 'Wire-level transaction records arrive from core banking via Supabase. Each entry preserves sender, beneficiary, amount, currency, jurisdiction and timestamp — the raw evidence base.',
    },
    {
      num: 'II',
      title: 'Triage',
      desc: 'A deterministic scorer assigns 0–100 across cross-border patterns, structuring, velocity, and counterparty profile. The output is a defensible audit trail, not a black box.',
    },
    {
      num: 'III',
      title: 'Mapping',
      desc: 'React Flow renders the network of beneficial-owner relationships. Multi-hop layering, circular funding and smurfing become legible at a glance.',
    },
    {
      num: 'IV',
      title: 'Counsel',
      desc: 'On request, Claude reviews a transaction with the analyst\u2019s framing and returns a written FinCrime assessment citing applicable AML typologies. The model never decides — it advises.',
    },
    {
      num: 'V',
      title: 'Filing',
      desc: 'The summary, scoring rationale, and network context are compiled into a SAR draft. A human reviews, edits, and submits. The system records who, when, and why.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-serif">
      <div className="absolute inset-0 bg-ink/80" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-paper border border-ink shadow-[8px_8px_0_0_var(--ink)] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-5 bg-paper border-b border-ink flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] text-ink-mute uppercase">Editorial · § II</p>
            <h3 className="font-display text-3xl font-semibold text-ink leading-none mt-1" style={{ fontVariationSettings: "'SOFT' 30, 'WONK' 1" }}>
              The Method
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-ink-soft hover:text-vermillion transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-8">
          <p className="font-serif text-lg leading-[1.7] text-ink-soft mb-8 italic">
            A five-act procedure, derived from how a senior FinCrime analyst actually reads a case file.
            Each step leaves an artefact; the artefacts together constitute the SAR.
          </p>

          <ol className="space-y-7">
            {steps.map((s, i) => (
              <li key={i} className="grid grid-cols-[3rem_1fr] gap-5 pb-7 border-b border-rule last:border-b-0 last:pb-0">
                <div className="font-display text-vermillion text-3xl leading-none pt-1" style={{ fontVariationSettings: "'SOFT' 0" }}>
                  {s.num}
                </div>
                <div>
                  <h4 className="font-display text-xl font-display font-semibold text-ink mb-1.5">{s.title}</h4>
                  <p className="font-serif text-[15px] leading-[1.65] text-ink-soft">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="px-8 py-4 border-t border-ink bg-paper-deep">
          <p className="font-mono text-[11px] text-ink-mute tracking-wider">
            <span className="text-vermillion">¶</span>&nbsp; Human-in-the-loop at every disposition. The model assists; it does not file.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Landing page                                                              */
/* -------------------------------------------------------------------------- */

export default function LandingPage({ onEnterDemo, onCaseStudy }: LandingPageProps) {
  const [showMethod, setShowMethod] = useState(false);

  // Date stamp, refreshed on mount — gives the masthead its "today's edition" feel.
  const [today] = useState(() => new Date());
  const dateLine = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).toUpperCase();

  // Edition number derived from epoch-day so it changes daily but is stable per-day.
  const edition = String(
    Math.floor(today.getTime() / 86400000) % 9999
  ).padStart(4, '0');

  // Lock body scroll when modal is open.
  useEffect(() => {
    document.body.style.overflow = showMethod ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMethod]);

  /* ---- Content ---- */

  const stats = [
    { value: '6', kicker: 'AML typologies', detail: 'screened on every wire — structuring, smurfing, layering, round-tripping, velocity and trade-based laundering.' },
    { value: '0\u2013100', kicker: 'risk score', detail: 'a deterministic, explainable score assigned to each transaction, with the reasoning shown rather than hidden in a black box.' },
    { value: '100%', kicker: 'human-in-the-loop', detail: 'every disposition and SAR is reviewed and filed by an analyst. The model advises; it never decides.' },
  ];

  const credits = [
    'TypeScript', 'React', 'Tailwind', 'React Flow', 'Supabase', 'PostgreSQL', 'Claude · Anthropic', 'Vercel',
  ];

  /* ---- Render ---- */

  return (
    <div className="relative min-h-screen text-ink font-serif">
      {/* ============================================================ */}
      {/*  MASTHEAD                                                     */}
      {/* ============================================================ */}
      <header className="relative z-10 px-6 pt-8 pb-4">
        <div className="max-w-[78rem] mx-auto">
          {/* Top metadata row */}
          <div className="flex items-end justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-ink-mute mb-4">
            <div className="hidden sm:block">
              Vol. <span className="text-ink">I</span> &nbsp;·&nbsp; No. <span className="text-ink">{edition}</span>
            </div>
            <div className="text-center flex-1 sm:flex-none">{dateLine}</div>
            <a
              href="https://aurimas.io"
              className="hidden sm:inline link-underline hover:text-ink"
            >
              ← aurimas.io
            </a>
          </div>

          <div className="hairline mb-3" />

          {/* The nameplate */}
          <h1
            className="font-display font-semibold text-ink leading-[0.85] tracking-masthead text-center"
            style={{
              fontSize: 'clamp(3.2rem, 13vw, 11rem)',
              fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1",
            }}
          >
            ClearTrace
          </h1>

          {/* Deck below nameplate */}
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-mono uppercase tracking-deck text-ink-soft">
            <span>An&nbsp;Anti-Money-Laundering&nbsp;Dossier</span>
            <span className="hidden sm:inline text-vermillion">●</span>
            <span className="hidden sm:inline">For&nbsp;the&nbsp;Tired&nbsp;Analyst</span>
          </div>

          <div className="double-rule mt-3" />
        </div>
      </header>

      {/* ============================================================ */}
      {/*  LEAD ARTICLE                                                 */}
      {/* ============================================================ */}
      <main className="relative z-10 px-6">
        <article className="max-w-[78rem] mx-auto pt-10 pb-20">

          {/* Kicker */}
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermillion text-center mb-6">
            <span className="border-y border-vermillion py-0.5">Lead&nbsp;Investigation&nbsp;·&nbsp;§ I</span>
          </p>

          {/* Headline — display-serif, redacted reveal on load.
              Two lines, but no whitespace-nowrap clipping problems this time
              because the type is line-broken intentionally and Fraunces is
              optically balanced at large sizes. */}
          <h2
            className="font-display font-semibold text-ink leading-[0.96] tracking-tight text-center mx-auto"
            style={{
              fontSize: 'clamp(2.4rem, 7.4vw, 6rem)',
              maxWidth: '20ch',
              fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1",
            }}
          >
            <span className="block">
              Stop chasing&nbsp;
              <em className="not-italic text-vermillion" style={{ fontStyle: 'italic', fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 1" }}>
                false&nbsp;positives.
              </em>
            </span>
            <span className="block mt-2">
              Start <Redacted delay={0.55}>investigating</Redacted>{' '}
              <Redacted delay={0.85}>like&nbsp;a&nbsp;human.</Redacted>
            </span>
          </h2>

          {/* Byline */}
          <p className="text-center mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            By <span className="text-ink link-underline">Aurimas&nbsp;Nausėdas</span>
            <span className="mx-3 text-vermillion">§</span>
            Filed from&nbsp;Vilnius
          </p>

          {/* Hairline before lede */}
          <div className="hairline-thin max-w-[8rem] mx-auto mt-8 mb-10" />

          {/* Lede — drop-cap paragraph + sidebar of stats */}
          <div className="grid lg:grid-cols-[1fr_22rem] gap-12 lg:gap-16 items-start">

            {/* The lede */}
            <div className="max-w-[44rem]">
              <p className="dropcap font-serif text-[1.22rem] leading-[1.75] text-ink-soft">
                Fraud analysts spend the majority of their working week reviewing transactions
                that look like crimes but aren’t — and the minority of it on the ones that are.
                <span className="text-ink"> ClearTrace inverts that ratio.</span> A small,
                opinionated stack of LLM-orchestrated tools triages alerts, draws the network
                between counterparties, scores the evidence, and drafts the regulatory filing.
                The analyst keeps the only thing a regulator cares about — judgement.
              </p>

              <p className="font-serif text-[1.06rem] leading-[1.75] text-ink-soft mt-6">
                What follows is a working demo, pre-loaded with a plausible cross-border
                AML scenario. Click anything. Open a transaction; chase the network; ask the
                model what it sees. The disposition stays yours.
              </p>

              {/* CTA buttons — editorial */}
              <div className="flex flex-wrap gap-4 mt-10">
                <button
                  onClick={onEnterDemo}
                  className="btn-ink group inline-flex items-center gap-3 px-7 py-3.5 font-mono text-sm uppercase tracking-[0.18em]"
                >
                  <span>Enter the dossier</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowMethod(true)}
                  className="btn-paper inline-flex items-center gap-3 px-7 py-3.5 font-mono text-sm uppercase tracking-[0.18em]"
                >
                  <span>Read the method</span>
                  <span className="text-lg leading-none -mt-0.5">§</span>
                </button>
              </div>

              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mt-5">
                Pre-loaded with sample AML case data — no setup required.
              </p>
            </div>

            {/* Sidebar — "By the Numbers" */}
            <aside className="lg:border-l lg:border-rule-strong lg:pl-10 relative">
              <div className="hidden lg:block absolute -left-[1px] top-0 w-1 h-12 bg-vermillion" />
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermillion mb-6">
                By the Numbers
              </p>
              <ul className="space-y-7">
                {stats.map((s, i) => (
                  <li
                    key={i}
                    className="fade-rise"
                    style={{ ['--fade-delay' as never]: `${0.3 + i * 0.12}s` } as React.CSSProperties}
                  >
                    <div
                      className="font-display text-ink leading-none mb-2"
                      style={{
                        fontSize: 'clamp(2.6rem, 4.4vw, 3.6rem)',
                        fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 1",
                      }}
                    >
                      {s.value}
                    </div>
                    <p className="smallcaps text-[11px] text-ink mb-1.5">{s.kicker}</p>
                    <p className="font-serif text-[14px] leading-[1.55] text-ink-soft italic">
                      {s.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          {/* ======================================================== */}
          {/*  EXHIBIT A — The Evidence Preview                         */}
          {/* ======================================================== */}
          <section className="mt-24">
            <div className="flex items-end justify-between gap-6 mb-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermillion mb-1">
                  Exhibit&nbsp;A
                </p>
                <h3
                  className="font-display font-semibold text-ink leading-none"
                  style={{ fontSize: 'clamp(2rem, 4.4vw, 3rem)', fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1" }}
                >
                  The dossier, abridged.
                </h3>
              </div>
              <p className="hidden md:block font-serif italic text-ink-soft text-right max-w-[26rem] leading-[1.55]">
                A live cross-section of the demo: alert posture, the network of beneficiaries,
                and three flagged wires from this morning’s feed.
              </p>
            </div>

            <div className="hairline-thin mb-6" />

            {/* The "evidence" card */}
            <button
              onClick={onEnterDemo}
              className="group relative block w-full text-left bg-paper-deep border border-ink shadow-[10px_10px_0_0_var(--ink)] hover:shadow-[14px_14px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:-translate-x-0.5"
              aria-label="Enter live demo"
            >
              {/* Confidential stamp */}
              <div className="stamp absolute -top-4 right-6 sm:right-10 z-20 text-[11px]">
                Live Demo · Unclassified
              </div>

              {/* File-tab header */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-ink bg-paper">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                  <span className="text-vermillion">▶</span>
                  Case&nbsp;File&nbsp;<span className="text-ink">CT-{edition}-A</span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-ink-mute">
                  cleartrace.aurimas.io
                </div>
              </div>

              <div className="p-6 sm:p-8 grid lg:grid-cols-[1fr_1.2fr] gap-8">
                {/* Left column: KPI tiles, type-only */}
                <div className="space-y-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-mute">High-risk alerts</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="font-display text-[4.2rem] leading-none text-vermillion" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 1" }}>13</span>
                      <span className="font-serif italic text-ink-soft text-sm">of 147 today</span>
                    </div>
                    <div className="hairline-thin mt-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-mute">Pending review</p>
                      <div className="font-display text-[2.4rem] leading-none text-ink mt-1" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>15</div>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-mute">Avg risk score</p>
                      <div className="font-display text-[2.4rem] leading-none text-ink mt-1" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}>36</div>
                    </div>
                  </div>

                  <div className="hairline-thin" />

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-mute mb-3">
                      Alert disposition · last 24h
                    </p>
                    <div className="flex items-end gap-1 h-16">
                      {[3,5,2,7,9,12,8,4,6,11,15,13,9,7,5,8,10,14,16,12,9,6,4,3].map((v, i) => (
                        <div
                          key={i}
                          className={`flex-1 ${v >= 13 ? 'bg-vermillion' : v >= 8 ? 'bg-ink' : 'bg-ink-soft/40'}`}
                          style={{ height: `${(v / 16) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column: ledger of three wires */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-mute mb-3">
                    Wire ledger · flagged
                  </p>

                  {/* Header row */}
                  <div className="grid grid-cols-[5rem_1fr_5rem_2.5rem] gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute pb-1.5 border-b border-ink">
                    <span>Ref.</span>
                    <span>Type</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Risk</span>
                  </div>

                  {[
                    { ref: 'CT-1742', type: 'Wire transfer · BVI → Vilnius', amount: '€69,000',  risk: 87, flagged: true },
                    { ref: 'CT-1738', type: 'Tax payment · domestic',         amount: '€14,818',  risk: 42, flagged: false },
                    { ref: 'CT-1731', type: 'Wire transfer · Cyprus → Riga',   amount: '€125,400', risk: 91, flagged: true },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-[5rem_1fr_5rem_2.5rem] gap-3 items-center py-2.5 border-b border-rule font-serif text-[14px] ${row.flagged ? 'text-ink' : 'text-ink-soft'}`}
                    >
                      <span className="font-mono text-[12px] tracking-wider">{row.ref}</span>
                      <span className="italic">{row.type}</span>
                      <span className="text-right font-mono tabular-nums">{row.amount}</span>
                      <span className={`text-right font-display text-lg leading-none ${row.risk >= 80 ? 'text-vermillion' : 'text-ink-mute'}`}>
                        {row.risk}
                      </span>
                    </div>
                  ))}

                  {/* Marginal note */}
                  <p className="mt-5 font-serif italic text-[13px] text-ink-mute leading-[1.55] border-l-2 border-vermillion pl-3">
                    “The Cyprus → Riga wire matches the structuring fingerprint observed in the
                    January typology brief. Recommend escalation.”
                    <span className="block mt-1 not-italic font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">— ClearTrace · Counsel</span>
                  </p>
                </div>
              </div>

              {/* Hover affordance */}
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/[0.02] transition-colors pointer-events-none" />
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-vermillion">
                Open the case <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </section>

          {/* ======================================================== */}
          {/*  COMPILED FROM — credits                                   */}
          {/* ======================================================== */}
          <section className="mt-24">
            <div className="flex items-end justify-between mb-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermillion">
                Compiled From
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                § III · Production Credits
              </p>
            </div>
            <div className="hairline-thin mb-6" />
            <p className="font-serif text-[15px] leading-[1.85] text-ink-soft max-w-[60rem]">
              {credits.map((c, i) => (
                <span key={c}>
                  <span className="text-ink">{c}</span>
                  {i < credits.length - 1 && <span className="mx-2 text-vermillion">·</span>}
                </span>
              ))}
              <span className="text-ink-mute italic">. Drafted, set, and pressed in a single afternoon.</span>
            </p>
          </section>
        </article>
      </main>

      {/* ============================================================ */}
      {/*  COLOPHON                                                     */}
      {/* ============================================================ */}
      <footer className="relative z-10 mt-12">
        <div className="max-w-[78rem] mx-auto px-6 pb-10">
          <div className="double-rule mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
            <div>
              <p className="text-ink-mute mb-1">Published&nbsp;by</p>
              <p className="font-serif normal-case tracking-normal text-base text-ink italic">
                Aurimas Nausėdas
              </p>
            </div>
            <div className="text-center">
              <button onClick={onCaseStudy} className="link-underline hover:text-ink">
                Read&nbsp;the&nbsp;Case&nbsp;Study&nbsp;§&nbsp;IV
              </button>
            </div>
            <div className="text-right space-x-5">
              <a href="https://github.com/aurimas13/ClearTrace" className="link-underline hover:text-ink">GitHub</a>
              <a href="https://aurimas.io" className="link-underline hover:text-ink">aurimas.io</a>
            </div>
          </div>
          <p className="mt-5 text-center font-mono text-[10px] tracking-[0.32em] uppercase text-ink-mute">
            ClearTrace&nbsp;Editorial&nbsp;·&nbsp;{toRoman(today.getFullYear())}&nbsp;·&nbsp;All&nbsp;Rights&nbsp;Reserved&nbsp;to&nbsp;the&nbsp;Tired&nbsp;Analyst
          </p>
        </div>
      </footer>

      {showMethod && <MethodModal onClose={() => setShowMethod(false)} />}
    </div>
  );
}
