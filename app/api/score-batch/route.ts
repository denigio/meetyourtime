import { NextRequest } from "next/server";
import { ANALYST_MODEL, getAnthropic } from "@/lib/anthropic";
import { eventToInviteText } from "@/lib/calendar";
import { SCORE_SYSTEM_PROMPT, parseScoreOutput } from "@/lib/scorePrompt";
import type { CalendarEvent } from "@/types";
import type { ScoredEvent } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CONCURRENCY = 8;

async function scoreOne(
  anthropic: ReturnType<typeof getAnthropic>,
  event: CalendarEvent,
): Promise<ScoredEvent> {
  try {
    const msg = await anthropic.messages.create({
      model: ANALYST_MODEL,
      max_tokens: 200,
      system: SCORE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: eventToInviteText(event) }],
    });

    const text = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    const parsed = parseScoreOutput(text);
    if (!parsed) {
      return {
        id: event.id,
        verdict: "KEEP",
        reason: "Could not parse model output (defaulted to KEEP).",
      };
    }
    return { id: event.id, verdict: parsed.verdict, reason: parsed.reason };
  } catch (err) {
    return {
      id: event.id,
      verdict: "KEEP",
      reason: `Scoring failed: ${(err as Error).message ?? "unknown error"} (defaulted to KEEP).`,
    };
  }
}

async function runWithConcurrency(
  events: CalendarEvent[],
  worker: (e: CalendarEvent) => Promise<ScoredEvent>,
): Promise<ScoredEvent[]> {
  const results: ScoredEvent[] = new Array(events.length);
  let cursor = 0;

  async function pump() {
    while (true) {
      const i = cursor++;
      if (i >= events.length) return;
      results[i] = await worker(events[i]);
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, events.length) },
    pump,
  );
  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  let events: CalendarEvent[] = [];
  try {
    const body = await req.json();
    if (!Array.isArray(body?.events)) {
      return new Response("Body must include { events: CalendarEvent[] }", {
        status: 400,
      });
    }
    events = body.events as CalendarEvent[];
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (events.length === 0) {
    return Response.json({ scored: [] });
  }
  if (events.length > 60) {
    return new Response("Too many events (max 60 per batch)", { status: 400 });
  }

  let anthropic;
  try {
    anthropic = getAnthropic();
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }

  const scored = await runWithConcurrency(events, (ev) =>
    scoreOne(anthropic, ev),
  );

  return Response.json({ scored });
}
