import type { Verdict } from "@/types";

const STYLES: Record<Verdict, { label: string; emoji: string; cls: string }> = {
  REPLACE: {
    label: "REPLACE IT",
    emoji: "🔴",
    cls: "bg-verdict-replace/15 text-verdict-replace border-verdict-replace/40",
  },
  FIX: {
    label: "FIX IT",
    emoji: "🟡",
    cls: "bg-verdict-fix/15 text-verdict-fix border-verdict-fix/40",
  },
  KEEP: {
    label: "KEEP IT",
    emoji: "✅",
    cls: "bg-verdict-keep/15 text-verdict-keep border-verdict-keep/40",
  },
};

export function VerdictBadge({ verdict }: { verdict: Verdict | null }) {
  if (!verdict) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs uppercase tracking-wider text-zinc-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
        Analyzing…
      </span>
    );
  }
  const s = STYLES[verdict];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${s.cls}`}
    >
      <span aria-hidden>{s.emoji}</span>
      {s.label}
    </span>
  );
}

export function parseVerdict(text: string): Verdict | null {
  const m = text.match(/\*\*Verdict:\*\*\s*([🔴🟡✅])/);
  if (!m) return null;
  if (m[1] === "🔴") return "REPLACE";
  if (m[1] === "🟡") return "FIX";
  if (m[1] === "✅") return "KEEP";
  return null;
}
