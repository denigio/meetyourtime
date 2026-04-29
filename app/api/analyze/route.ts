import { NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { ANALYST_MODEL, getAnthropic } from "@/lib/anthropic";
import { JTBD_SYSTEM_PROMPT } from "@/lib/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MEDIA_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB per image (post-base64-decode)

interface ImagePayload {
  media_type: AllowedMediaType;
  data: string; // raw base64, no data: prefix
}

function parseImages(raw: unknown): ImagePayload[] | { error: string } {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) return { error: "'images' must be an array" };
  if (raw.length > MAX_IMAGES) {
    return { error: `Max ${MAX_IMAGES} screenshots per analysis` };
  }

  const out: ImagePayload[] = [];
  for (const item of raw) {
    if (typeof item !== "string") {
      return { error: "Each image must be a data URL string" };
    }
    const match = item.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!match) {
      return { error: "Image must be a base64 data URL" };
    }
    const mediaType = match[1] as AllowedMediaType;
    if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
      return {
        error: `Unsupported image type ${mediaType}. Use PNG, JPEG, WebP, or GIF.`,
      };
    }
    const data = match[2];
    // base64 decoded length ≈ data.length * 3/4
    if (data.length * 0.75 > MAX_IMAGE_BYTES) {
      return { error: "Image exceeds 5 MB limit" };
    }
    out.push({ media_type: mediaType, data });
  }
  return out;
}

export async function POST(req: NextRequest) {
  let invite = "";
  let images: ImagePayload[] = [];
  try {
    const body = await req.json();
    invite = typeof body?.invite === "string" ? body.invite.trim() : "";
    const parsed = parseImages(body?.images);
    if (!Array.isArray(parsed)) {
      return new Response(parsed.error, { status: 400 });
    }
    images = parsed;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!invite && images.length === 0) {
    return new Response(
      "Provide an 'invite' string, one or more 'images', or both",
      { status: 400 },
    );
  }

  let anthropic;
  try {
    anthropic = getAnthropic();
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }

  const userContent: Array<
    Anthropic.TextBlockParam | Anthropic.ImageBlockParam
  > = [];
  for (const img of images) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.media_type,
        data: img.data,
      },
    });
  }
  if (images.length > 0 && !invite) {
    userContent.push({
      type: "text",
      text: "The meeting invite is shown in the screenshot(s) above. Extract the relevant details (subject, time, attendees, organizer, description, recurrence) and analyze it.",
    });
  } else if (images.length > 0 && invite) {
    userContent.push({
      type: "text",
      text: `Screenshot(s) above; additional pasted context below:\n\n${invite}`,
    });
  } else {
    userContent.push({ type: "text", text: invite });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = anthropic.messages.stream({
          model: ANALYST_MODEL,
          max_tokens: 2048,
          system: JTBD_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
        });

        for await (const chunk of messageStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `\n\n---\n\n**Error:** ${(err as Error).message ?? "Unknown error from analyzer"}`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
