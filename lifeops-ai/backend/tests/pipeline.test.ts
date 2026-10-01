import { test } from "node:test";
import assert from "node:assert/strict";
import { DemoModel } from "../src/ai/demo.ts";
import type { Model } from "../src/ai/model.ts";
import { MemoryStore } from "../src/db/store.ts";
import { MemoryBlobStore } from "../src/services/storage.ts";
import { actionGraph, dailyPlan, processDocument } from "../src/services/pipeline.ts";
import type { Deps } from "../src/services/pipeline.ts";
import { ExtractionError, parseModelJson, validateExtraction } from "../src/validation/schema.ts";
import { handler, resetDepsForTests } from "../src/handlers/api.ts";

const TODAY = "2026-10-01";
let n = 0;
const mk = (model: Model = new DemoModel(() => TODAY)): Deps => ({ blobs: new MemoryBlobStore(), model, store: new MemoryStore(), today: () => TODAY, newId: () => `id${++n}` });
const boom: Model = { extract: async () => { throw new Error("bedrock down"); } };
const junk: Model = { extract: async () => "sorry, I cannot help" };
const run = (d: Deps, filename = "electricity_bill.pdf") => processDocument(d, { user: "u1", filename, data: new Uint8Array([37, 80]) });

test("happy path: model JSON -> HIGH priority with factual anomaly wording", async () => {
  const d = mk();
  await d.store.put({ ...(await run(mk())), id: "hist", user: "u1", amount: 1923 }); // seed history
  const o = await run(d);
  assert.equal(o.source, "model");
  assert.equal(o.history_avg, 1923);
  assert.equal(o.anomaly_pct, 47.7);
  assert.equal(o.priority, "HIGH");
  assert.match(o.reason, /unusual increase detected/);
  assert.doesNotMatch(o.reason, /usage/i);
});
test("model failure or junk output falls back to synthetic data and says so", async () => {
  for (const m of [boom, junk]) {
    const o = await run(mk(m));
    assert.equal(o.source, "fallback");
    assert.ok(o.fallback_reason);
    assert.equal(o.category, "bill");
  }
});
test("no history means no anomaly claim", async () => {
  const o = await run(mk());
  assert.equal(o.anomaly_pct, null);
  assert.doesNotMatch(o.reason, /unusual/);
});
test("priority rules by deadline", async () => {
  const p = async (f: string) => (await run(mk(), f)).priority;
  assert.equal(await p("appointment.pdf"), "HIGH");
  assert.equal(await p("warranty.pdf"), "MEDIUM");
  assert.equal(await p("insurance.pdf"), "LOW");
});
test("parse and validate reject bad model output", () => {
  assert.equal((parseModelJson('Here: {"a":1} done') as { a: number }).a, 1);
  for (const bad of ["", "no json", "{bad}", null]) assert.throws(() => parseModelJson(bad), ExtractionError);
  for (const bad of [{}, { title: "x", due_date: "7 Oct" }, { title: "x", due_date: "2026-02-31" }, { title: "x", amount: -5 }, { title: "x", amount: "9" }, []])
    assert.throws(() => validateExtraction(bad), ExtractionError);
  assert.equal(validateExtraction({ title: "x", category: "weird" }).category, "other");
});
test("file name is sanitised in the storage key", async () => {
  const o = await run(mk(), "../../etc/pass wd.pdf");
  assert.doesNotMatch(o.source_key.split("/").slice(2).join("/"), /[\/ ]/);
});
test("plan is ordered by urgency, graph is connected, completion removes items", async () => {
  const d = mk();
  for (const f of ["insurance.pdf", "electricity_bill.pdf", "warranty.pdf", "appointment.pdf"]) await run(d, f);
  const plan = await dailyPlan(d, "u1");
  assert.equal(plan.length, 3);
  assert.equal(plan[0].priority, "HIGH");
  const g = await actionGraph(d, "u1");
  const ids = new Set(g.nodes.map((x) => x.id));
  assert.ok(g.edges.every((e) => ids.has(e.from) && ids.has(e.to)));
  assert.equal(await d.store.complete("u1", plan[0].id), true);
  assert.equal(await d.store.complete("u1", "nope"), false);
  assert.equal((await dailyPlan(d, "u1")).some((o) => o.id === plan[0].id), false);
});
test("API handler: upload, list, validation errors, 404", async () => {
  resetDepsForTests(mk());
  const ev = (over: object) => ({ headers: {}, httpMethod: "GET", path: "/", body: null, ...over }) as any;
  const post = (body: unknown) => handler(ev({ httpMethod: "POST", path: "/documents", body: typeof body === "string" ? body : JSON.stringify(body) }));
  const up = await post({ filename: "subscription.pdf", contentBase64: "JVBERg==" });
  assert.equal(up.statusCode, 200);
  assert.equal(JSON.parse(up.body).category, "subscription");
  assert.equal(JSON.parse((await handler(ev({ path: "/actions" }))).body).length, 1);
  assert.equal((await post("nope")).statusCode, 400);
  assert.equal((await post({ filename: "x.exe", contentBase64: "AA==" })).statusCode, 400);
  assert.equal((await post({ filename: "a.pdf", contentBase64: "" })).statusCode, 400);
  assert.equal((await handler(ev({ path: "/nothing" }))).statusCode, 404);
  const id = JSON.parse(up.body).id;
  assert.equal((await handler(ev({ httpMethod: "POST", path: `/actions/${id}/complete` }))).statusCode, 200);
  assert.equal(JSON.parse((await handler(ev({ path: "/actions" }))).body).length, 0);
});
