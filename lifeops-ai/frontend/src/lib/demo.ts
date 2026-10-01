import type { Obligation, Priority } from "./types";
import { addDays, iso } from "./dates";

/** Synthetic demo data. Due dates are relative to today so the demo never goes stale. */
const SPECS: Array<[string, string, string, number, number | null, string, string, string]> = [
  // id, title, category, daysFromNow, amount, action, summary, file
  ["demo-el", "Electricity bill", "bill", 6, 2840, "Review before payment", "Monthly electricity statement.", "electricity_bill.pdf"],
  ["demo-su", "Streaming subscription", "subscription", 3, 649, "Keep or cancel before renewal", "Renews automatically.", "streaming_renewal.pdf"],
  ["demo-wa", "Laptop warranty", "warranty", 11, null, "Create warranty reminder", "Coverage ends soon.", "laptop_warranty.pdf"],
  ["demo-ap", "Clinic appointment", "appointment", 2, null, "Confirm appointment", "Confirmation requested.", "clinic_confirmation.pdf"],
  ["demo-in", "Insurance renewal", "insurance", 19, null, "Compare and renew", "Policy renewal notice.", "policy_notice.pdf"],
];
export function makeDemo(now = new Date()): Obligation[] {
  const today = iso(now);
  return SPECS.map(([id, title, category, d, amount, recommended_action, summary, source_name]) => {
    const anomaly = id === "demo-el";
    const priority: Priority = anomaly || d <= 3 ? "HIGH" : d <= 14 ? "MEDIUM" : "LOW";
    return {
      id, title, category, due_date: addDays(today, d), amount, currency: "INR", recommended_action, summary, priority,
      reason: anomaly ? `due in ${d} days; unusual increase detected (+47.7% vs recent average)` : `due in ${d} days`,
      days_left: d, anomaly_pct: anomaly ? 47.7 : null, history_avg: anomaly ? 1923 : null, status: "open", source: "demo", source_name,
    };
  });
}
