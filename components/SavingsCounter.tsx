"use client";

import { useEffect, useState } from "react";
import type { SavingsSummary } from "@/lib/scoring";

interface Props {
  summary: SavingsSummary;
}

function useTickUp(target: number, durationMs = 1500): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased * 10) / 10);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function SavingsCounter({ summary }: Props) {
  const hours = useTickUp(summary.savedPersonHours);
  const days = useTickUp(summary.savedWorkdays);
  const { byVerdict, totalPersonHours } = summary;

  return (
    <div className="rounded-xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-zinc-950 p-6">
      <div className="text-[10px] uppercase tracking-widest text-emerald-400/80">
        Counterfactual · last 28 days
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-5xl font-semibold tabular-nums text-emerald-100">
          {hours.toFixed(1)}
        </span>
        <span className="text-lg text-emerald-300/80">person-hours saved</span>
      </div>
      <div className="mt-1 text-sm text-zinc-400">
        ≈ <span className="tabular-nums text-zinc-200">{days.toFixed(1)}</span>{" "}
        working days your team would have gotten back · out of{" "}
        <span className="tabular-nums text-zinc-300">{totalPersonHours}</span>{" "}
        person-hours spent
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Pill color="replace" label={`${byVerdict.REPLACE} REPLACE`} />
        <Pill color="fix" label={`${byVerdict.FIX} FIX`} />
        <Pill color="keep" label={`${byVerdict.KEEP} KEEP`} />
      </div>

      <p className="mt-4 max-w-xl text-[11px] leading-relaxed text-zinc-500">
        Honest math: we credit a full meeting recovered for every REPLACE, half
        a meeting recovered for every FIX, and zero for KEEP. No
        double-counting, no padding.
      </p>
    </div>
  );
}

function Pill({
  color,
  label,
}: {
  color: "replace" | "fix" | "keep";
  label: string;
}) {
  const cls =
    color === "replace"
      ? "bg-verdict-replace/15 text-verdict-replace border-verdict-replace/40"
      : color === "fix"
        ? "bg-verdict-fix/15 text-verdict-fix border-verdict-fix/40"
        : "bg-verdict-keep/15 text-verdict-keep border-verdict-keep/40";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold uppercase tracking-wider ${cls}`}
    >
      {label}
    </span>
  );
}
