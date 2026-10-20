import { z } from "zod";

export const audioFormats = ["wav", "mp3", "webm", "m4a", "ogg", "aac", "flac"] as const;
export function audioFormat(file: { type: string; name: string }) {
  const mime: Record<string, typeof audioFormats[number]> = {
    "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/x-wav": "wav",
    "audio/wave": "wav", "audio/webm": "webm", "audio/mp4": "m4a", "audio/x-m4a": "m4a",
    "audio/ogg": "ogg", "audio/aac": "aac", "audio/flac": "flac", "audio/x-flac": "flac",
  };
  const extension = file.name.toLowerCase().split(".").pop();
  return mime[file.type] ?? audioFormats.find((format) => format === extension || (format === "m4a" && extension === "m4r"));
}

const base64 = z.string().min(4).max(28_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/);
export const analysisSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.enum(["image", "video"]), images: z.array(z.string().max(3_000_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/)).min(1).max(4) }),
  z.object({ kind: z.literal("audio"), audio: base64, format: z.enum(audioFormats) }),
]);

export function parsePrompt(text: string) {
  const get = (key: string, next: string[]) => text.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=${next.map((n) => `\\n\\s*${n}:`).join("|") || "$"}|$)`, "i"))?.[1]?.trim() ?? "";
  return {
    prompt: get("PROMPT", ["NEGATIVE", "STYLE", "TAGS"]) || text.trim(),
    negative: get("NEGATIVE", ["STYLE", "TAGS"]),
    style: get("STYLE", ["TAGS"]),
    tags: get("TAGS", []).split(",").map((t) => t.trim()).filter(Boolean),
  };
}

type AnalysisEvent = {
  type?: string;
  delta?: string;
  message?: string;
  error?: { message?: string };
  response?: { error?: { message?: string } };
  choices?: { delta?: { content?: string; refusal?: string }; finish_reason?: string }[];
};

export function streamDelta(event: AnalysisEvent): string {
  if (["error", "response.failed", "response.incomplete", "denied"].includes(event.type ?? "")) {
    throw new Error(event.error?.message || event.response?.error?.message || event.message || "Analysis could not finish.");
  }
  if (event.type === "response.refusal.delta" || event.choices?.[0]?.delta?.refusal || event.choices?.[0]?.finish_reason === "content_filter") {
    throw new Error(event.delta || event.choices?.[0]?.delta?.refusal || "The AI declined to analyze this upload.");
  }
  if (event.type === "response.output_text.delta") return event.delta ?? "";
  return event.choices?.[0]?.delta?.content ?? "";
}