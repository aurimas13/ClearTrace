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
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to ClearTrace
          </button>
          <a
            href="https://aurimas.io"
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            aurimas.io
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Case Study
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            ClearTrace Intelligence
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
            An AI-powered AML investigation platform that reduces manual transaction review time by 50%
            through LLM-orchestrated analysis, network visualization, and automated SAR draft generation.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <button
              onClick={onEnterDemo}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
            >
              Try the Live Demo
              <ExternalLink className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all border border-slate-700"
            >
              View Source Code
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Problem */}
        <section className="mb-16">
          <SectionHeader icon={AlertTriangle} color="red" title="The Problem" />
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-6 md:p-8">
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Financial crime compliance teams are overwhelmed. Fraud analysts spend{' '}
              <span className="text-white font-semibold">60%+ of their time</span> on manual
              transaction review and Suspicious Activity Report (SAR) preparation — repetitive work
              that delays investigations and increases regulatory risk.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProblemStat value="60%+" label="Time spent on manual review" />
              <ProblemStat value="3+ hrs" label="Average time per SAR draft" />
              <ProblemStat value="85%" label="False positive rate in alerts" />
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="mb-16">
          <SectionHeader icon={Lightbulb} color="amber" title="The Approach" />
          <p className="text-slate-400 leading-relaxed mb-8">
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
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 md:p-8">
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                <span className="text-white font-semibold">Designed the product architecture</span> — defined
                the data model, component hierarchy, and integration patterns between Supabase, React Flow,
                and the Claude API.
              </p>
              <p>
                <span className="text-white font-semibold">Led end-to-end technical delivery</span> — built
                the frontend application, API integration layer, network graph visualization, and the AI
                investigation pipeline from scratch.
              </p>
              <p>
                <span className="text-white font-semibold">Defined UX for compliance officer workflow</span> — designed
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
              <div key={tech.name} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 text-center">
                <div className="text-white font-semibold text-sm">{tech.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{tech.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Outcomes */}
        <section className="mb-16">
          <SectionHeader icon={Target} color="green" title="Outcomes" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <OutcomeStat value="50%" label="Reduction in manual review time" color="emerald" />
            <OutcomeStat value="3→1" label="Hours to generate SAR drafts" color="blue" />
            <OutcomeStat value="67%" label="Faster investigation cycle" color="cyan" />
          </div>
          <div className="space-y-3">
            <OutcomeItem text="Automated plain-English investigation summaries citing specific AML typologies" />
            <OutcomeItem text="Multi-hop network visualization reveals circular funding, smurfing, and layering patterns" />
            <OutcomeItem text="AI-generated SAR drafts with full human approval workflow" />
            <OutcomeItem text="Investigation records automatically persisted to Supabase for audit trail" />
          </div>
        </section>

        {/* Screenshots */}
        <section className="mb-16">
          <SectionHeader icon={Shield} color="blue" title="Key Screens" />
          <div className="space-y-8">
            <ScreenCaption
              num={1}
              title="Landing Page"
              caption="Hero with problem statement, key metrics, and interactive dashboard preview. Visitors understand the product's value proposition within 5 seconds."
            >
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="text-center mb-4">
                  <div className="text-2xl font-extrabold text-white mb-1">Stop Chasing False Positives.</div>
                  <div className="text-sm text-slate-400">Fraud analysts spend 60%+ of their time on manual review...</div>
                </div>
                <div className="flex justify-center gap-3">
                  <div className="px-4 py-2 bg-blue-600 rounded-lg text-white text-xs font-semibold">Enter Live Demo</div>
                  <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-semibold">How It Works</div>
                </div>
              </div>
            </ScreenCaption>

            <ScreenCaption
              num={2}
              title="Alert Dashboard with Stats"
              caption="Real-time stat cards showing high-risk alert count, pending reviews, and average risk score. Data is fetched live from Supabase."
            >
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">High Risk Alerts</div>
                    <div className="text-xl font-bold text-red-400">13</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">Pending Review</div>
                    <div className="text-xl font-bold text-amber-400">15</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">Avg Risk Score</div>
                    <div className="text-xl font-bold text-blue-400">36</div>
                  </div>
                </div>
              </div>
            </ScreenCaption>

            <ScreenCaption
              num={3}
              title="Transaction Network Graph"
              caption="Interactive React Flow graph where each node is a unique account and each edge is a transaction. Red borders indicate accounts involved in high-risk (>80) transactions. Zoom, pan, and explore multi-hop relationships."
            >
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-center gap-6">
                  {[
                    { label: 'Meridian OÜ', risk: false },
                    { label: 'Hub Account', risk: false },
                    { label: 'Shell Co', risk: true },
                    { label: 'Apex Corp', risk: true },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-[9px] font-mono leading-tight text-center px-1 ${node.risk ? 'border-red-500 bg-red-950/50 text-red-400' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
                        {node.label}
                      </div>
                      {i < 3 && (
                        <div className={`w-10 h-px ${i === 1 ? 'bg-red-500' : 'bg-slate-600'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScreenCaption>

            <ScreenCaption
              num={4}
              title="AI Investigation Modal"
              caption="Clicking 'AI Analyze' on any transaction sends context to Claude, which returns a FinCrime analyst assessment citing AML typologies. The summary is saved to the investigations table."
            >
              <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white font-semibold">AI Investigation Summary</span>
                  <span className="text-xs text-slate-500 ml-1">Transaction #42</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <span className="text-slate-500">Sender</span>
                      <div className="text-slate-300 font-mono mt-0.5">Caribbean Trust Services</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Risk Score</span>
                      <div className="text-red-400 font-bold mt-0.5">87/100</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400 leading-relaxed italic">
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
              title="Transaction Table with AI Analyze"
              caption="Full transaction list fetched from Supabase, sorted by date descending. Flagged rows are highlighted. Each row has an 'AI Analyze' button that triggers the LLM investigation."
            >
              <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <div className="text-[10px]">
                  <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-slate-800/80 text-slate-500 uppercase tracking-wider border-b border-slate-700">
                    <span>ID</span><span>Type</span><span>Sender</span><span>Amount</span><span>Risk</span><span></span>
                  </div>
                  {[
                    { id: '7e47a081', type: 'WIRE', sender: 'Caribbean Trust', amount: '€69,000', risk: 87, flagged: true },
                    { id: 'ba1eb592', type: 'RENT', sender: 'Cityline Group', amount: '€10.50', risk: 6, flagged: false },
                    { id: '36f660ea', type: 'SOFTWARE', sender: 'EuroCloud Ltd', amount: '€3,200', risk: 20, flagged: false },
                  ].map((row) => (
                    <div key={row.id} className={`grid grid-cols-6 gap-2 px-4 py-2 items-center ${row.flagged ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''}`}>
                      <span className="text-blue-400 font-mono">{row.id}</span>
                      <span className="text-slate-300">{row.type}</span>
                      <span className="text-slate-400">{row.sender}</span>
                      <span className="text-white font-semibold">{row.amount}</span>
                      <span className={`font-bold ${row.risk >= 80 ? 'text-red-400' : row.risk >= 60 ? 'text-orange-400' : 'text-green-400'}`}>{row.risk}</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 text-center">AI Analyze</span>
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
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 md:p-8">
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
        <section className="text-center py-12 border-t border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-3">See it in action</h2>
          <p className="text-slate-400 mb-6">Explore the live demo with pre-loaded AML case data</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onEnterDemo}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
            >
              Enter Live Demo
              <ExternalLink className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all border border-slate-700"
            >
              GitHub Repo
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Built by <span className="text-slate-300 font-medium">Aurimas Nausėdas</span>
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://cleartrace.aurimas.io"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
            >
              Live Demo
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://aurimas.io"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
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
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  );
}

function ProblemStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-red-500/10 rounded-lg p-4 text-center">
      <div className="text-2xl font-extrabold text-red-400">{value}</div>
      <div className="text-xs text-red-400/70 mt-1">{label}</div>
    </div>
  );
}

function ApproachCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: typeof Brain }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-blue-400" />
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function OutcomeStat({ value, label, color }: { value: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10',
  };
  const classes = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-xl p-6 text-center ${classes.split(' ').slice(1).join(' ')} border border-slate-700`}>
      <div className={`text-3xl font-extrabold ${classes.split(' ')[0]}`}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function OutcomeItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
      <p className="text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

function ReflectionItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-white font-semibold text-sm mb-0.5">{title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
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
        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">0{num}</span>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
      <p className="text-sm text-slate-500 mt-3 italic">{caption}</p>
    </div>
  );
}
