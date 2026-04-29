import { auth } from "@/auth";
import { google } from "googleapis";
import { normalizeGoogleEvent } from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!session || !accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2 });

    const now = new Date();
    const weekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: weekOut.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 25,
    });

    const events = (res.data.items ?? [])
      .filter((e) => Boolean(e.start?.dateTime || e.start?.date))
      .map(normalizeGoogleEvent);

    return Response.json({ events });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message ?? "Failed to load calendar" },
      { status: 500 },
    );
  }
}
