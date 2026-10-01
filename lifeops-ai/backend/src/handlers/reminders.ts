import { DynamoStore } from "../db/dynamo.ts";
import { addDays } from "../utils/priority.ts";

/** Daily EventBridge target. Finds open obligations due within 3 days and flags them as reminded.
 *  It logs them; delivery (SES/SNS) is NOT implemented. UNTESTED against real AWS. */
export async function handler(): Promise<{ reminded: number }> {
  const store = new DynamoStore(process.env.TABLE!);
  const limit = addDays(new Date().toISOString().slice(0, 10), 3);
  const due = await store.dueSoon(limit);
  for (const o of due) {
    console.log(JSON.stringify({ event: "reminder", user: o.user, id: o.id, title: o.title, due_date: o.due_date, priority: o.priority }));
    await store.markReminded(o.user, o.id);
  }
  return { reminded: due.length };
}
