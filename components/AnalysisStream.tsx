"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VerdictBadge, parseVerdict } from "./VerdictBadge";
import { CostCounter } from "./CostCounter";

interface Props {
  invite: string;
  images?: string[];
  onReset: () => void;
}

export function AnalysisStream({ invite, images, onReset }: Props) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aborter = useRef<AbortController | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    aborter.current = ac;
    setText("");
    setDone(false);
    setError(null);

    (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invite, images: images ?? [] }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          const msg = await res.text().catch(() => "Request failed");
          setError(msg || `HTTP ${res.status}`);
          setDone(true);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done: rDone } = await reader.read();
          if (rDone) break;
          buf += decoder.decode(value, { stream: true });
          setText(buf);
        }
        setDone(true);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message);
        setDone(true);
      }
    })();

    return () => ac.abort();
  }, [invite, images]);

  const verdict = parseVerdict(text);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <VerdictBadge verdict={verdict} />
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            disabled={!done}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
          >
            Copy result
          </button>
          <button
            onClick={onReset}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            New invite
          </button>
        </div>
      </div>

      <CostCounter text={text} />

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <div
          className={`prose-analysis text-zinc-200 ${done ? "" : "cursor-blink"}`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text || "_Thinking…_"}
          </ReactMarkdown>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
