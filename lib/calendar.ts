import type { CalendarEvent } from "@/types";

interface GoogleEvent {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  location?: string | null;
  hangoutLink?: string | null;
  start?: {
    dateTime?: string | null;
    date?: string | null;
    timeZone?: string | null;
  } | null;
  end?: {
    dateTime?: string | null;
    date?: string | null;
    timeZone?: string | null;
  } | null;
  attendees?: Array<{
    email?: string | null;
    displayName?: string | null;
    responseStatus?: string | null;
  }> | null;
  organizer?: { email?: string | null; displayName?: string | null } | null;
  recurringEventId?: string | null;
  recurrence?: string[] | null;
}

export function normalizeGoogleEvent(e: GoogleEvent): CalendarEvent {
  const startStr = e.start?.dateTime ?? e.start?.date ?? "";
  const endStr = e.end?.dateTime ?? e.end?.date ?? "";
  const start = new Date(startStr);
  const end = new Date(endStr);
  const durationMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60000),
  );

  const attendees = (e.attendees ?? [])
    .map((a) => a.displayName || a.email || "")
    .filter(Boolean);

  return {
    id: e.id ?? "",
    title: e.summary ?? "(no title)",
    start: startStr,
    end: endStr,
    durationMinutes,
    attendeeCount: attendees.length || 1,
    attendees,
    organizer: e.organizer?.displayName ?? e.organizer?.email ?? undefined,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
    recurring: Boolean(
      e.recurringEventId || (e.recurrence && e.recurrence.length > 0),
    ),
    hangoutLink: e.hangoutLink ?? undefined,
  };
}

export function eventToInviteText(ev: CalendarEvent): string {
  const startLocal = ev.start
    ? new Date(ev.start).toLocaleString()
    : "(no start)";
  const lines = [
    `Subject: ${ev.title}`,
    `When: ${startLocal} (${ev.durationMinutes} minutes${ev.recurring ? ", recurring" : ""})`,
    `Attendees: ${ev.attendeeCount}${ev.attendees.length > 0 ? ` — ${ev.attendees.join(", ")}` : ""}`,
    ev.organizer ? `Organizer: ${ev.organizer}` : null,
    ev.location ? `Location: ${ev.location}` : null,
    "",
    "Description:",
    ev.description?.trim() ? ev.description.trim() : "(empty)",
  ];
  return lines.filter((l) => l !== null).join("\n");
}
