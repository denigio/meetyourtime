"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent } from "@/types";
import { MeetingCard } from "./MeetingCard";
import { AnalysisStream } from "./AnalysisStream";
import { eventToInviteText } from "@/lib/calendar";

export function MeetingsList() {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/calendar/events");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (!cancel) setError(body.error ?? `HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as { events: CalendarEvent[] };
        if (!cancel) setEvents(data.events);
      } catch (e) {
        if (!cancel) setError((e as Error).message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

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

  if (error) {
    return (
      <div className="rounded-md border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">
        Failed to load calendar: {error}
      </div>
    );
  }

  if (events === null) {
    return <div className="text-sm text-zinc-500">Loading meetings…</div>;
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
        No meetings in the next 7 days. Enjoy the silence.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((ev) => (
        <MeetingCard key={ev.id} event={ev} onAnalyze={setSelected} />
      ))}
    </div>
  );
}
