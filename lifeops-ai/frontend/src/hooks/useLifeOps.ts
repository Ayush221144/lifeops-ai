import { useCallback, useMemo, useState } from "react";
import { makeDemo } from "../lib/demo";
import { uploadDocument } from "../lib/api";
import { byUrgency } from "../lib/priority";
import type { Obligation, Reminder } from "../lib/types";

export function useLifeOps(apiUrl: string) {
  const [items, setItems] = useState<Obligation[]>(() => makeDemo());
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const open = useMemo(() => items.filter((i) => i.status === "open").sort(byUrgency), [items]);
  const doneCount = 7 + items.filter((i) => i.status === "done").length; // 7 = pre-existing demo history

  const complete = useCallback((id: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "done" } : x))), []);
  const addReminder = useCallback((r: Reminder) => setReminders((rs) => [...rs, r]), []);

  /** Live API when configured; otherwise (or on any failure) the synthetic sample bill. Never reads the file locally. */
  const analyze = useCallback(async (file: File | null): Promise<{ ob: Obligation; live: boolean; note?: string }> => {
    if (apiUrl && file) {
      try {
        const ob = await uploadDocument(apiUrl, file);
        setItems((xs) => [ob, ...xs.filter((x) => x.id !== ob.id)]);
        return { ob, live: true, note: ob.source === "fallback" ? "Model unavailable; showing sample data." : undefined };
      } catch (e) {
        return { ob: items.find((i) => i.id === "demo-el")!, live: false, note: `Live analysis failed (${(e as Error).message}); showing sample data.` };
      }
    }
    return { ob: items.find((i) => i.id === "demo-el")!, live: false, note: "Demo mode: showing sample data." };
  }, [apiUrl, items]);

  return { items, open, reminders, doneCount, complete, addReminder, analyze, live: Boolean(apiUrl) };
}
export type LifeOps = ReturnType<typeof useLifeOps>;
