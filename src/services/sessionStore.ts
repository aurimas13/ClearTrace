/**
 * Lightweight sessionStorage-backed stores for demo-only state that doesn't
 * require a database schema change:
 *   - Audit log (per investigation event timeline)
 *   - Reviewer assignments (per investigation)
 *   - Current analyst identity (who is "me" for the "My cases" filter)
 *
 * In production these would all be proper Postgres tables with RLS.
 */

export type AuditEventType =
  | 'case_opened'
  | 'reinvestigated'
  | 'note_saved'
  | 'status_changed'
  | 'sar_drafted'
  | 'sar_filed'
  | 'assigned'
  | 'reset';

export interface AuditEvent {
  id: string;
  ts: string; // ISO timestamp
  type: AuditEventType;
  /** Free-text human description */
  message: string;
  /** Who performed the action (analyst name or "AI"/"System") */
  actor: string;
}

const AUDIT_KEY = 'cleartrace_audit_log';
const ASSIGNEES_KEY = 'cleartrace_assignees';
const ME_KEY = 'cleartrace_current_analyst';

export const ANALYSTS = [
  'Maria Schmidt',
  'James Thompson',
  'Ana Kowalski',
  'Daniel Park',
  'Unassigned',
] as const;

export type AnalystName = (typeof ANALYSTS)[number];

// ─── Audit Log ──────────────────────────────────────────────────────────────

function loadAuditLog(): Record<string, AuditEvent[]> {
  try {
    return JSON.parse(sessionStorage.getItem(AUDIT_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAuditLog(log: Record<string, AuditEvent[]>) {
  try {
    sessionStorage.setItem(AUDIT_KEY, JSON.stringify(log));
  } catch {
    // ignore quota errors
  }
}

export function getAuditLog(investigationId: number | string): AuditEvent[] {
  const log = loadAuditLog();
  return log[String(investigationId)] || [];
}

export function getAllAuditEvents(): { investigationId: string; event: AuditEvent }[] {
  const log = loadAuditLog();
  const out: { investigationId: string; event: AuditEvent }[] = [];
  for (const [id, events] of Object.entries(log)) {
    for (const event of events) out.push({ investigationId: id, event });
  }
  return out.sort((a, b) => b.event.ts.localeCompare(a.event.ts));
}

export function addAuditEvent(
  investigationId: number | string,
  type: AuditEventType,
  message: string,
  actor: string = 'System'
) {
  const log = loadAuditLog();
  const key = String(investigationId);
  const event: AuditEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    type,
    message,
    actor,
  };
  log[key] = [...(log[key] || []), event];
  saveAuditLog(log);
  return event;
}

export function clearAuditLog() {
  try {
    sessionStorage.removeItem(AUDIT_KEY);
  } catch {
    // ignore
  }
}

// ─── Assignees ──────────────────────────────────────────────────────────────

function loadAssignees(): Record<string, AnalystName> {
  try {
    return JSON.parse(sessionStorage.getItem(ASSIGNEES_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAssignees(map: Record<string, AnalystName>) {
  try {
    sessionStorage.setItem(ASSIGNEES_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getAssignee(investigationId: number | string): AnalystName {
  const map = loadAssignees();
  return (map[String(investigationId)] as AnalystName) || 'Unassigned';
}

export function getAllAssignees(): Record<string, AnalystName> {
  return loadAssignees();
}

export function setAssignee(investigationId: number | string, analyst: AnalystName) {
  const map = loadAssignees();
  map[String(investigationId)] = analyst;
  saveAssignees(map);
}

export function clearAssignees() {
  try {
    sessionStorage.removeItem(ASSIGNEES_KEY);
  } catch {
    // ignore
  }
}

// ─── Current analyst ("me") ─────────────────────────────────────────────────

export function getCurrentAnalyst(): AnalystName {
  try {
    const stored = sessionStorage.getItem(ME_KEY) as AnalystName | null;
    if (stored && ANALYSTS.includes(stored)) return stored;
  } catch {
    // ignore
  }
  // Default: first real analyst (not "Unassigned")
  return ANALYSTS[0];
}

export function setCurrentAnalyst(analyst: AnalystName) {
  try {
    sessionStorage.setItem(ME_KEY, analyst);
  } catch {
    // ignore
  }
}
