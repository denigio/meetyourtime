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
  const [copied, setCopied] = useState<"none" | "result" | "artifact">("none");
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
  const { before, artifact, after } = splitArtifact(text);
  const sendable = artifact ? extractSendable(artifact) : null;

  const copy = async (value: string, kind: "result" | "artifact") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied("none"), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <VerdictBadge verdict={verdict} done={done} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => copy(text, "result")}
            disabled={!done}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
          >
            {copied === "result" ? "Copied" : "Copy result"}
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
          {artifact ? (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {before}
              </ReactMarkdown>
              <div className="not-prose relative my-4 overflow-hidden rounded-lg border border-emerald-900/40 border-l-4 border-l-emerald-500/70 bg-emerald-950/10">
                <div className="flex items-center justify-between gap-3 border-b border-emerald-900/30 bg-emerald-950/20 px-4 py-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-300/80">
                    Ready to send
                  </span>
                  <button
                    onClick={() => copy(sendable ?? artifact, "artifact")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/60 bg-emerald-900/40 px-2.5 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-800/60"
                  >
                    {copied === "artifact" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="prose-analysis px-5 py-4 text-zinc-200">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {artifact}
                  </ReactMarkdown>
                </div>
              </div>
              {after && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {after}
                </ReactMarkdown>
              )}
            </>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text || "_Thinking…_"}
            </ReactMarkdown>
          )}
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

function splitArtifact(text: string): {
  before: string;
  artifact: string | null;
  after: string;
} {
  const verdictMatch = text.match(/^\*\*Verdict:\*\*[^\n]*$/m);
  if (!verdictMatch || verdictMatch.index === undefined) {
    return { before: text, artifact: null, after: "" };
  }
  const afterVerdict = verdictMatch.index + verdictMatch[0].length;
  const costMatch = text.slice(afterVerdict).match(/\n\*\*Cost:\*\*/);
  const costStart = costMatch?.index;

  const sectionEnd =
    costStart !== undefined ? afterVerdict + costStart : text.length;
  const rawArtifact = text.slice(afterVerdict, sectionEnd).trim();
  if (!rawArtifact) return { before: text, artifact: null, after: "" };

  return {
    before: text.slice(0, afterVerdict),
    artifact: rawArtifact,
    after: text.slice(sectionEnd).replace(/^\n+/, ""),
  };
}

function extractSendable(artifact: string): string {
  const hrIdx = artifact.search(/^\s*---\s*$/m);
  if (hrIdx === -1) return artifact;
  const after = artifact
    .slice(hrIdx)
    .replace(/^\s*---\s*\n/, "")
    .trim();
  return after || artifact;
}
