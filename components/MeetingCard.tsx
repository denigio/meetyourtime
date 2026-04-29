import type { CalendarEvent, Verdict } from "@/types";
import { personHours } from "@/lib/cost";

interface Props {
  event: CalendarEvent;
  onAnalyze: (event: CalendarEvent) => void;
  verdict?: Verdict | null;
  reason?: string;
  scoring?: boolean;
}

const VERDICT_CHIP: Record<Verdict, { emoji: string; cls: string }> = {
  REPLACE: {
    emoji: "🔴",
    cls: "bg-verdict-replace/15 text-verdict-replace border-verdict-replace/40",
  },
  FIX: {
    emoji: "🟡",
    cls: "bg-verdict-fix/15 text-verdict-fix border-verdict-fix/40",
  },
  KEEP: {
    emoji: "✅",
    cls: "bg-verdict-keep/15 text-verdict-keep border-verdict-keep/40",
  },
};

function fmtWhen(iso: string, durationMinutes: number) {
  if (!iso) return "(no time)";
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} · ${time} · ${durationMinutes}m`;
}

export function MeetingCard({
  event,
  onAnalyze,
  verdict,
  reason,
  scoring,
}: Props) {
  const cost = personHours(event.attendeeCount, event.durationMinutes);
  return (
    <button
      onClick={() => onAnalyze(event)}
      className="group flex w-full flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-zinc-600 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-zinc-100">{event.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {event.recurring && (
            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
              recurring
            </span>
          )}
          {verdict ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${VERDICT_CHIP[verdict].cls}`}
            >
              <span aria-hidden>{VERDICT_CHIP[verdict].emoji}</span>
              {verdict}
            </span>
          ) : scoring ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" />
              scoring
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span>{fmtWhen(event.start, event.durationMinutes)}</span>
        <span>·</span>
        <span>
          {event.attendeeCount} attendee{event.attendeeCount === 1 ? "" : "s"}
        </span>
        <span>·</span>
        <span className="tabular-nums text-zinc-400">{cost} person-hr</span>
      </div>
      {reason ? (
        <div className="mt-1 text-xs italic text-zinc-500">{reason}</div>
      ) : (
        <div className="mt-1 text-xs text-zinc-500 opacity-0 transition group-hover:opacity-100">
          Click to analyze →
        </div>
      )}
    </button>
  );
}
