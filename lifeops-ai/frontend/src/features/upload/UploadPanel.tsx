import { useRef, useState } from "react";
import type { LifeOps } from "../../hooks/useLifeOps";
import PriorityMeter from "../../components/PriorityMeter";
import { fmt } from "../../lib/dates";
import type { Obligation } from "../../lib/types";

const STAGES = ["Scanning", "Understanding", "Extracting obligations", "Checking deadlines", "Comparing history", "Building action"];

export default function UploadPanel({ lo, onReminder }: { lo: LifeOps; onReminder: (o: Obligation) => void }) {
  const [over, setOver] = useState(false);
  const [name, setName] = useState("");
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<{ ob: Obligation; note?: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function run(file: File | null) {
    setName(file?.name ?? "electricity_bill.pdf"); setResult(null); setStage(0);
    const pending = lo.analyze(file);
    for (let i = 0; i < STAGES.length; i++) { setStage(i); await new Promise((r) => setTimeout(r, 420)); }
    const { ob, note } = await pending;
    setResult({ ob, note }); setStage(-1);
  }
  const busy = stage >= 0;
  return (
    <div>
      {!busy && !result && (
        <div className={`rounded-3xl border-2 border-dashed p-12 text-center transition ${over ? "scale-[1.01] border-cyan bg-violet/15" : "border-violet/50 bg-violet/5"}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); void run(e.dataTransfer.files[0] ?? null); }}>
          <div className="text-5xl text-violet">＋</div>
          <h3 className="mt-2 text-lg font-bold">DROP YOUR DOCUMENT HERE</h3>
          <p className="text-slate-400">Bills · Warranties · Receipts · Appointments · Notices (PDF, PNG, JPG, TXT, up to 5MB)</p>
          <div className="mt-4 flex justify-center gap-2">
            <button className="btn-ghost" onClick={() => input.current?.click()}>Browse files</button>
            <button className="btn !px-4 !py-2 text-sm" onClick={() => void run(null)}>Try a sample bill</button>
          </div>
          <input ref={input} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={(e) => e.target.files?.[0] && void run(e.target.files[0])} />
          <p className="mt-3 text-xs text-slate-500">{lo.live ? "Live mode: files go to your AWS backend." : "Demo mode: files are never read or uploaded."}</p>
        </div>
      )}
      {busy && (
        <div className="glass p-8 text-center">
          <div className="text-sm font-semibold text-violet">DOCUMENT RECEIVED</div><b>{name}</b>
          <ul className="mx-auto my-5 max-w-xs text-left text-slate-400" aria-live="polite">
            {STAGES.map((s, i) => <li key={s} className={i <= stage ? "text-slate-100" : ""}>{i < stage ? "✓" : i === stage ? "◌" : "·"} {s}</li>)}
          </ul>
        </div>
      )}
      {result && (
        <article className="glass p-6">
          <div className="text-sm font-semibold text-violet">{result.ob.title.toUpperCase()}</div>
          <div className="text-4xl font-extrabold">{result.ob.amount ? `${result.ob.currency} ${result.ob.amount.toLocaleString("en-IN")}` : "—"}</div>
          <div>Due {fmt(result.ob.due_date)}</div>
          <div className="my-2"><PriorityMeter priority={result.ob.priority} /></div>
          <p>{result.ob.anomaly_pct !== null ? `Unusual increase detected: about ${Math.round(result.ob.anomaly_pct)}% above recent average.` : result.ob.reason}</p>
          <p className="mt-1"><b>Recommended:</b> {result.ob.recommended_action}</p>
          {result.note && <p className="mt-2 text-xs text-slate-500">{result.note}</p>}
          <div className="mt-4 flex gap-2">
            <button className="btn !px-4 !py-2 text-sm" onClick={() => onReminder(result.ob)}>Create reminder</button>
            <button className="btn-ghost" onClick={() => setResult(null)}>Analyze another</button>
          </div>
        </article>
      )}
    </div>
  );
}
