export type Verdict = "REPLACE" | "FIX" | "KEEP";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  durationMinutes: number;
  attendeeCount: number;
  attendees: string[];
  organizer?: string;
  description?: string;
  location?: string;
  recurring: boolean;
  hangoutLink?: string;
}
