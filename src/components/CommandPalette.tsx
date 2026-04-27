import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Activity,
  BrainCircuit,
  BarChart3,
  Database,
  Hash,
  RotateCcw,
  Radio,
  Download,
  ArrowRight,
  Globe2,
} from 'lucide-react';
import type { SupabaseTransaction, Investigation } from '../types';
import { caseDisplayId } from '../types';
import { getCustomerRiskProfile } from '../services/customerRisk';

export type CommandAction =
  | { type: 'tab'; tab: 'alerts' | 'investigations' | 'compliance' | 'pipelines' }
  | { type: 'open_account'; account: string }
  | { type: 'focus_tx'; txId: number }
  | { type: 'open_case'; investigationId: string }
  | { type: 'reset_demo' }
  | { type: 'toggle_live' }
  | { type: 'export_alerts' };

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: CommandAction) => void;
  transactions: SupabaseTransaction[];
  investigations: Investigation[];
}

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  category: string;
  Icon: typeof Search;
  keywords: string;
  action: CommandAction;
}

export default function CommandPalette({
  open,
  onClose,
  onAction,
  transactions,
  investigations,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(0);
      // Defer to next frame so the input is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = [
      {
        id: 'tab-alerts',
        label: 'Go to Alerts',
        category: 'Navigate',
        Icon: Activity,
        keywords: 'alerts dashboard transactions',
        action: { type: 'tab', tab: 'alerts' },
      },
      {
        id: 'tab-investigations',
        label: 'Go to Investigations',
        category: 'Navigate',
        Icon: BrainCircuit,
        keywords: 'investigations cases sar',
        action: { type: 'tab', tab: 'investigations' },
      },
      {
        id: 'tab-compliance',
        label: 'Go to Compliance KPIs',
        category: 'Navigate',
        Icon: BarChart3,
        keywords: 'compliance kpi dashboard charts metrics',
        action: { type: 'tab', tab: 'compliance' },
      },
      {
        id: 'tab-pipelines',
        label: 'Go to Data Pipelines',
        category: 'Navigate',
        Icon: Database,
        keywords: 'pipelines data ingestion',
        action: { type: 'tab', tab: 'pipelines' },
      },
    ];

    const actionItems: CommandItem[] = [
      {
        id: 'act-export',
        label: 'Export current alerts as CSV',
        category: 'Actions',
        Icon: Download,
        keywords: 'export csv download alerts',
        action: { type: 'export_alerts' },
      },
      {
        id: 'act-toggle-live',
        label: 'Toggle live mode (auto-refresh)',
        category: 'Actions',
        Icon: Radio,
        keywords: 'live realtime auto-refresh poll',
        action: { type: 'toggle_live' },
      },
      {
        id: 'act-reset',
        label: 'Reset demo (clear all cases & audit log)',
        category: 'Actions',
        Icon: RotateCcw,
        keywords: 'reset clear demo',
        action: { type: 'reset_demo' },
      },
    ];

    // Account jump items
    const seen = new Set<string>();
    const accounts: CommandItem[] = [];
    for (const t of transactions) {
      for (const a of [t.sender_account, t.receiver_account]) {
        if (seen.has(a)) continue;
        seen.add(a);
        const p = getCustomerRiskProfile(a);
        accounts.push({
          id: `acc-${a}`,
          label: a,
          hint: `${p.legalName} · ${p.jurisdiction.code} · CRR ${p.crr}`,
          category: 'Accounts',
          Icon: Globe2,
          keywords: `${a} ${p.legalName} ${p.jurisdiction.code} ${p.jurisdiction.name}`,
          action: { type: 'open_account', account: a },
        });
        if (accounts.length >= 60) break;
      }
      if (accounts.length >= 60) break;
    }

    // Recent cases
    const cases: CommandItem[] = investigations.slice(0, 30).map((inv) => ({
      id: `case-${inv.id}`,
      label: `Case ${caseDisplayId(inv.id)}`,
      hint: `Tx #${inv.transaction_id} · ${inv.investigation_status}`,
      category: 'Cases',
      Icon: Hash,
      keywords: `case INV-${inv.id} ${inv.transaction_id} ${inv.investigation_status}`,
      action: { type: 'open_case', investigationId: inv.id },
    }));

    return [...navItems, ...actionItems, ...accounts, ...cases];
  }, [transactions, investigations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 50);
    return items
      .filter((it) => it.label.toLowerCase().includes(q) || it.keywords.toLowerCase().includes(q))
      .slice(0, 50);
  }, [items, query]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlight(0);
  }, [query]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = filtered[highlight];
        if (it) {
          onAction(it.action);
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, highlight, onAction, onClose]);

  if (!open) return null;

  // Group by category preserving order
  const grouped: { category: string; items: CommandItem[] }[] = [];
  for (const it of filtered) {
    const existing = grouped.find((g) => g.category === it.category);
    if (existing) existing.items.push(it);
    else grouped.push({ category: it.category, items: [it] });
  }

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            id="cleartrace-cmd-input"
            name="cleartrace-cmd"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tabs, actions, accounts, cases…"
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-500 border border-slate-200">
            ESC
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No results for "{query}"
            </div>
          )}
          {grouped.map((group) => (
            <div key={group.category}>
              <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {group.category}
              </div>
              {group.items.map((it) => {
                runningIndex += 1;
                const active = runningIndex === highlight;
                const Icon = it.Icon;
                return (
                  <button
                    key={it.id}
                    onMouseEnter={() => setHighlight(runningIndex)}
                    onClick={() => {
                      onAction(it.action);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${active ? 'text-blue-700' : 'text-slate-400'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium truncate ${active ? 'text-blue-900' : 'text-slate-800'}`}>
                        {it.label}
                      </div>
                      {it.hint && (
                        <div className="text-[11px] text-slate-500 truncate">{it.hint}</div>
                      )}
                    </div>
                    {active && <ArrowRight className="w-3.5 h-3.5 text-blue-700" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[10px] text-slate-500">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono">↑↓</kbd>{' '}
            navigate ·{' '}
            <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono">↵</kbd>{' '}
            select
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono">⌘K</kbd>{' '}
            toggle
          </span>
        </div>
      </div>
    </div>
  );
}
