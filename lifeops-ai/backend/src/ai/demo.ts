import type { Extraction } from "../utils/types.ts";
import { addDays } from "../utils/priority.ts";
import type { Model } from "./model.ts";

type Spec = [Extraction["category"], string, number | null, number, string, string];
const SPECS: Record<string, Spec> = {
  bill: ["bill", "Electricity bill", 2840, 6, "Review before payment", "Monthly electricity statement."],
  subscription: ["subscription", "Streaming subscription", 649, 3, "Keep or cancel before renewal", "Renewal notice."],
  warranty: ["warranty", "Laptop warranty", null, 11, "Create warranty reminder", "Coverage ends soon."],
  appointment: ["appointment", "Clinic appointment", null, 2, "Confirm appointment", "Confirmation requested."],
  insurance: ["insurance", "Insurance renewal", null, 19, "Compare and renew", "Policy renewal notice."],
};
const KEYS: Array<[string, string]> = [["electric", "bill"], ["bill", "bill"], ["subscri", "subscription"], ["warrant", "warranty"], ["appoint", "appointment"], ["insur", "insurance"], ["policy", "insurance"]];

/** Synthetic demo data with due dates relative to `today`, so the demo never goes stale. */
export function synthetic(filename: string, today: string): Extraction {
  const n = filename.toLowerCase();
  const key = KEYS.find(([k]) => n.includes(k))?.[1] ?? "bill";
  const [category, title, amount, offset, recommended_action, summary] = SPECS[key];
  return { title, category, due_date: addDays(today, offset), amount, currency: "INR", recommended_action, summary };
}

/** Offline stand-in for Bedrock (keyword rules on the filename). Not real AI. */
export class DemoModel implements Model {
  today: () => string;
  constructor(today: () => string) {
    this.today = today;
  }
  async extract(_data: Uint8Array, filename: string): Promise<string> {
    return "```json\n" + JSON.stringify(synthetic(filename, this.today())) + "\n```";
  }
}
