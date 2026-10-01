import { useState } from "react";
import { fmt } from "../lib/dates";
import type { Obligation } from "../lib/types";

const POS = [[330, 70], [330, 230], [70, 230], [70, 70], [200, 278]];

export default function LifeGraph({ items, selected, onSelect }: { items: Obligation[]; selected?: string; onSelect?: (id: string) => void }) {
  const [local, setLocal] = useState<string | undefined>(items[0]?.id);
  const sel = selected ?? local;
  const cur = items.find((i) => i.id === sel) ?? items[0];
  const pick = (id: string) => { setLocal(id); onSelect?.(id); };
  return (
    <div className="glass overflow-hidden">
      <div className="px-4 pt-3 font-semibold">Your Life Graph</div>
      <svg viewBox="0 0 400 300" className="block h-auto w-full" role="img" aria-label="Life graph connecting documents to actions">
        {items.slice(0, 5).map((o, i) => (
          <line key={o.id} x1="200" y1="150" x2={POS[i][0]} y2={POS[i][1]} stroke={o.id === cur?.id ? "#7c6cff" : "rgba(255,255,255,.12)"} strokeWidth="1.5" strokeDasharray={o.id === cur?.id ? "5 5" : undefined} />
        ))}
        <circle cx="200" cy="150" r="34" fill="rgba(124,108,255,.25)" stroke="#7c6cff" />
        <text x="200" y="154" fill="#eceef6" fontSize="11" textAnchor="middle">✦ LIFEOPS</text>
        {items.slice(0, 5).map((o, i) => (
          <g key={o.id} tabIndex={0} role="button" aria-label={`${o.title}, ${o.priority} priority`} className="cursor-pointer" onClick={() => pick(o.id)} onKeyDown={(e) => e.key === "Enter" && pick(o.id)}>
            <circle cx={POS[i][0]} cy={POS[i][1]} r="30" fill={o.id === cur?.id ? "#1d1b3a" : "#14151d"} stroke={o.id === cur?.id ? "#7c6cff" : "rgba(255,255,255,.15)"} strokeWidth="1.5" />
            <text x={POS[i][0]} y={POS[i][1] + 4} fill="#eceef6" fontSize="11" textAnchor="middle">{o.title.split(" ")[0]}</text>
          </g>
        ))}
      </svg>
      {cur && (
        <div className="min-h-[96px] border-t border-white/10 p-4 text-sm" aria-live="polite">
          <b className="text-cyan">{cur.title}</b>{cur.amount ? ` · ${cur.currency} ${cur.amount.toLocaleString("en-IN")}` : ""} → Due {fmt(cur.due_date)} → {cur.priority} → <b>{cur.recommended_action}</b>
          <div className="mt-1 text-slate-400">Source: {cur.source_name} · Reason: {cur.reason}</div>
        </div>
      )}
    </div>
  );
}
