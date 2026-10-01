import { useEffect, useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import ActionCard from "../../components/ActionCard";
import type { LifeOps } from "../../hooks/useLifeOps";
import type { Obligation } from "../../lib/types";

const STEPS = ["Checking deadlines", "Comparing priorities", "Checking recurring tasks", "Looking for unusual changes", "Building today's plan"];

/** The signature moment: high-level stages only, no chain-of-thought is shown. */
export default function TodayPlan({ lo, onReminder }: { lo: LifeOps; onReminder: (o: Obligation) => void }) {
  const [phase, setPhase] = useState<"idle" | "thinking" | "done">("idle");
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (phase !== "thinking") return;
    if (step >= STEPS.length) { const t = setTimeout(() => setPhase("done"), 300); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep((s) => s + 1), reduce ? 60 : 420);
    return () => clearTimeout(t);
  }, [phase, step, reduce]);
  const top = lo.open.slice(0, 3);

  return (
    <section className="glass relative my-5 p-6 text-center sm:p-9" aria-live="polite">
      <div className="text-sm font-semibold text-violet">✦ LIFEOPS INTELLIGENCE</div>
      {phase === "idle" && (
        <>
          <p className="my-3 text-xl">{top.length ? `You have ${top.length} things worth your attention.` : "Nothing needs your attention right now. ✓"}</p>
          <button className="btn w-full sm:w-auto" disabled={!top.length} onClick={() => { setStep(0); setPhase("thinking"); }}>✦ What should I do today?</button>
        </>
      )}
      {phase === "thinking" && (
        <>
          <p className="my-3 text-xl">Analyzing your obligations…</p>
          <ul className="mx-auto max-w-xs text-left text-slate-400">
            {STEPS.map((s, i) => <li key={s} className={i < step ? "text-slate-100" : "opacity-0"}>✓ {s}</li>)}
          </ul>
        </>
      )}
      {phase === "done" && (
        <div className="text-left">
          <p className="my-3 text-center text-xl font-semibold">✦ YOUR DAY, ORGANIZED</p>
          <AnimatePresence>{top.map((o, i) => <ActionCard key={o.id} o={o} index={i} onComplete={lo.complete} onReminder={onReminder} />)}</AnimatePresence>
          <div className="text-center"><button className="btn-ghost" onClick={() => setPhase("idle")}>Back</button></div>
        </div>
      )}
    </section>
  );
}
