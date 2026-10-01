import { useEffect, useRef } from "react";
import type { Obligation } from "../lib/types";

/** Nothing is created until the person approves. */
export default function ApprovalDialog({ o, when, onApprove, onCancel }: { o: Obligation; when: string; onApprove: () => void; onCancel: () => void }) {
  const ok = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => { ok.current?.focus(); }, []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onCancel();
    if (e.key === "Tab") { e.preventDefault(); (document.activeElement === ok.current ? cancel : ok).current?.focus(); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-start justify-center bg-black/60 pt-[14vh]" onKeyDown={onKey} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div role="dialog" aria-modal="true" aria-labelledby="ap-title" className="w-[min(440px,92vw)] rounded-2xl border border-violet bg-[#12131b] p-6 shadow-[0_0_60px_rgba(124,108,255,.25)]">
        <b id="ap-title">Approve this reminder?</b>
        <dl className="my-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-slate-400">Reminder</dt><dd>{o.recommended_action}</dd>
          <dt className="text-slate-400">Date</dt><dd>{when}, 09:00</dd>
          <dt className="text-slate-400">Source</dt><dd>{o.source_name}</dd>
          <dt className="text-slate-400">Where</dt><dd>In-app only (demo)</dd>
        </dl>
        <p className="text-sm text-slate-400">LifeOps will not create anything until you approve.</p>
        <div className="mt-4 flex gap-2">
          <button ref={ok} className="btn" onClick={onApprove}>Approve</button>
          <button ref={cancel} className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
