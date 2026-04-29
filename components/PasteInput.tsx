"use client";

import { useRef, useState } from "react";

const SAMPLE = `Subject: Q2 roadmap sync
When: Thursday 2:00–3:00 PM
Attendees: 8
Organizer: Priya
Description: (empty)`;

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface AnalyzePayload {
  invite: string;
  images: string[]; // data URLs
}

interface Props {
  onSubmit: (payload: AnalyzePayload) => void;
}

interface ImageItem {
  id: string;
  name: string;
  dataUrl: string;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export function PasteInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | File[]) => {
    setError(null);
    const incoming = Array.from(files);
    if (incoming.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Max ${MAX_IMAGES} screenshots`);
      return;
    }

    const next: ImageItem[] = [];
    for (const file of incoming.slice(0, remaining)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`Unsupported file: ${file.name || file.type}`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name} exceeds 5 MB`);
        continue;
      }
      try {
        const dataUrl = await readAsDataUrl(file);
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name || "screenshot",
          dataUrl,
        });
      } catch {
        setError(`Could not read ${file.name}`);
      }
    }
    if (next.length > 0) setImages((prev) => [...prev, ...next]);
    if (incoming.length > remaining) {
      setError(`Only added ${remaining} — max ${MAX_IMAGES}`);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed && images.length === 0) return;
    onSubmit({ invite: trimmed, images: images.map((i) => i.dataUrl) });
  };

  const onPaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    const files = Array.from(e.clipboardData.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length > 0) {
      e.preventDefault();
      void addFiles(files);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length > 0) void addFiles(files);
  };

  const canSubmit = value.trim().length > 0 || images.length > 0;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl ${dragOver ? "ring-2 ring-zinc-500" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPaste={onPaste}
        placeholder={`Paste a meeting invite here, drop a screenshot, or both…\n\nExample:\n${SAMPLE}`}
        rows={10}
        className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
      />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.dataUrl}
                alt={img.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                aria-label={`Remove ${img.name}`}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-zinc-100 opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:bg-zinc-800"
          >
            Add screenshot
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => setValue(SAMPLE)}
            className="text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
          >
            Use sample invite
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-zinc-600 sm:inline">
            ⌘ + Enter
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-40"
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
