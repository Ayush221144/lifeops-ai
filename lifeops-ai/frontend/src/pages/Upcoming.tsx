import { fmt } from "../lib/dates";
import { tone } from "../lib/priority";
import type { LifeOps } from "../hooks/useLifeOps";

export default function Upcoming({ lo }: { lo: LifeOps }) {
  const sorted = [...lo.open].sort((a, b) => (a.days_left ?? 1e9) - (b.days_left ?? 1e9));
  return (
    <>
      <h2 className="mb-4 text-3xl font-bold tracking-tight">Upcoming</h2>
      {lo.reminders.length > 0 && (<><h3 className="text-sm text-slate-400">Approved reminders</h3>
        <ul className="mb-6 ml-2 border-l-2 border-white/10 pl-5">{lo.reminders.map((r) => <li key={r.id + r.when} className="py-2"><span className="text-sm text-slate-400">{r.when}, 09:00</span><br />🔔 {r.title}</li>)}</ul></>)}
      <h3 className="text-sm text-slate-400">Deadlines</h3>
      <ul className="ml-2 border-l-2 border-white/10 pl-5">
        {sorted.map((o) => <li key={o.id} className="py-2"><span className="text-sm text-slate-400">{fmt(o.due_date)} · in {o.days_left} days</span><br />{o.title} <span className={`text-xs font-bold ${tone[o.priority].text}`}>{o.priority}</span></li>)}
      </ul>
    </>
  );
}
