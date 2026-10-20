import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ImageUp, Loader2, RotateCcw, Music2, Video, X } from "lucide-react";
import { CopyButton } from "./PromptCard";
import { Button } from "@/components/ui/button";
import { audioFormat, parsePrompt, streamDelta } from "@/lib/media";

function resize(src: CanvasImageSource, w: number, h: number, max: number) {
  if (!w || !h) throw new Error("This file has no readable image.");
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn’t read the image.");
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}
async function imageToData(url: string) {
  const img = new Image();
  img.src = url;
  await img.decode().catch(() => { throw new Error("Couldn't read this image. Please use JPG, PNG or WEBP."); });
  return resize(img, img.naturalWidth, img.naturalHeight, 1024);
}
async function videoFrames(url: string) {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Couldn't read this video. Please use MP4 or WEBM."));
      video.src = url;
      video.load();
    });
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error("This video has no readable duration.");
    const frames: string[] = [];
    for (const fraction of [0.15, 0.5, 0.85]) {
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("Couldn't read a frame from this video."));
        video.currentTime = video.duration * fraction;
      });
      frames.push(resize(video, video.videoWidth, video.videoHeight, 768));
    }
    return frames;
  } finally { video.removeAttribute("src"); video.load(); }
}
function fileBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read this ringtone."));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result.split(",")[1] ?? "") : reject(new Error("Couldn't read this ringtone."));
    reader.readAsDataURL(file);
  });
}

export function Studio() {
  const input = useRef<HTMLInputElement>(null);
  const active = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; kind: "image" | "video" | "audio"; name: string } | null>(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [drag, setDrag] = useState(false);
  useEffect(() => () => { active.current?.abort(); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  const handle = async (file?: File) => {
    if (!file || active.current) return;
    const format = audioFormat(file);
    const kind = file.type.startsWith("video/") ? "video" : format ? "audio" : file.type.startsWith("image/") ? "image" : null;
    setError("");
    if (!kind) { setError("Please upload an image, video or ringtone (MP3, WAV, M4A, M4R, OGG, AAC, FLAC or WEBM)."); return; }
    if (!file.size) { setError("This file is empty."); return; }
    if (file.size > (kind === "audio" ? 20 : 100) * 1024 * 1024) { setError(kind === "audio" ? "Ringtones must be 20MB or smaller." : "Images and videos must be 100MB or smaller."); return; }
    const controller = new AbortController();
    active.current = controller;
    setRaw(""); setComplete(false); setLoading(true);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setPreview({ url, kind, name: file.name });
    try {
      const body = kind === "audio" ? { kind, audio: await fileBase64(file), format } : { kind, images: kind === "video" ? await videoFrames(url) : [await imageToData(url)] };
      if (controller.signal.aborted) return;
      const res = await fetch("/api/public/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || "Analysis is unavailable right now.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let output = "";
      const consume = (part: string) => {
        const data = part.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n").trim();
        if (!data || data === "[DONE]") return;
        let event;
        try { event = JSON.parse(data); } catch { return; }
        output += streamDelta(event);
        setRaw(output);
      };
      try {
        for (;;) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          parts.forEach(consume);
          if (done) { if (buffer.trim()) consume(buffer); break; }
        }
      } catch (e) { await reader.cancel().catch(() => {}); throw e; }
      if (!output.trim()) throw new Error("The AI returned no prompt for this file.");
      setComplete(true);
    } catch (e) {
      setError(controller.signal.aborted ? "Analysis stopped." : e instanceof Error ? e.message : "Couldn't analyze this file.");
    } finally { active.current = null; setLoading(false); }
  };
  const result = raw ? parsePrompt(raw) : null;
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!loading) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void handle(e.dataTransfer.files[0]); }}
        className={`relative flex min-h-[420px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-card p-6 ${drag ? "border-primary" : "border-border"}`}
      >
        <input aria-label="Upload image, video or ringtone" ref={input} type="file" accept="image/*,video/*,audio/*,.m4r" hidden onChange={(e) => { void handle(e.target.files?.[0]); e.target.value = ""; }} />
        {preview ? <>
          {preview.kind === "audio" ? <div className="w-full min-w-0 text-center"><Music2 className="mx-auto mb-6 size-14 text-accent" /><p className="mb-5 break-all text-sm">{preview.name}</p><audio src={preview.url} controls className="w-full" /></div> : preview.kind === "video" ? <video src={preview.url} controls muted playsInline className="max-h-[360px] w-full object-contain" /> : <img src={preview.url} alt="Your upload" className="max-h-[360px] w-full object-contain" />}
          {!loading && <Button variant="outline" onClick={() => input.current?.click()} className="mt-5 rounded-full"><RotateCcw /> Choose another file</Button>}
        </> : <div className="text-center">
          <div className="mb-6 flex justify-center gap-4 text-primary"><ImageUp className="size-7" /><Video className="size-7" /><Music2 className="size-7 text-accent" /></div>
          <p className="font-display text-4xl italic">Image, video or ringtone</p>
          <Button size="lg" className="mt-6 rounded-full" onClick={() => input.current?.click()}><ImageUp /> Upload a file</Button>
          <p className="mt-4 text-xs text-muted-foreground">JPG · PNG · WEBP · MP4 · MP3 · WAV · M4R</p>
        </div>}
      </div>
      <div className="flex min-h-[420px] min-w-0 flex-col rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span role="status" className="inline-flex items-center gap-2">{loading && <Loader2 className="size-4 shrink-0 animate-spin text-primary" />}{loading ? preview?.kind === "audio" ? "Listening to your ringtone…" : "Reading the details…" : complete ? "Your recreation prompt" : "Your prompt"}</span>
          {loading && <Button size="icon" variant="ghost" aria-label="Stop analysis" title="Stop analysis" onClick={() => active.current?.abort()}><X /></Button>}
        </div>
        {error && <p role="alert" className="mb-4 break-words rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
        {result ? <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="flex-1 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">{result.prompt}</p>
          {result.negative && <div className="rounded-lg bg-muted p-4"><p className="mb-1 text-xs uppercase text-muted-foreground">Negative</p><p className="break-words font-mono text-xs">{result.negative}</p></div>}
          {result.tags.length > 0 && <div className="flex flex-wrap gap-2">{result.tags.map((tag, i) => <span key={`${tag}-${i}`} className="max-w-full break-words rounded-full border border-border px-3 py-1 text-xs">#{tag}</span>)}</div>}
          {complete && <div className="flex flex-wrap gap-2"><CopyButton text={result.prompt} label="Copy prompt" />{result.negative && <CopyButton text={`${result.prompt}\n\nNegative: ${result.negative}`} label="Copy all" />}</div>}
        </div> : <div aria-hidden="true" className="flex flex-1 flex-col justify-center gap-3">{["w-11/12", "w-3/4", "w-5/6", "w-3/5"].map((width, i) => <motion.div key={width} className={`h-3 rounded-full bg-muted ${width}`} animate={{ opacity: loading ? [0.3, 1, 0.3] : 0.5 }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />)}</div>}
      </div>
    </div>
  );
}
