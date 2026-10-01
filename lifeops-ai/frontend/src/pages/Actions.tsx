import { AnimatePresence } from "framer-motion";
import ActionCard from "../components/ActionCard";
import type { LifeOps } from "../hooks/useLifeOps";
import type { Obligation } from "../lib/types";

export default function Actions({ lo, onReminder }: { lo: LifeOps; onReminder: (o: Obligation) => void }) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Actions</h2>
      <p className="mb-4 text-slate-400">{lo.open.length} remaining</p>
      <AnimatePresence>{lo.open.map((o) => <ActionCard key={o.id} o={o} onComplete={lo.complete} onReminder={onReminder} />)}</AnimatePresence>
      {lo.open.length === 0 && <div className="py-10 text-center text-slate-400"><h3 className="text-lg text-slate-200">Nothing needs your attention right now.</h3>Enjoy the quiet.</div>}
    </>
  );
}
