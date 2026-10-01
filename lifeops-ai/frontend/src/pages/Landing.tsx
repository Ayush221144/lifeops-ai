import { motion, useReducedMotion } from "framer-motion";

const DOCS = ["Electricity Bill", "Warranty", "Subscription", "Appointment", "Insurance"];
const OUT = ["Pay bill", "Review subscription", "Renew insurance", "Set warranty reminder"];

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <header className="flex items-center justify-between px-[5vw] py-5 font-extrabold tracking-wide">✦ LIFEOPS<button className="btn-ghost" onClick={onEnter}>Try demo</button></header>
      <section className="grid items-center gap-8 px-[5vw] pb-16 pt-6 md:grid-cols-2">
        <div>
          <span className="rounded-full border border-white/10 bg-cyan/10 px-3 py-1 text-xs text-cyan">✦ AI PERSONAL OPERATIONS ENGINE</span>
          <h1 className="my-5 text-6xl font-extrabold leading-[0.95] tracking-tighter sm:text-8xl">
            <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>YOUR LIFE</motion.span>
            <motion.span className="block bg-gradient-to-r from-violet to-cyan bg-clip-text text-transparent" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}>HAS AN API.</motion.span>
          </h1>
          <p className="max-w-md text-lg text-slate-400">Turn documents, deadlines and obligations into actions before they become problems.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="btn" onClick={onEnter}>Try demo</button>
            <a className="btn-ghost" href="#flow">Watch the flow ↓</a>
            <span className="text-sm text-slate-400">No login. Sample data only.</span>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet bg-violet/20 text-center text-xs font-bold shadow-[0_0_70px_rgba(124,108,255,.45)]">◉<br />LIFEOPS<br />AI</div>
          {DOCS.map((d, i) => {
            const a = (i / DOCS.length) * Math.PI * 2 + 0.4;
            return (
              <motion.div key={d} className="glass absolute left-1/2 top-1/2 -ml-16 -mt-4 whitespace-nowrap px-3 py-2 text-sm"
                initial={{ x: Math.cos(a) * 170, y: Math.sin(a) * 160, opacity: 0.9 }}
                animate={reduce ? undefined : { x: [Math.cos(a) * 170, 0], y: [Math.sin(a) * 160, 0], opacity: [0.9, 0], scale: [1, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, delay: i * 1.2, ease: "easeIn" }}>📄 {d}</motion.div>
            );
          })}
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-2 text-sm text-lo">{OUT.map((o) => <span key={o}>✓ {o}</span>)}</div>
        </div>
      </section>
      <section id="flow" className="mx-auto grid max-w-4xl gap-4 px-[5vw] pb-20 md:grid-cols-[1fr_1.4fr]">
        <h2 className="text-3xl font-bold tracking-tight md:col-span-2">Other tools summarize. LifeOps acts.</h2>
        <div className="glass p-6"><h3 className="mb-3 text-sm text-slate-400">Traditional document AI</h3><ul className="space-y-2"><li className="glass px-3 py-2">📄 Document</li><li className="glass px-3 py-2">📝 Summary</li></ul></div>
        <div className="glass border-violet/50 p-6"><h3 className="mb-3 text-sm text-slate-400">LifeOps AI</h3>
          <ul className="space-y-2">{["📄 Document", "🧠 Understand", "⚡ Obligation", "⏰ Deadline", "🎯 Priority", "✅ Action"].map((s, i) => (
            <motion.li key={s} className="glass px-3 py-2" initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>{s}</motion.li>
          ))}</ul></div>
      </section>
    </div>
  );
}
