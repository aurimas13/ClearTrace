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
  id: number;
  transaction_id: number;
  ai_summary: string;
  investigation_status: InvestigationStatus;
  created_at?: string;
}
