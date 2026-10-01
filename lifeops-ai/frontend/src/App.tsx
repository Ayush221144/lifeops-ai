import { useEffect, useState } from "react";
import ApprovalDialog from "./components/ApprovalDialog";
import { useLifeOps } from "./hooks/useLifeOps";
import { loadApiUrl } from "./lib/api";
import { addDays, fmt } from "./lib/dates";
import type { Obligation } from "./lib/types";
import Actions from "./pages/Actions";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Landing from "./pages/Landing";
import Upcoming from "./pages/Upcoming";

type View = "home" | "docs" | "acts" | "up";
const TABS: Array<[View, string]> = [["home", "Home"], ["docs", "Documents"], ["acts", "Actions"], ["up", "Upcoming"]];

export default function App() {
  const [apiUrl, setApiUrl] = useState("");
  const [entered, setEntered] = useState(false);
  const [booting, setBooting] = useState(false);
  const [view, setView] = useState<View>("home");
  const [pending, setPending] = useState<Obligation | null>(null);
  const lo = useLifeOps(apiUrl);
  useEffect(() => { void loadApiUrl().then(setApiUrl); }, []);

  const enter = () => { setBooting(true); setTimeout(() => { setBooting(false); setEntered(true); }, 1400); };
  const when = (o: Obligation) => (o.due_date ? fmt(addDays(o.due_date, -1)) : "Tomorrow");
  const approve = () => {
    if (!pending) return;
    lo.addReminder({ id: pending.id, title: pending.recommended_action, when: when(pending) });
    if (pending.category === "warranty") lo.complete(pending.id);
    setPending(null);
  };

  if (booting) return <div className="grid min-h-screen place-items-center text-center"><div><b className="tracking-widest">LIFEOPS AI</b><p className="mt-3 text-slate-400">Initializing personal action graph… {lo.open.length} obligations found</p></div></div>;
  if (!entered) return <Landing onEnter={enter} />;
  return (
    <div className="pb-24">
      <div className="bg-cyan/10 py-1.5 text-center text-sm text-cyan">{lo.live ? "Live mode: connected to your AWS backend." : "Demo mode: sample data only. Nothing you do here is uploaded or sent."}</div>
      <nav className="sticky top-0 z-20 hidden items-center gap-2 border-b border-white/10 bg-ink/85 px-[4vw] py-3 backdrop-blur md:flex">
        <span className="mr-auto font-extrabold">✦ LIFEOPS</span>
        {TABS.map(([v, l]) => <button key={v} aria-current={view === v ? "page" : undefined} onClick={() => setView(v)} className={`rounded-lg px-4 py-2 ${view === v ? "bg-white/10" : "text-slate-400"}`}>{l}</button>)}
      </nav>
      <main className="mx-auto max-w-5xl px-[4vw] py-6">
        {view === "home" && <Dashboard lo={lo} onReminder={setPending} />}
        {view === "docs" && <Documents lo={lo} onReminder={setPending} />}
        {view === "acts" && <Actions lo={lo} onReminder={setPending} />}
        {view === "up" && <Upcoming lo={lo} />}
      </main>
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {TABS.map(([v, l]) => <button key={v} aria-current={view === v ? "page" : undefined} onClick={() => setView(v)} className={`flex-1 py-3 text-xs ${view === v ? "text-cyan" : "text-slate-400"}`}>{l}</button>)}
      </nav>
      <button aria-label="Upload document" onClick={() => setView("docs")} className="btn fixed bottom-20 right-4 z-30 h-14 w-14 !rounded-full !p-0 text-2xl md:hidden">＋</button>
      {pending && <ApprovalDialog o={pending} when={when(pending)} onApprove={approve} onCancel={() => setPending(null)} />}
    </div>
  );
}
