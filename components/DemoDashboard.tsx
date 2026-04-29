"use client";

import { useMemo, useState } from "react";
import type { CalendarEvent } from "@/types";
import {
  aggregateSavings,
  type ScoredEvent,
  type SavingsSummary,
} from "@/lib/scoring";
import { personHours } from "@/lib/cost";
import { eventToInviteText } from "@/lib/calendar";
import { MeetingCard } from "./MeetingCard";
import { SavingsCounter } from "./SavingsCounter";
import { AnalysisStream } from "./AnalysisStream";

interface Props {
  events: CalendarEvent[];
  teamName: string;
}

type Phase = "idle" | "scoring" | "done" | "error";

export function DemoDashboard({ events, teamName }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scored, setScored] = useState<Map<string, ScoredEvent>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const totalCost = useMemo(
    () =>
      events.reduce(
        (acc, ev) => acc + personHours(ev.attendeeCount, ev.durationMinutes),
        0,
      ),
    [events],
  );

  const summary: SavingsSummary | null = useMemo(() => {
    if (phase !== "done") return null;
    return aggregateSavings(events, Array.from(scored.values()));
  }, [phase, events, scored]);

  const runBatch = async () => {
    setPhase("scoring");
    setError(null);
    setScored(new Map());

    try {
      const res = await fetch("/api/score-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => `HTTP ${res.status}`);
        setError(msg || `HTTP ${res.status}`);
        setPhase("error");
        return;
      }
      const data = (await res.json()) as { scored: ScoredEvent[] };
      const map = new Map<string, ScoredEvent>();
      for (const s of data.scored) map.set(s.id, s);
      setScored(map);
      setPhase("done");
    } catch (e) {
      setError((e as Error).message);
      setPhase("error");
    }
  };

  if (selected) {
    const invite = eventToInviteText(selected);
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Analyzing
          </div>
          <div className="mt-1 font-medium text-zinc-100">{selected.title}</div>
        </div>
        <AnalysisStream invite={invite} onReset={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
          Sample team
        </div>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="text-lg font-medium text-zinc-100">{teamName}</div>
            <div className="mt-1 text-sm text-zinc-400">
              Last 28 days ·{" "}
              <span className="tabular-nums text-zinc-200">
                {events.length}
              </span>{" "}
              meetings ·{" "}
              <span className="tabular-nums text-zinc-200">
                {Math.round(totalCost * 10) / 10}
              </span>{" "}
              person-hours spent
            </div>
          </div>
          {phase === "idle" && (
            <button
              onClick={runBatch}
              className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              Analyze all {events.length} meetings →
            </button>
          )}
          {phase === "scoring" && (
            <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Scoring {events.length} meetings in parallel…
            </div>
          )}
          {phase === "done" && (
            <button
              onClick={runBatch}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              Re-run analysis
            </button>
          )}
        </div>
      </div>

      {summary && <SavingsCounter summary={summary} />}

      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">
          Batch failed: {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {events.map((ev) => {
          const s = scored.get(ev.id);
          return (
            <MeetingCard
              key={ev.id}
              event={ev}
              onAnalyze={setSelected}
              verdict={s?.verdict ?? null}
              reason={s?.reason}
              scoring={phase === "scoring"}
            />
          );
        })}
      </div>
    </div>
  );
}
