import { AlertTriangle, FileSearch, Database, ExternalLink, BarChart3, Command } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    alerts?: number;
    investigations?: number;
    pipelines?: number;
    compliance?: number;
  };
  onOpenCommandPalette?: () => void;
}

/**
 * Sidebar — re-skinned to the dossier palette.
 * Paper background, vermillion active marker on the leading edge, mono tab
 * labels with Roman-numeral section markers, display-serif nameplate.
 */
export default function Sidebar({ activeTab, onTabChange, counts, onOpenCommandPalette }: SidebarProps) {
  const menuItems = [
    { id: 'alerts',         section: 'I',   label: 'Alerts',          icon: AlertTriangle, count: counts?.alerts },
    { id: 'investigations', section: 'II',  label: 'Investigations',  icon: FileSearch,    count: counts?.investigations },
    { id: 'compliance',     section: 'III', label: 'Compliance',      icon: BarChart3,     count: counts?.compliance },
    { id: 'pipelines',      section: 'IV',  label: 'Pipelines',       icon: Database,      count: counts?.pipelines },
  ];

  return (
    <aside className="w-64 bg-paper border-r border-rule-strong h-screen flex flex-col font-serif text-ink">
      {/* Nameplate */}
      <div className="px-5 pt-6 pb-5 border-b border-ink relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-mute mb-1">
          Vol. I · The
        </p>
        <h1
          className="font-display font-semibold text-ink leading-[0.9]"
          style={{ fontSize: '2rem', fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 1" }}
        >
          ClearTrace
        </h1>
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-vermillion mt-1.5">
          Editorial · Daily
        </p>
        {/* Top-corner ornament */}
        <div className="absolute top-3 right-4 font-display text-vermillion text-2xl leading-none" style={{ fontVariationSettings: "'opsz' 9, 'SOFT' 100, 'WONK' 1" }}>
          §
        </div>
      </div>

      {/* Section index header */}
      <div className="px-5 pt-5 pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-mute">
          Index
        </p>
      </div>

      {/* Tabs */}
      <nav className="flex-1 px-3">
        <ul className="space-y-0">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative w-full flex items-baseline gap-3 px-2 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-paper-deep'
                      : 'hover:bg-paper-deep/60'
                  }`}
                >
                  {/* Vermillion left bar marks the active section. */}
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] transition-all ${
                      isActive ? 'bg-vermillion' : 'bg-transparent group-hover:bg-rule-strong'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`font-display text-[1.05rem] leading-none w-7 shrink-0 ${
                      isActive ? 'text-vermillion' : 'text-ink-mute'
                    }`}
                    style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 0" }}
                  >
                    {item.section}
                  </span>
                  <Icon
                    className={`w-4 h-4 self-center ${
                      isActive ? 'text-ink' : 'text-ink-mute'
                    }`}
                  />
                  <span
                    className={`font-display flex-1 leading-tight ${
                      isActive ? 'text-ink font-semibold' : 'text-ink-soft group-hover:text-ink'
                    }`}
                    style={{ fontSize: '1.02rem', fontVariationSettings: "'opsz' 16, 'SOFT' 30" }}
                  >
                    {item.label}
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`self-center font-mono text-[11px] tabular-nums px-1.5 py-0.5 ${
                        isActive
                          ? 'text-vermillion border border-vermillion'
                          : 'text-ink-mute border border-rule-strong'
                      }`}
                    >
                      {String(item.count).padStart(2, '0')}
                    </span>
                  )}
                </button>
                {i < menuItems.length - 1 && <div className="hairline-thin mx-2" />}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer block */}
      <div className="px-4 pb-5 pt-4 space-y-3 border-t border-ink">
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title="Open command palette"
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-paper-deep border border-ink hover:bg-ink hover:text-paper transition-colors group"
          >
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              <Command className="w-3.5 h-3.5" />
              Quick Command
            </span>
            <kbd className="font-mono text-[10px] tracking-wider px-1.5 py-0.5 border border-ink bg-paper text-ink group-hover:bg-paper group-hover:text-ink">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Status — printed like a wire-service ticker */}
        <div className="border-l-2 border-vermillion pl-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-ink-mute">Wire Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vermillion opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-vermillion"></span>
            </span>
            <span className="font-display text-[15px] text-ink leading-none italic" style={{ fontVariationSettings: "'opsz' 16, 'SOFT' 50" }}>
              All wires open
            </span>
          </div>
        </div>

        <a
          href="https://aurimas.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute hover:text-ink transition-colors pt-1"
        >
          <ExternalLink className="w-3 h-3" />
          aurimas.io
        </a>
      </div>
    </aside>
  );
}
