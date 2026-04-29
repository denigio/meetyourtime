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

export function VerdictBadge({
  verdict,
  done,
}: {
  verdict: Verdict | null;
  done?: boolean;
}) {
  if (!verdict) {
    if (done) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs uppercase tracking-wider text-zinc-400">
          Analyzed
        </span>
      );
    }
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
  // Find the verdict line; tolerate `**Verdict:**`, `**Verdict**:`, `Verdict:`.
  const lineMatch = text.match(/^[ \t]*\*{0,2}Verdict\*{0,2}\s*:\s*(.+)$/im);
  if (!lineMatch) return null;
  const line = lineMatch[1];

  if (line.includes("🔴")) return "REPLACE";
  if (line.includes("🟡")) return "FIX";
  if (line.includes("✅")) return "KEEP";

  const upper = line.toUpperCase();
  if (upper.includes("REPLACE")) return "REPLACE";
  if (upper.includes("FIX")) return "FIX";
  if (upper.includes("KEEP")) return "KEEP";
  return null;
}
