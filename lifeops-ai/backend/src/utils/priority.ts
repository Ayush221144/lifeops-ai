import type { Extraction, Priority } from "./types.ts";

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}
export function addDays(iso: string, n: number): string {
  return new Date(Date.parse(iso) + n * 86_400_000).toISOString().slice(0, 10);
}

/** Deterministic rules. The model never decides priority. */
export function scoreObligation(e: Extraction, historyAvg: number | null, today: string) {
  const days_left = e.due_date ? daysBetween(today, e.due_date) : null;
  let anomaly_pct: number | null = null;
  if (e.amount && historyAvg) {
    const pct = ((e.amount - historyAvg) / historyAvg) * 100;
    if (pct >= 25) anomaly_pct = Math.round(pct * 10) / 10;
  }
  let priority: Priority = "LOW";
  if (anomaly_pct !== null || (days_left !== null && days_left <= 3)) priority = "HIGH";
  else if (days_left !== null && days_left <= 14) priority = "MEDIUM";
  const parts: string[] = [];
  if (days_left !== null) parts.push(days_left < 0 ? "overdue" : `due in ${days_left} days`);
  // Factual wording only: we never claim *why* an amount changed.
  if (anomaly_pct !== null) parts.push(`unusual increase detected (+${anomaly_pct}% vs recent average)`);
  return { priority, reason: parts.join("; ") || "no deadline found", days_left, anomaly_pct };
}
