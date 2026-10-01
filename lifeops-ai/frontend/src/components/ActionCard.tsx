import { motion } from "framer-motion";
import { explain } from "../lib/priority";
import { fmt } from "../lib/dates";
import type { Obligation } from "../lib/types";
import PriorityMeter from "./PriorityMeter";

interface Props { o: Obligation; index?: number; onComplete: (id: string) => void; onReminder: (o: Obligation) => void; onSelect?: (id: string) => void }

export default function ActionCard({ o, index, onComplete, onReminder, onSelect }: Props) {
  const isReminder = o.category === "warranty";
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, height: 0 }}
      whileHover={{ y: -3 }} transition={{ duration: 0.22 }} className="glass mb-3 p-4 hover:border-violet/50">
      <PriorityMeter priority={o.priority} />
      <h4 className="mt-2 text-lg font-semibold">{index !== undefined ? `${index + 1}. ` : ""}{o.recommended_action}</h4>
      <p className="text-sm text-slate-400">{o.title} · Due {fmt(o.due_date)}{o.days_left !== null ? ` (in ${o.days_left} days)` : ""}</p>
      <p className="mt-2 text-sm text-slate-400"><b className="text-slate-300">Why this matters</b><br />{o.reason}</p>
      <details className="my-3 text-sm text-slate-400">
        <summary className="cursor-pointer text-cyan">Why {o.priority}?</summary>
        <ul className="mt-1 list-disc pl-5">{explain(o).map((x) => <li key={x}>{x}</li>)}</ul>
      </details>
      <div className="flex flex-wrap gap-2">
        <button className="btn !px-4 !py-2 text-sm" onClick={() => (isReminder ? onReminder(o) : onComplete(o.id))}>{isReminder ? "Set reminder" : "Complete"}</button>
        {onSelect && <button className="btn-ghost" onClick={() => onSelect(o.id)}>Details</button>}
      </div>
    </motion.article>
  );
}
