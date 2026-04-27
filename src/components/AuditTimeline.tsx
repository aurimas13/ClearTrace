import {
  History,
  PlayCircle,
  Repeat,
  StickyNote,
  ArrowRightLeft,
  FileText,
  FileWarning,
  UserPlus,
  RotateCcw,
} from 'lucide-react';
import type { AuditEvent, AuditEventType } from '../services/sessionStore';

interface AuditTimelineProps {
  events: AuditEvent[];
}

const ICON_FOR: Record<AuditEventType, typeof PlayCircle> = {
  case_opened: PlayCircle,
  reinvestigated: Repeat,
  note_saved: StickyNote,
  status_changed: ArrowRightLeft,
  sar_drafted: FileText,
  sar_filed: FileWarning,
  assigned: UserPlus,
  reset: RotateCcw,
};

const COLOR_FOR: Record<AuditEventType, string> = {
  case_opened: 'bg-blue-50 text-blue-700 ring-blue-200',
  reinvestigated: 'bg-blue-50 text-blue-700 ring-blue-200',
  note_saved: 'bg-amber-50 text-amber-700 ring-amber-200',
  status_changed: 'bg-slate-100 text-slate-700 ring-slate-200',
  sar_drafted: 'bg-rose-50 text-rose-700 ring-rose-200',
  sar_filed: 'bg-red-50 text-red-700 ring-red-200',
  assigned: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  reset: 'bg-slate-100 text-slate-600 ring-slate-200',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AuditTimeline({ events }: AuditTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic">No audit events yet for this case.</div>
    );
  }

  // Newest first
  const sorted = [...events].sort((a, b) => b.ts.localeCompare(a.ts));

  return (
    <ol className="relative space-y-3">
      {/* Vertical line */}
      <div className="absolute left-[14px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
      {sorted.map((e) => {
        const Icon = ICON_FOR[e.type] || History;
        const color = COLOR_FOR[e.type] || COLOR_FOR.status_changed;
        return (
          <li key={e.id} className="relative pl-10">
            <span
              className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${color}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div className="text-sm text-slate-800 leading-snug">{e.message}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              <span className="font-medium text-slate-700">{e.actor}</span> · {formatTime(e.ts)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
