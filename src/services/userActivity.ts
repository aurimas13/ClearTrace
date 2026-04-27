/**
 * User Activity tracking service.
 *
 * Persists in localStorage (NOT sessionStorage) so we can detect returning
 * users across browser sessions. Captures a chronological event log per
 * user, plus aggregate counters for fast rendering.
 *
 * Data model (per local user):
 *   {
 *     userId: uuid (random, generated on first visit)
 *     firstSeenAt: ISO timestamp
 *     lastSeenAt:  ISO timestamp
 *     sessionCount: number          // bumped once per browser session
 *     eventCount:   number          // total events ever recorded
 *     events: ActivityEvent[]       // ring buffer, capped at MAX_EVENTS
 *   }
 *
 * The store is intentionally client-only \u2014 no PII leaves the browser. In a
 * real product we'd ship these events to a /v1/telemetry endpoint, but for
 * the demo localStorage gives the same observable behaviour: someone leaves,
 * comes back tomorrow, and the app greets them with their stats.
 */

const STORAGE_KEY = 'cleartrace_user_activity';
const SESSION_MARK_KEY = 'cleartrace_user_session_marked';
const MAX_EVENTS = 500;

export type ActivityEventType =
  // Session lifecycle
  | 'session_started'
  | 'demo_entered'
  | 'landing_visited'
  | 'casestudy_visited'
  // Navigation
  | 'tab_switched'
  | 'command_palette_opened'
  // Data inspection
  | 'account_inspected'
  | 'transaction_focused'
  | 'network_node_clicked'
  // Investigation actions
  | 'transaction_investigated'
  | 'case_status_changed'
  | 'case_note_saved'
  | 'case_assigned'
  | 'sar_drafted'
  | 'sar_filed'
  | 'case_printed'
  | 'sanctions_panel_opened'
  | 'explainability_opened'
  | 'document_ai_run'
  // System actions
  | 'live_mode_toggled'
  | 'demo_reset'
  | 'data_refreshed'
  | 'export_alerts'
  | 'export_cases'
  | 'analyst_switched'
  | 'filters_changed'
  | 'activity_panel_opened';

export interface ActivityEvent {
  id: string;
  ts: string; // ISO
  type: ActivityEventType;
  /** Free-form, JSON-serialisable detail payload */
  payload?: Record<string, string | number | boolean | null>;
}

export interface UserActivityState {
  userId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  sessionCount: number;
  eventCount: number;
  events: ActivityEvent[];
}

/**
 * Coarse classification driving the welcome-back banner.
 *
 * - first_visit  : never seen before, just minted
 * - returning    : has visited in a prior session
 * - power_user   : 5+ sessions OR 100+ events recorded
 */
export type UserStatus = 'first_visit' | 'returning' | 'power_user';

// ─── Internal storage helpers ────────────────────────────────────────────────

function uuid(): string {
  // Crypto-strong UUID where available, else fallback.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto & { randomUUID: () => string }).randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function load(): UserActivityState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserActivityState;
    if (!parsed || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(state: UserActivityState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota/private-mode failures
  }
}

function freshState(): UserActivityState {
  const now = new Date().toISOString();
  return {
    userId: uuid(),
    firstSeenAt: now,
    lastSeenAt: now,
    sessionCount: 0,
    eventCount: 0,
    events: [],
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Idempotently ensure we have a user row, increment the session counter
 * exactly once per browser session, and record a `session_started` event.
 *
 * Returns the snapshot for the caller (used to show the welcome toast).
 */
export function bootstrapSession(): {
  state: UserActivityState;
  isNewUser: boolean;
  isNewSession: boolean;
} {
  let state = load();
  const isNewUser = state === null;
  if (!state) state = freshState();

  // Only increment session counter once per *browser session*. We use
  // sessionStorage as the marker so a hard refresh = same session, but
  // closing/reopening the tab counts as a new session.
  let isNewSession = false;
  try {
    if (!sessionStorage.getItem(SESSION_MARK_KEY)) {
      state.sessionCount += 1;
      isNewSession = true;
      sessionStorage.setItem(SESSION_MARK_KEY, '1');
    }
  } catch {
    // Private mode: still increment so we don't silently undercount.
    state.sessionCount += 1;
    isNewSession = true;
  }

  state.lastSeenAt = new Date().toISOString();
  save(state);

  if (isNewSession) {
    recordEvent('session_started', {
      session_number: state.sessionCount,
      is_new_user: isNewUser,
    });
  }

  return { state: load() || state, isNewUser, isNewSession };
}

export function recordEvent(
  type: ActivityEventType,
  payload?: ActivityEvent['payload']
): ActivityEvent | null {
  const state = load();
  if (!state) {
    // Bootstrap on first call so callers don't need to remember to init.
    bootstrapSession();
    return recordEvent(type, payload);
  }
  const event: ActivityEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    type,
    payload,
  };
  state.events.push(event);
  if (state.events.length > MAX_EVENTS) {
    state.events.splice(0, state.events.length - MAX_EVENTS);
  }
  state.eventCount += 1;
  state.lastSeenAt = event.ts;
  save(state);
  return event;
}

export function getActivityState(): UserActivityState | null {
  return load();
}

export function getUserStatus(): UserStatus {
  const s = load();
  if (!s || s.sessionCount <= 1) return 'first_visit';
  if (s.sessionCount >= 5 || s.eventCount >= 100) return 'power_user';
  return 'returning';
}

/**
 * Reset the *current session's* event log only. The user identity, session
 * count and lifetime totals are preserved \u2014 otherwise hitting "Reset Demo"
 * would forget the user, which defeats the whole returning-user feature.
 *
 * Pass `hardWipe: true` to fully forget the user (fresh-install state).
 */
export function resetActivity(hardWipe = false) {
  if (hardWipe) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_MARK_KEY);
    } catch {
      // ignore
    }
    return;
  }
  const state = load();
  if (!state) return;
  state.events = [];
  state.lastSeenAt = new Date().toISOString();
  save(state);
  recordEvent('demo_reset');
}

/**
 * Return aggregate counts grouped by event type, sorted desc by count.
 * Useful for the activity drawer summary.
 */
export function getEventTypeBreakdown(): { type: ActivityEventType; count: number }[] {
  const s = load();
  if (!s) return [];
  const counts = new Map<ActivityEventType, number>();
  for (const e of s.events) {
    counts.set(e.type, (counts.get(e.type) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Return event counts bucketed by hour over the last `hours` hours.
 * Used for the sparkline in the activity drawer.
 */
export function getHourlyActivityBuckets(hours = 24): number[] {
  const s = load();
  const buckets = new Array(hours).fill(0) as number[];
  if (!s) return buckets;
  const now = Date.now();
  for (const e of s.events) {
    const age = now - new Date(e.ts).getTime();
    const hoursAgo = Math.floor(age / 3_600_000);
    if (hoursAgo >= 0 && hoursAgo < hours) {
      buckets[hours - 1 - hoursAgo] += 1;
    }
  }
  return buckets;
}

/**
 * Friendly-format an event type for display.
 */
export function formatEventType(t: ActivityEventType): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
