import UploadPanel from "../features/upload/UploadPanel";
import type { LifeOps } from "../hooks/useLifeOps";
import type { Obligation } from "../lib/types";

export default function Documents({ lo, onReminder }: { lo: LifeOps; onReminder: (o: Obligation) => void }) {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
      <p className="mb-4 text-slate-400">Drop a document and LifeOps turns it into actions.</p>
      <UploadPanel lo={lo} onReminder={onReminder} />
      <h3 className="mb-2 mt-8 font-semibold">Document constellation</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {lo.items.map((o) => <div key={o.id} className="glass p-3 text-sm"><b>{o.title}</b><br /><span className="text-slate-400">{o.source_name}<br />→ {o.recommended_action}</span></div>)}
      </div>
    </>
  );
}
