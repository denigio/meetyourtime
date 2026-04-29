export function personHours(
  attendees: number,
  durationMinutes: number,
): number {
  return Math.round(((attendees * durationMinutes) / 60) * 10) / 10;
}

export function monthlyIfWeekly(perMeeting: number): number {
  return Math.round(perMeeting * 4 * 10) / 10;
}
