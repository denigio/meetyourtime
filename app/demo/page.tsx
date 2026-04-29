import Link from "next/link";
import { DemoDashboard } from "@/components/DemoDashboard";
import { SAMPLE_HISTORY, SAMPLE_TEAM_NAME } from "@/lib/sampleHistory";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-300"
          >
            ← Meeting Analyst
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100">
            What this would have saved you
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            A real product team's last 28 days of meetings. We'll score each
            one, then show how many person-hours your team would have gotten
            back if you'd been using this the whole time.
          </p>
        </div>
      </header>

      <DemoDashboard events={SAMPLE_HISTORY} teamName={SAMPLE_TEAM_NAME} />
    </main>
  );
}
