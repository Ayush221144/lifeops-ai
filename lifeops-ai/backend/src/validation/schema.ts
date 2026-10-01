import { CATEGORIES } from "../utils/types.ts";
import type { Category, Extraction } from "../utils/types.ts";

export class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractionError";
  }
}

/** Model text -> JSON value. Tolerates ```json fences and surrounding prose. */
export function parseModelJson(raw: unknown): unknown {
  if (typeof raw !== "string") throw new ExtractionError("model output is not text");
  const s = raw.replace(/```(?:json)?/g, "").trim();
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b <= a) throw new ExtractionError("no JSON object found");
  try {
    return JSON.parse(s.slice(a, b + 1));
  } catch (e) {
    throw new ExtractionError(`invalid JSON: ${(e as Error).message}`);
  }
}

export function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
}

/** Never trust model output: strict shape check, clamp lengths, normalise category. */
export function validateExtraction(d: unknown): Extraction {
  if (typeof d !== "object" || d === null || Array.isArray(d)) throw new ExtractionError("not an object");
  const o = d as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim().slice(0, 120) : "";
  if (!title) throw new ExtractionError("missing title");
  const due = o.due_date ?? null;
  if (due !== null && !(typeof due === "string" && isIsoDate(due))) throw new ExtractionError("due_date must be YYYY-MM-DD");
  const amount = o.amount ?? null;
  if (amount !== null && !(typeof amount === "number" && Number.isFinite(amount) && amount >= 0))
    throw new ExtractionError("amount must be a non-negative number");
  const cat = String(o.category ?? "other").toLowerCase();
  return {
    title,
    category: (CATEGORIES as readonly string[]).includes(cat) ? (cat as Category) : "other",
    due_date: due as string | null,
    amount: amount as number | null,
    currency: typeof o.currency === "string" && o.currency ? o.currency.slice(0, 3).toUpperCase() : "INR",
    recommended_action: typeof o.recommended_action === "string" && o.recommended_action ? o.recommended_action.slice(0, 120) : "Review document",
    summary: typeof o.summary === "string" ? o.summary.slice(0, 500) : "",
  };
}
