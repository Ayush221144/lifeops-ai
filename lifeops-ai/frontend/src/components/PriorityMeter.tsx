import { tone } from "../lib/priority";
import type { Priority } from "../lib/types";

/** Priority is shown as text AND a 3-step meter, never colour alone. */
export default function PriorityMeter({ priority }: { priority: Priority }) {
  const t = tone[priority];
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-bold ${t.text}`} aria-label={`${priority} priority`}>
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => <i key={i} className={`h-1.5 w-2.5 rounded-sm ${i <= t.level ? t.bar : "bg-white/10"}`} />)}
      </span>
      {priority}{priority === "HIGH" ? " · NOW" : ""}
    </span>
  );
}
