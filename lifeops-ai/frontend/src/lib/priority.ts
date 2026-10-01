import type { Obligation, Priority } from "./types";
import { fmt } from "./dates";

export const RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
export const byUrgency = (a: Obligation, b: Obligation) => RANK[a.priority] - RANK[b.priority] || (a.days_left ?? 1e9) - (b.days_left ?? 1e9);

/** Same rules as backend/src/utils/priority.ts. Keep in sync. */
export function explain(o: Obligation): string[] {
  const out: string[] = [];
  if (o.days_left !== null) {
    const rule = o.days_left <= 3 ? "3 days or fewer = HIGH" : o.days_left <= 14 ? "within 14 days = MEDIUM" : "more than 14 days = LOW";
    out.push(`Deadline: due ${fmt(o.due_date)}, in ${o.days_left} days (${rule}).`);
  } else out.push("Deadline: none found.");
  if (o.anomaly_pct !== null && o.history_avg)
    out.push(`Amount: ${o.currency} ${o.amount?.toLocaleString("en-IN")} vs ${o.history_avg.toLocaleString("en-IN")} recent average (+${o.anomaly_pct}%). Unusual increase detected; the document does not say why.`);
  else out.push("Amount: no unusual change detected.");
  out.push("Priority comes from fixed rules, not from the AI model.");
  return out;
}
export const tone: Record<Priority, { text: string; bar: string; level: number }> = {
  HIGH: { text: "text-hi", bar: "bg-hi", level: 3 },
  MEDIUM: { text: "text-me", bar: "bg-me", level: 2 },
  LOW: { text: "text-lo", bar: "bg-lo", level: 1 },
};
