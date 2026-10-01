import type { Model } from "../ai/model.ts";
import { synthetic } from "../ai/demo.ts";
import type { Store } from "../db/store.ts";
import { parseModelJson, validateExtraction } from "../validation/schema.ts";
import { scoreObligation } from "../utils/priority.ts";
import { buildGraph } from "../utils/graph.ts";
import type { Extraction, Obligation } from "../utils/types.ts";
import type { BlobStore } from "./storage.ts";

export interface Deps { blobs: BlobStore; model: Model; store: Store; today: () => string; newId: () => string }

const CONTENT_TYPES: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", txt: "text/plain" };
export const ALLOWED_EXT = Object.keys(CONTENT_TYPES);

/** upload -> blob store -> model -> validate -> score -> store. Any model failure falls back to synthetic demo data. */
export async function processDocument(deps: Deps, input: { user: string; filename: string; data: Uint8Array }): Promise<Obligation> {
  const id = deps.newId();
  const safe = input.filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 100);
  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  const key = `${input.user}/${id}/${safe}`;
  await deps.blobs.put(key, input.data, CONTENT_TYPES[ext] ?? "application/octet-stream");

  let ex: Extraction;
  let source: Obligation["source"] = "model";
  let fallback_reason: string | undefined;
  try {
    ex = validateExtraction(parseModelJson(await deps.model.extract(input.data, safe)));
  } catch (e) {
    source = "fallback";
    fallback_reason = e instanceof Error ? `${e.name}: ${e.message}` : "unknown error";
    ex = validateExtraction(synthetic(safe, deps.today()));
  }
  const history_avg = await deps.store.average(input.user, ex.category);
  const scored = scoreObligation(ex, history_avg, deps.today());
  const ob: Obligation = { ...ex, ...scored, id, user: input.user, history_avg, status: "open", source, fallback_reason, source_name: safe, source_key: key };
  await deps.store.put(ob);
  return ob;
}

const RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
export async function openActions(deps: Deps, user: string): Promise<Obligation[]> {
  return (await deps.store.list(user))
    .filter((o) => o.status === "open")
    .sort((a, b) => RANK[a.priority] - RANK[b.priority] || (a.days_left ?? 1e9) - (b.days_left ?? 1e9));
}
export const dailyPlan = async (deps: Deps, user: string) => (await openActions(deps, user)).slice(0, 3);
export const actionGraph = async (deps: Deps, user: string) => buildGraph(await openActions(deps, user));
