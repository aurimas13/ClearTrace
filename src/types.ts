export interface SupabaseTransaction {
  id: number;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency: string;
  transaction_date: string;
  risk_score: number;
  is_flagged: boolean;
  transaction_type: string;
}

export type InvestigationStatus = 'open' | 'sar_filed' | 'cleared' | 'escalated';

export interface Investigation {
  /** UUID primary key from Postgres */
  id: string;
  transaction_id: number;
  ai_summary: string;
  investigation_status: InvestigationStatus;
  created_at?: string;
}

/**
 * Convert a UUID-or-numeric investigation id into a short,
 * human-displayable case identifier (e.g. `A1B2C3D4`).
 */
export function shortCaseId(id: string | number): string {
  return String(id).replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function caseDisplayId(id: string | number): string {
  return `INV-${shortCaseId(id)}`;
}

export function sarReferenceId(id: string | number, year = new Date().getFullYear()): string {
  return `SAR-${year}-${shortCaseId(id)}`;
}
