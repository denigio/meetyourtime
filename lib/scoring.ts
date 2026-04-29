import type { CalendarEvent, Verdict } from "@/types";

export const RECOVERY_RATE: Record<Verdict, number> = {
  REPLACE: 1.0,
  FIX: 0.5,
  KEEP: 0,
};

export interface ScoredEvent {
  id: string;
  verdict: Verdict;
  reason: string;
}

export interface SavingsSummary {
  totalPersonHours: number;
  savedPersonHours: number;
  savedWorkdays: number;
  byVerdict: Record<Verdict, number>;
}

export function savedMinutesFor(
  verdict: Verdict,
  event: CalendarEvent,
): number {
  return event.durationMinutes * event.attendeeCount * RECOVERY_RATE[verdict];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function aggregateSavings(
  events: CalendarEvent[],
  scored: ScoredEvent[],
): SavingsSummary {
  const byId = new Map(scored.map((s) => [s.id, s]));
  const byVerdict: Record<Verdict, number> = { REPLACE: 0, FIX: 0, KEEP: 0 };
  let totalMinutes = 0;
  let savedMinutes = 0;

  for (const ev of events) {
    totalMinutes += ev.durationMinutes * ev.attendeeCount;
    const s = byId.get(ev.id);
    if (s) {
      byVerdict[s.verdict] += 1;
      savedMinutes += savedMinutesFor(s.verdict, ev);
    }
  }

  const savedPersonHours = round1(savedMinutes / 60);
  return {
    totalPersonHours: round1(totalMinutes / 60),
    savedPersonHours,
    savedWorkdays: round1(savedPersonHours / 8),
    byVerdict,
  };
}
