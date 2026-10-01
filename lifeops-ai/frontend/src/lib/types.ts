export type Priority = "HIGH" | "MEDIUM" | "LOW";
/** Same shape the backend returns (subset). */
export interface Obligation {
  id: string; title: string; category: string; due_date: string | null; amount: number | null; currency: string;
  recommended_action: string; summary: string; priority: Priority; reason: string; days_left: number | null;
  anomaly_pct: number | null; history_avg: number | null; status: "open" | "done";
  source: "demo" | "model" | "fallback"; source_name: string;
}
export interface Reminder { id: string; title: string; when: string }
