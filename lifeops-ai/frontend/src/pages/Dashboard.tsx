import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ActionCard from "../components/ActionCard";
import LifeGraph from "../components/LifeGraph";
import TodayPlan from "../features/plan/TodayPlan";
import type { LifeOps } from "../hooks/useLifeOps";
import type { Obligation } from "../lib/types";

export default function Dashboard({ lo, onReminder }: { lo: LifeOps; onReminder: (o: Obligation) => void }) {
  const [sel, setSel] = useState<string | undefined>();
  const urgent = lo.open.filter((o) => o.priority !== "LOW").length;
  const bill = lo.items.find((i) => i.id === "demo-el" && i.anomaly_pct !== null);
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Good afternoon, Ayush.</h2>
      <p className="text-slate-400">Your life, organized.</p>
      <TodayPlan lo={lo} onReminder={onReminder} />
      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <span className="glass rounded-full px-4 py-2">🔴 <b>{urgent}</b> urgent</span>
        <span className="glass rounded-full px-4 py-2">🟠 <b>{lo.open.length - urgent}</b> upcoming</span>
        <span className="glass rounded-full px-4 py-2">✓ <b>{lo.doneCount}</b> done</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <LifeGraph items={lo.open} selected={sel} onSelect={setSel} />
        <div><div className="mb-2 font-semibold">Today's actions</div>
          <AnimatePresence>{lo.open.slice(0, 3).map((o) => <ActionCard key={o.id} o={o} onComplete={lo.complete} onReminder={onReminder} onSelect={setSel} />)}</AnimatePresence>
          {lo.open.length === 0 && <p className="text-slate-400">Nothing needs your attention right now.</p>}
        </div>
      </div>
      {bill && (
        <section className="glass mt-4 border-cyan/30 p-5">
          <div className="text-sm font-semibold text-violet">✦ LIFEOPS INSIGHT</div>
          <p className="my-2">Unusual increase detected: electricity bill is about 48% above your recent average.</p>
          <div className="flex justify-between text-sm text-slate-400"><span>Previous average ₹1,923</span><span>Current ₹2,840 (+47.7%)</span></div>
          <div className="my-2 h-2 rounded bg-white/10"><div className="h-2 rounded bg-cyan transition-all duration-1000" style={{ width: "68%" }} /></div>
          <div className="h-2 rounded bg-white/10"><div className="h-2 rounded bg-hi transition-all duration-1000" style={{ width: "100%" }} /></div>
        </section>
      )}
    </>
  );
}
