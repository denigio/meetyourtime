"use client";

import Link from "next/link";
import { useState } from "react";
import { PasteInput, type AnalyzePayload } from "@/components/PasteInput";
import { AnalysisStream } from "@/components/AnalysisStream";

export default function Home() {
  const [payload, setPayload] = useState<AnalyzePayload | null>(null);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            Meet Your TIme
          </div>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-100">
            Should this meeting exist?
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Paste any invite or drop a screenshot. We name the real job
            it&apos;s hired to do, score it against four signals, and hand back
            an async replacement or a tightened version — in seconds.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Link
            href="/demo"
            className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            See it on a sample team →
          </Link>
          <Link
            href="/meetings"
            className="text-[11px] text-zinc-500 hover:text-zinc-300"
          >
            Or connect your calendar
          </Link>
        </div>
      </header>

      {payload === null ? (
        <PasteInput onSubmit={setPayload} />
      ) : (
        <AnalysisStream
          invite={payload.invite}
          images={payload.images}
          onReset={() => setPayload(null)}
        />
      )}

      <footer className="mt-auto pt-8 text-xs text-zinc-600">
        Built at the hackathon · Powered by Claude Opus 4.7
      </footer>
    </main>
  );
}
