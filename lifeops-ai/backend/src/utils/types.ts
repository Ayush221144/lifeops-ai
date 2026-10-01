export type Priority = "HIGH" | "MEDIUM" | "LOW";
export const CATEGORIES = ["bill", "subscription", "warranty", "appointment", "insurance", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

/** What the model is allowed to produce. Priority is NOT here: it is computed by rules. */
export interface Extraction {
  title: string;
  category: Category;
  due_date: string | null; // YYYY-MM-DD
  amount: number | null;
  currency: string;
  recommended_action: string;
  summary: string;
}

export interface Obligation extends Extraction {
  id: string;
  user: string;
  priority: Priority;
  reason: string;
  days_left: number | null;
  anomaly_pct: number | null;
  history_avg: number | null;
  status: "open" | "done";
  reminded?: boolean;
  source: "model" | "fallback";
  fallback_reason?: string;
  source_name: string;
  source_key: string;
}
