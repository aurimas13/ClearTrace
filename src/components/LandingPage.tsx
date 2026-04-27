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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">How ClearTrace Works</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-4">
                <div className="shrink-0">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-6 bg-slate-200 mx-auto mt-2" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">{step.num}</span>
                    <h4 className="text-slate-900 font-semibold">{step.title}</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
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
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-blue-200/40 via-indigo-100/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">ClearTrace Intelligence</span>
          </div>
          <a
            href="https://aurimas.io"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Back to aurimas.io
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <Shield className="w-3.5 h-3.5" />
            AI-Powered AML Investigation Platform
          </div>

          {/* Headline — both lines stay on one line at any zoom, identical size via clamp().
              Upper bound chosen so the longer line ('Start Investigating Smarter.') fits inside
              the max-w-5xl (1024px) hero container even at very wide viewports; padding kept to
              avoid clipping the gradient-clipped tail of the second line. */}
          <h1
            className="font-extrabold text-slate-900 leading-[1.08] mb-6 tracking-tight px-2"
            style={{ fontSize: 'clamp(1.5rem, 5.4vw, 4rem)' }}
          >
            <span className="block whitespace-nowrap">Stop Chasing False Positives.</span>
            <span className="block whitespace-nowrap text-gradient-brand">Start Investigating Smarter.</span>
          </h1>

          {/* Problem statement */}
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Fraud analysts spend <span className="text-slate-900 font-semibold">over 60% of their time</span> on manual transaction review and SAR preparation.
            ClearTrace streamlines threat investigation by using LLM-orchestrated tools to highlight real risks, map financial flows, and draft reports - empowering analysts to focus on decision-making while maintaining human oversight.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={onEnterDemo}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold text-lg flex items-center gap-3 transition-all primary-shadow hover:-translate-y-0.5"
            >
              <span className="relative">Enter Live Demo</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-semibold text-lg flex items-center gap-3 transition-all border border-slate-300 shadow-sm"
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
                <div key={i} className="group bg-white rounded-2xl p-6 text-center card-shadow hover:card-shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="text-4xl font-extrabold text-gradient-brand mb-1">{m.value}</div>
                  <div className="text-sm text-slate-600">{m.label}</div>
                </div>
              );
            })}
          </div>

          {/* Dashboard preview — clickable to enter demo */}
          <div
            onClick={onEnterDemo}
            className="group relative rounded-2xl overflow-hidden card-shadow-lg hover:-translate-y-1 transition-all mb-16 cursor-pointer bg-white"
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 z-10 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-6 py-3 bg-blue-700 rounded-xl text-white font-semibold shadow-xl">
                <ArrowRight className="w-5 h-5" />
                Enter Live Demo
              </div>
            </div>
            <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
              Preview
            </div>
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <span className="text-xs text-slate-500 ml-2 font-mono">cleartrace.aurimas.io</span>
            </div>
            <div className="bg-white p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-lg p-4">
                  <div className="text-xs text-red-700 mb-1 font-medium">High Risk Alerts</div>
                  <div className="text-2xl font-bold text-red-700">13</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-4">
                  <div className="text-xs text-amber-700 mb-1 font-medium">Pending Review</div>
                  <div className="text-2xl font-bold text-amber-700">15</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                  <div className="text-xs text-blue-700 mb-1 font-medium">Avg Risk Score</div>
                  <div className="text-2xl font-bold text-blue-700">36</div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
                <div className="text-sm text-slate-900 font-semibold mb-3">Transaction Network</div>
                <div className="flex items-center justify-center gap-8">
                  {['Sender A', 'Hub', 'Receiver B', 'Shell Co'].map((n, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-mono ${i === 3 ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-300 bg-blue-50 text-blue-700'}`}>
                        {n.charAt(0)}
                      </div>
                      {i < 3 && <div className="w-8 h-px bg-slate-300" />}
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
                  <div key={i} className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs ${row.flagged ? 'bg-red-50 border border-red-100' : 'bg-slate-50 border border-slate-200'}`}>
                    <span className="text-slate-500 font-mono">TXN-{1000 + i}</span>
                    <span className="text-slate-700 font-medium">{row.type}</span>
                    <span className="text-slate-600">{row.amount}</span>
                    <span className={`font-bold ${row.risk >= 80 ? 'text-red-600' : 'text-emerald-600'}`}>{row.risk}</span>
                    {row.flagged && (
                      <span className="text-red-600 text-[10px] font-semibold">Flagged</span>
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
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium hover:border-blue-300 hover:text-blue-700 shadow-sm transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 py-6 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Built by <span className="text-slate-900 font-semibold">Aurimas Nausėdas</span>
          </p>
          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={onCaseStudy}
              className="text-blue-700 hover:text-blue-900 font-medium transition-colors flex items-center gap-1.5"
            >
              Read the case study
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <a
              href="https://github.com/aurimas13/ClearTrace"
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://aurimas.io"
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
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
