import Link from "next/link";
import { auth, signIn } from "@/auth";
import { MeetingsList } from "@/components/MeetingsList";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const session = await auth();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const signedIn = Boolean(session && accessToken);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-300"
          >
            ← Meet Your TIme
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100">
            Your next 7 days
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Pick any meeting. We'll analyze it the same way as a pasted invite —
            agenda, outcome, context, roles — and tell you whether it earns its
            slot on your calendar.
          </p>
        </div>
      </header>

      {signedIn ? (
        <MeetingsList />
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/meetings" });
          }}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
        >
          <div className="text-sm text-zinc-300">
            Connect Google Calendar (read-only) to load your upcoming meetings.
          </div>
          <button
            type="submit"
            className="mt-4 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
          >
            Sign in with Google
          </button>
          <div className="mt-3 text-xs text-zinc-500">
            We only read events. No write access. No data is stored.
          </div>
        </form>
      )}
    </main>
  );
}
