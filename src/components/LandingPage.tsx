import { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Network,
  Brain,
  FileSearch,
  ChevronRight,
  ExternalLink,
  X,
  ArrowDownRight,
  BarChart3,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onEnterDemo: () => void;
}

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const steps = [
    {
      num: '01',
      title: 'Transaction Ingestion',
      desc: 'Real-time financial transaction data flows in from banking systems via Supabase (PostgreSQL). Each record includes sender, receiver, amount, currency, and timestamps.',
      color: 'from-blue-500 to-cyan-500',
      icon: ArrowDownRight,
    },
    {
      num: '02',
      title: 'Automated Risk Scoring',
      desc: 'Every transaction is scored 0–100 using rule-based heuristics: cross-border patterns, structuring indicators, velocity anomalies, and counterparty risk profiles.',
      color: 'from-amber-500 to-orange-500',
      icon: BarChart3,
    },
    {
      num: '03',
      title: 'Network Visualization',
      desc: 'React Flow renders an interactive graph of sender-receiver relationships. Multi-hop patterns, circular funding, and smurfing networks become immediately visible.',
      color: 'from-purple-500 to-pink-500',
      icon: Network,
    },
    {
      num: '04',
      title: 'AI Investigation (LLM)',
      desc: 'Clicking "AI Analyze" sends transaction context to Claude, which returns a FinCrime analyst assessment citing specific AML typologies. Results are stored for audit.',
      color: 'from-emerald-500 to-green-500',
      icon: Brain,
    },
    {
      num: '05',
      title: 'SAR Draft Generation',
      desc: 'The AI summary, risk score, and network context are compiled into a Suspicious Activity Report draft — ready for human review and regulatory submission.',
      color: 'from-red-500 to-rose-500',
      icon: FileSearch,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">How ClearTrace Works</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-4">
                <div className="shrink-0">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-6 bg-slate-700 mx-auto mt-2" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{step.num}</span>
                    <h4 className="text-white font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            Human-in-the-loop at every decision point. The AI assists — it never autonomously files reports.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onEnterDemo }: LandingPageProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const metrics = [
    { value: '50%', label: 'Reduction in manual review time', icon: Clock },
    { value: '3→1', label: 'Hours to generate SAR drafts', icon: FileSearch },
    { value: '67%', label: 'Faster investigation cycle', icon: CheckCircle2 },
  ];

  const techStack = [
    'React', 'TypeScript', 'Tailwind CSS', 'React Flow', 'Supabase', 'Claude AI', 'Vercel',
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">ClearTrace Intelligence</span>
          </div>
          <a
            href="https://aurimas.io"
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Back to aurimas.io
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
            <Shield className="w-3.5 h-3.5" />
            AI-Powered AML Investigation Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Stop Chasing False Positives.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Start Investigating Smarter.
            </span>
          </h1>

          {/* Problem statement */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Fraud analysts spend <span className="text-white font-semibold">60%+ of their time</span> on manual transaction review and SAR preparation.
            ClearTrace uses LLM-orchestrated investigation to surface real threats, visualize money networks, and draft reports — with humans always in the loop.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={onEnterDemo}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold text-lg flex items-center gap-3 transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-500/40"
            >
              Enter Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg flex items-center gap-3 transition-all border border-slate-700"
            >
              How It Works
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-16">
            Pre-loaded with sample AML case data — no setup required
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white mb-1">{m.value}</div>
                  <div className="text-sm text-slate-400">{m.label}</div>
                </div>
              );
            })}
          </div>

          {/* Screenshot placeholder — shows a preview of the dashboard */}
          <div className="relative rounded-xl border border-slate-700 overflow-hidden shadow-2xl shadow-black/40 mb-16">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-700 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-xs text-slate-500 ml-2 font-mono">cleartrace.aurimas.io</span>
            </div>
            <div className="bg-slate-950 p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">High Risk Alerts</div>
                  <div className="text-2xl font-bold text-red-400">13</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">Pending Review</div>
                  <div className="text-2xl font-bold text-amber-400">15</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs text-slate-500 mb-1">Avg Risk Score</div>
                  <div className="text-2xl font-bold text-blue-400">36</div>
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 mb-4">
                <div className="text-sm text-white font-semibold mb-3">Transaction Network</div>
                <div className="flex items-center justify-center gap-8">
                  {['Sender A', 'Hub', 'Receiver B', 'Shell Co'].map((n, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-mono ${i === 3 ? 'border-red-500 bg-red-950/50 text-red-400' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
                        {n.charAt(0)}
                      </div>
                      {i < 3 && <div className="w-8 h-px bg-slate-600" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { risk: 87, flagged: true },
                  { risk: 42, flagged: false },
                  { risk: 91, flagged: true },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs ${row.flagged ? 'bg-red-500/5 border border-red-500/20' : 'bg-slate-800/40 border border-slate-700/50'}`}>
                    <span className="text-slate-400 font-mono">TXN-{1000 + i}</span>
                    <span className="text-slate-300">WIRE_TRANSFER</span>
                    <span className={`font-bold ${row.risk >= 80 ? 'text-red-400' : 'text-green-400'}`}>{row.risk}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px]">AI Analyze</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div className="mb-16">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Built with</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-300 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Built by <span className="text-slate-300 font-medium">Aurimas Nausėdas</span>
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://aurimas.io/projects/cleartrace"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
            >
              Read the case study
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/aurimas13/ClearTrace"
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

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </div>
  );
}
