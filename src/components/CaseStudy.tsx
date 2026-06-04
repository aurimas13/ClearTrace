import {
  ArrowLeft,
  ExternalLink,
  Shield,
  AlertTriangle,
  Brain,
  Network,
  FileSearch,
  CheckCircle2,
  Lightbulb,
  Wrench,
  Target,
  User,
} from 'lucide-react';

interface CaseStudyProps {
  onBack: () => void;
  onEnterDemo: () => void;
}

export default function CaseStudy({ onBack, onEnterDemo }: CaseStudyProps) {
  return (
    <div className="min-h-screen text-ink font-serif">
      {/* Header */}
      <header className="border-b border-ink sticky top-0 z-20 bg-paper/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-ink-soft hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to ClearTrace
          </button>
          <a
            href="https://aurimas.io"
            className="text-sm text-ink-soft hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            aurimas.io
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-vermillion mb-3 inline-flex items-center gap-2">
            <Shield className="w-3 h-3" />
            § IV · The Case Study
          </p>
          <h1
            className="font-display font-semibold text-ink leading-[0.95] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 4.6rem)', fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1" }}
          >
            ClearTrace Intelligence,<br />
            <span className="italic text-vermillion" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 50, 'WONK' 1" }}>annotated.</span>
          </h1>
          <div className="hairline-thin max-w-[6rem] mb-5" />
          <p className="font-serif text-xl text-ink-soft leading-relaxed max-w-3xl">
            An AI-assisted AML investigation platform that triages alerts, maps counterparty networks,
            and drafts Suspicious Activity Reports through LLM-orchestrated analysis — keeping a human
            analyst in control of every decision.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <button
              onClick={onEnterDemo}
              className="px-6 py-3 bg-ink hover:bg-oxblood text-paper rounded-none font-semibold flex items-center gap-2 transition-all shadow-[3px_3px_0_0_var(--ink)]"
            >
              Try the Live Demo
              <ExternalLink className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white hover:bg-paper-deep text-ink rounded-none font-semibold flex items-center gap-2 transition-all border border-rule-strong shadow-sm"
            >
              View Source Code
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Problem */}
        <section className="mb-16">
          <SectionHeader icon={AlertTriangle} color="red" title="The Problem" />
          <div className="bg-red-50/60 border border-red-200 rounded-none p-6 md:p-8">
            <p className="text-lg text-ink-soft leading-relaxed mb-6">
              Financial crime compliance teams are overwhelmed. Rules-based monitoring generates far
              more alerts than analysts can work, and a large share turn out to be false positives.
              The time spent on manual transaction review and Suspicious Activity Report (SAR)
              preparation is repetitive, slow, and pulls attention away from the cases that matter.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProblemStat value="Alert fatigue" label="High false-positive volume buries genuine risk" />
              <ProblemStat value="Manual SAR prep" label="Drafting reports by hand is slow and repetitive" />
              <ProblemStat value="Fragmented context" label="Money-flow relationships are hard to see across systems" />
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="mb-16">
          <SectionHeader icon={Lightbulb} color="amber" title="The Approach" />
          <p className="text-ink-soft leading-relaxed mb-8">
            ClearTrace introduces an LLM-orchestrated investigation layer on top of structured
            transaction data. Instead of replacing human analysts, the system acts as an intelligent
            co-pilot — surfacing insights, visualizing networks, and drafting reports while keeping
            humans in the loop at every decision point.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ApproachCard
              title="AI-Assisted Investigation"
              desc="Claude analyzes transactions against AML typologies (layering, structuring, smurfing) and produces plain-English context summaries in seconds."
              icon={Brain}
            />
            <ApproachCard
              title="Network Visualization"
              desc="React Flow renders interactive sender-receiver graphs, making multi-hop transaction paths and circular funding patterns immediately visible."
              icon={Network}
            />
            <ApproachCard
              title="Automated SAR Drafts"
              desc="AI investigation summaries feed into structured report templates — reducing SAR prep from hours to minutes with human approval."
              icon={FileSearch}
            />
            <ApproachCard
              title="Human-in-the-Loop"
              desc="Every AI output is presented for review. No autonomous filing — the system assists, the analyst decides."
              icon={CheckCircle2}
            />
          </div>
        </section>

        {/* My Role */}
        <section className="mb-16">
          <SectionHeader icon={User} color="purple" title="My Role" />
          <div className="bg-paper-deep border border-rule-strong rounded-none p-6 md:p-8">
            <div className="space-y-4 text-ink-soft leading-relaxed">
              <p>
                <span className="text-ink font-semibold">Designed the product architecture</span> — defined
                the data model, component hierarchy, and integration patterns between Supabase, React Flow,
                and the Claude API.
              </p>
              <p>
                <span className="text-ink font-semibold">Led end-to-end technical delivery</span> — built
                the frontend application, API integration layer, network graph visualization, and the AI
                investigation pipeline from scratch.
              </p>
              <p>
                <span className="text-ink font-semibold">Defined UX for compliance officer workflow</span> — designed
                the dashboard layout, AI modal interaction patterns, and risk-indicator systems to match how
                actual FinCrime analysts triage and investigate alerts.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <SectionHeader icon={Wrench} color="cyan" title="Tech Stack" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'React', desc: 'UI framework' },
              { name: 'TypeScript', desc: 'Type safety' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'React Flow', desc: 'Graph visualization' },
              { name: 'Supabase', desc: 'PostgreSQL backend' },
              { name: 'Claude API', desc: 'LLM integration' },
              { name: 'Vercel', desc: 'Hosting & CI/CD' },
              { name: 'Vite', desc: 'Build tooling' },
            ].map((tech) => (
              <div key={tech.name} className="bg-paper-deep border border-rule-strong rounded-lg p-4 text-center">
                <div className="text-ink font-semibold text-sm">{tech.name}</div>
                <div className="text-ink-mute text-xs mt-0.5">{tech.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* What it delivers */}
        <section className="mb-16">
          <SectionHeader icon={Target} color="green" title="What It Delivers" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <OutcomeStat value="6" label="AML typologies screened per transaction" color="emerald" />
            <OutcomeStat value="0–100" label="Explainable risk score on every wire" color="blue" />
            <OutcomeStat value="100%" label="Human-in-the-loop on every disposition" color="cyan" />
          </div>
          <div className="space-y-3">
            <OutcomeItem text="Plain-English investigation summaries that cite specific AML typologies" />
            <OutcomeItem text="Multi-hop network visualization reveals circular funding, smurfing, and layering patterns" />
            <OutcomeItem text="AI-generated SAR drafts that always pass through a human approval workflow" />
            <OutcomeItem text="Investigation records and audit events persisted to Supabase for a defensible trail" />
          </div>
        </section>

        {/* Screenshots */}
        <section className="mb-16">
          <SectionHeader icon={Shield} color="blue" title="Key Screens" />
          <div className="space-y-8">
            <ScreenCaption
              num={1}
              title="Landing Page"
              caption="Hero with problem statement, the system at a glance, and an interactive dashboard preview that communicates the product's value proposition at a glance."
            >
              <div className="bg-white rounded-lg p-6 border border-rule-strong">
                <div className="text-center mb-4">
                  <div className="text-2xl font-display font-semibold text-ink mb-1">Stop Chasing False Positives.</div>
                  <div className="text-sm text-ink-soft">Triage alerts, map the network, and draft the filing — analyst keeps the judgement...</div>
                </div>
                <div className="flex justify-center gap-3">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-lg text-white text-xs font-semibold">Enter Live Demo</div>
                  <div className="px-4 py-2 bg-white border border-rule-strong rounded-lg text-ink text-xs font-semibold">How It Works</div>
                </div>
              </div>
            </ScreenCaption>

            <ScreenCaption
              num={2}
              title="Alert Dashboard with Stats"
              caption="Real-time stat cards showing high-risk alert count, pending reviews, and average risk score. Data is fetched live from Supabase."
            >
              <div className="bg-white rounded-lg p-6 border border-rule-strong">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-paper-deep rounded-lg p-3 text-center">
                    <div className="text-[10px] text-ink-mute mb-1">High Risk Alerts</div>
                    <div className="text-xl font-display font-semibold text-red-600">13</div>
                  </div>
                  <div className="bg-paper-deep rounded-lg p-3 text-center">
                    <div className="text-[10px] text-ink-mute mb-1">Pending Review</div>
                    <div className="text-xl font-display font-semibold text-amber-600">15</div>
                  </div>
                  <div className="bg-paper-deep rounded-lg p-3 text-center">
                    <div className="text-[10px] text-ink-mute mb-1">Avg Risk Score</div>
                    <div className="text-xl font-display font-semibold text-vermillion">36</div>
                  </div>
                </div>
              </div>
            </ScreenCaption>

            <ScreenCaption
              num={3}
              title="Transaction Network Graph"
              caption="Interactive React Flow graph where each node is a unique account and each edge is a transaction. Red borders indicate accounts involved in high-risk (>80) transactions. Zoom, pan, and explore multi-hop relationships."
            >
              <div className="bg-white rounded-lg p-6 border border-rule-strong">
                <div className="flex items-center justify-center gap-6">
                  {[
                    { label: 'Meridian OÜ', risk: false },
                    { label: 'Hub Account', risk: false },
                    { label: 'Shell Co', risk: true },
                    { label: 'Apex Corp', risk: true },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-[9px] font-mono leading-tight text-center px-1 ${node.risk ? 'border-red-500 bg-red-50 text-red-600' : 'border-rule-strong bg-paper-deep text-ink-soft'}`}>
                        {node.label}
                      </div>
                      {i < 3 && (
                        <div className={`w-10 h-px ${i === 1 ? 'bg-red-500' : 'bg-slate-300'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScreenCaption>

            <ScreenCaption
              num={4}
              title="Investigation Modal"
              caption="Clicking 'Investigate' on any transaction sends context to Claude, which returns a FinCrime analyst assessment citing AML typologies. The summary is saved to the investigations table."
            >
              <div className="bg-white rounded-lg border border-rule-strong overflow-hidden card-shadow">
                <div className="px-5 py-3 border-b border-rule-strong bg-paper-deep flex items-center gap-2">
                  <Brain className="w-4 h-4 text-vermillion" />
                  <span className="text-sm text-ink font-semibold">Investigation Summary</span>
                  <span className="text-xs text-ink-mute ml-1">Transaction #42</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <span className="text-ink-mute">Sender</span>
                      <div className="text-ink-soft font-mono mt-0.5">Caribbean Trust Services</div>
                    </div>
                    <div>
                      <span className="text-ink-mute">Risk Score</span>
                      <div className="text-red-600 font-bold mt-0.5">87/100</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-ink-soft leading-relaxed italic">
                      "This wire transfer of €69,000 exhibits characteristics consistent with layering — a common AML
                      typology where funds are rapidly moved between accounts to obscure their origin. The high risk
                      score suggests potential structuring to avoid reporting thresholds..."
                    </p>
                  </div>
                </div>
              </div>
            </ScreenCaption>

            <ScreenCaption
              num={5}
              title="Transaction Table with Investigate Action"
              caption="Full transaction list fetched from Supabase, sorted by date descending. Flagged rows are highlighted. Each row has an 'Investigate' button that triggers the LLM investigation."
            >
              <div className="bg-white rounded-lg border border-rule-strong overflow-hidden">
                <div className="text-[10px]">
                  <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-paper-deep/80 text-ink-mute uppercase tracking-wider border-b border-rule-strong">
                    <span>ID</span><span>Type</span><span>Sender</span><span>Amount</span><span>Risk</span><span></span>
                  </div>
                  {[
                    { id: '7e47a081', type: 'WIRE', sender: 'Caribbean Trust', amount: '€69,000', risk: 87, flagged: true },
                    { id: 'ba1eb592', type: 'RENT', sender: 'Cityline Group', amount: '€10.50', risk: 6, flagged: false },
                    { id: '36f660ea', type: 'SOFTWARE', sender: 'EuroCloud Ltd', amount: '€3,200', risk: 20, flagged: false },
                  ].map((row) => (
                    <div key={row.id} className={`grid grid-cols-6 gap-2 px-4 py-2 items-center ${row.flagged ? 'bg-red-50/60 border-l-2 border-l-red-500' : ''}`}>
                      <span className="text-vermillion font-mono">{row.id}</span>
                      <span className="text-ink-soft">{row.type}</span>
                      <span className="text-ink-soft">{row.sender}</span>
                      <span className="text-ink font-semibold">{row.amount}</span>
                      <span className={`font-bold ${row.risk >= 80 ? 'text-red-600' : row.risk >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>{row.risk}</span>
                      <span className="px-2 py-0.5 rounded bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold text-center">Investigate</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScreenCaption>
          </div>
        </section>

        {/* What I'd Do Differently */}
        <section className="mb-16">
          <SectionHeader icon={Lightbulb} color="amber" title="What I'd Do Differently" />
          <div className="bg-paper-deep border border-rule-strong rounded-none p-6 md:p-8">
            <div className="space-y-4">
              <ReflectionItem
                title="Live transaction feeds"
                text="Replace batch data loading with real-time WebSocket subscriptions via Supabase Realtime, enabling analysts to see new transactions as they arrive."
              />
              <ReflectionItem
                title="Regulator-specific SAR templates"
                text="Build SAR templates that match the exact format required by specific regulators (FinCEN, FCA, BaFin) — not just a generic summary."
              />
              <ReflectionItem
                title="Cross-border case expansion"
                text="Add multi-currency normalization, timezone-aware analysis, and jurisdiction-specific risk weightings for international transaction corridors."
              />
              <ReflectionItem
                title="Batch investigation workflows"
                text="Allow analysts to select multiple related transactions and run a single AI investigation across the group, identifying connected patterns."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 border-t border-rule-strong">
          <h2 className="text-2xl font-display font-semibold text-ink mb-3">See it in action</h2>
          <p className="text-ink-soft mb-6">Explore the live demo with pre-loaded AML case data</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onEnterDemo}
              className="px-6 py-3 bg-ink hover:bg-oxblood text-paper rounded-none font-semibold flex items-center gap-2 transition-all shadow-[3px_3px_0_0_var(--ink)]"
            >
              Enter Live Demo
              <ExternalLink className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white hover:bg-paper-deep text-ink rounded-none font-semibold flex items-center gap-2 transition-all border border-rule-strong shadow-sm"
            >
              GitHub Repo
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-rule-strong py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-mute">
            Built by <span className="text-ink-soft font-medium">Aurimas Nausėdas</span>
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://cleartrace.aurimas.io"
              className="text-vermillion hover:text-oxblood font-medium transition-colors flex items-center gap-1.5"
            >
              Live Demo
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-soft hover:text-ink transition-colors flex items-center gap-1.5"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://aurimas.io"
              className="text-ink-soft hover:text-ink transition-colors flex items-center gap-1.5"
            >
              aurimas.io
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Helper components ── */

function SectionHeader({ icon: Icon, color, title }: { icon: typeof Shield; color: string; title: string }) {
  const colorMap: Record<string, string> = {
    red: 'from-red-500 to-rose-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    cyan: 'from-cyan-500 to-blue-500',
    green: 'from-emerald-500 to-green-500',
    blue: 'from-blue-500 to-cyan-500',
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-none bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl font-display font-semibold text-ink">{title}</h2>
    </div>
  );
}

function ProblemStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white border border-red-100 rounded-lg p-4 text-center shadow-sm">
      <div className="text-2xl font-display font-semibold text-red-600">{value}</div>
      <div className="text-xs text-red-700/80 mt-1 font-medium">{label}</div>
    </div>
  );
}

function ApproachCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: typeof Brain }) {
  return (
    <div className="bg-white rounded-none p-5 card-shadow hover:card-shadow-lg transition-all">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-vermillion" />
        <h3 className="text-ink font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-sm text-ink-soft leading-relaxed">{desc}</p>
    </div>
  );
}

function OutcomeStat({ value, label, color }: { value: string; label: string; color: string }) {
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    emerald: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    blue: { text: 'text-vermillion', bg: 'bg-paper-deep', border: 'border-rule-strong' },
    cyan: { text: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-none p-6 text-center ${c.bg} border ${c.border}`}>
      <div className={`text-3xl font-display font-semibold ${c.text}`}>{value}</div>
      <div className="text-sm text-ink-soft mt-1 font-medium">{label}</div>
    </div>
  );
}

function OutcomeItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
      <p className="text-ink-soft leading-relaxed">{text}</p>
    </div>
  );
}

function ReflectionItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-ink font-semibold text-sm mb-0.5">{title}</h4>
        <p className="text-sm text-ink-soft leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ScreenCaption({
  num,
  title,
  caption,
  children,
}: {
  num: number;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-ink-mute bg-paper-deep px-2 py-1 rounded">0{num}</span>
        <h3 className="text-ink font-semibold">{title}</h3>
      </div>
      {children}
      <p className="text-sm text-ink-mute mt-3 italic">{caption}</p>
    </div>
  );
}
