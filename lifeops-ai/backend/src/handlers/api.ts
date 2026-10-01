import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "node:crypto";
import { DemoModel } from "../ai/demo.ts";
import { BedrockModel } from "../ai/bedrock.ts";
import { DynamoStore } from "../db/dynamo.ts";
import { MemoryStore } from "../db/store.ts";
import { MemoryBlobStore, S3BlobStore } from "../services/storage.ts";
import { ALLOWED_EXT, actionGraph, dailyPlan, openActions, processDocument } from "../services/pipeline.ts";
import type { Deps } from "../services/pipeline.ts";

const MAX_BYTES = 5_000_000;
const HEADERS = { "content-type": "application/json", "access-control-allow-origin": "*" };
const json = (statusCode: number, body: unknown): APIGatewayProxyResult => ({ statusCode, headers: HEADERS, body: JSON.stringify(body) });
const today = () => new Date().toISOString().slice(0, 10);

let cached: Deps | undefined;
function deps(): Deps {
  if (cached) return cached;
  const e = process.env;
  cached = e.USE_DEMO === "1"
    ? { blobs: new MemoryBlobStore(), model: new DemoModel(today), store: new MemoryStore(), today, newId: randomUUID }
    : { blobs: new S3BlobStore(e.BUCKET!), model: new BedrockModel(e.BEDROCK_MODEL_ID!), store: new DynamoStore(e.TABLE!), today, newId: randomUUID };
  return cached;
}
export function resetDepsForTests(d?: Deps) { cached = d; }

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const user = event.headers?.["x-user"] ?? event.headers?.["X-User"] ?? "demo"; // demo only: no real auth yet
    const path = (event.path ?? "").replace(/\/+$/, "") || "/";
    const d = deps();
    if (event.httpMethod === "POST" && path === "/documents") {
      let body: { filename?: unknown; contentBase64?: unknown };
      try { body = JSON.parse(event.body ?? ""); } catch { return json(400, { error: "body must be JSON" }); }
      const filename = typeof body.filename === "string" ? body.filename : "";
      const ext = filename.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXT.includes(ext)) return json(400, { error: `unsupported file type; allowed: ${ALLOWED_EXT.join(", ")}` });
      if (typeof body.contentBase64 !== "string" || !body.contentBase64) return json(400, { error: "contentBase64 required" });
      const data = Buffer.from(body.contentBase64, "base64");
      if (data.length === 0 || data.length > MAX_BYTES) return json(400, { error: "file empty or larger than 5MB" });
      return json(200, await processDocument(d, { user, filename, data }));
    }
    if (event.httpMethod === "GET" && path === "/actions") return json(200, await openActions(d, user));
    if (event.httpMethod === "GET" && path === "/plan") return json(200, await dailyPlan(d, user));
    if (event.httpMethod === "GET" && path === "/graph") return json(200, await actionGraph(d, user));
    const m = path.match(/^\/actions\/([\w-]+)\/complete$/);
    if (event.httpMethod === "POST" && m) return (await d.store.complete(user, m[1])) ? json(200, { ok: true }) : json(404, { error: "not found" });
    return json(404, { error: "not found" });
  } catch (err) {
    console.error("unhandled", err);
    return json(500, { error: "internal error" });
  }
}
