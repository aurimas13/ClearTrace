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
  onCaseStudy: () => void;
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

export default function LandingPage({ onEnterDemo, onCaseStudy }: LandingPageProps) {
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-white/5 backdrop-blur-sm bg-[#0a0a12]/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ClearTrace Intelligence</span>
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
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-emerald-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Shield className="w-3.5 h-3.5" />
            AI-Powered AML Investigation Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
            Stop Chasing False Positives.
            <br />
            <span className="text-gradient-brand">
              Start Investigating Smarter.
            </span>
          </h1>

          {/* Problem statement */}
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Fraud analysts spend <span className="text-white font-semibold">over 60% of their time</span> on manual transaction review and SAR preparation.
            ClearTrace streamlines threat investigation by using LLM-orchestrated tools to highlight real risks, map financial flows, and draft reports—empowering analysts to focus on decision-making while maintaining human oversight.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={onEnterDemo}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:via-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-lg flex items-center gap-3 transition-all shadow-2xl shadow-indigo-600/40 hover:shadow-violet-500/50 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
              <span className="relative">Enter Live Demo</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-lg flex items-center gap-3 transition-all border border-white/10 backdrop-blur-sm"
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
                <div key={i} className="relative group bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm hover:border-indigo-500/40 transition-colors">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div className="relative text-4xl font-extrabold text-gradient-brand mb-1">{m.value}</div>
                  <div className="relative text-sm text-slate-400">{m.label}</div>
                </div>
              );
            })}
          </div>

          {/* Dashboard preview — clickable to enter demo */}
          <div
            onClick={onEnterDemo}
            className="group relative rounded-xl border border-slate-700 overflow-hidden shadow-2xl shadow-black/40 mb-16 cursor-pointer"
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-white font-semibold shadow-xl">
                <ArrowRight className="w-5 h-5" />
                Enter Live Demo
              </div>
            </div>
            <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-600/50 text-[10px] text-slate-400 uppercase tracking-wider">
              Preview
            </div>
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
                  { risk: 87, flagged: true, type: 'WIRE_TRANSFER', amount: '€69,000' },
                  { risk: 42, flagged: false, type: 'TAX_PAYMENT', amount: '€14,818' },
                  { risk: 91, flagged: true, type: 'WIRE_TRANSFER', amount: '€125,400' },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs ${row.flagged ? 'bg-red-500/5 border border-red-500/20' : 'bg-slate-800/40 border border-slate-700/50'}`}>
                    <span className="text-slate-400 font-mono">TXN-{1000 + i}</span>
                    <span className="text-slate-300">{row.type}</span>
                    <span className="text-slate-400">{row.amount}</span>
                    <span className={`font-bold ${row.risk >= 80 ? 'text-red-400' : 'text-green-400'}`}>{row.risk}</span>
                    {row.flagged && (
                      <span className="text-red-400/60 text-[10px]">Flagged</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div className="mb-16">
            <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-4 font-semibold">Built with</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 font-medium backdrop-blur-sm hover:bg-white/10 hover:border-indigo-500/30 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-6 backdrop-blur-sm bg-[#0a0a12]/80">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Built by <span className="text-slate-300 font-medium">Aurimas Nausėdas</span>
          </p>
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={onCaseStudy}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
            >
              Read the case study
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
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
