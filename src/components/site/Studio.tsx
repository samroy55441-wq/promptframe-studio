import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ImageUp, Loader2, RotateCcw, Sparkles, Video } from "lucide-react";
import { CopyButton } from "./PromptCard";
import { SaveDialog } from "./SaveDialog";
import type { PromptItem } from "@/lib/library";

function resize(src: CanvasImageSource, w: number, h: number, max: number, q = 0.85) {
  const s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}

function imageToData(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(resize(img, img.naturalWidth, img.naturalHeight, 1024));
    img.onerror = () => rej(new Error("Couldn't read that image."));
    img.src = URL.createObjectURL(file);
  });
}

async function videoFrames(file: File): Promise<string[]> {
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.src = URL.createObjectURL(file);
  await new Promise<void>((r, j) => {
    v.onloadeddata = () => r();
    v.onerror = () => j(new Error("Couldn't read that video."));
  });
  const frames: string[] = [];
  for (const t of [0.15, 0.5, 0.85]) {
    v.currentTime = v.duration * t;
    await new Promise((r) => (v.onseeked = r));
    frames.push(resize(v, v.videoWidth, v.videoHeight, 768, 0.8));
  }
  return frames;
}

function parse(text: string) {
  const get = (k: string, next: string[]) => {
    const re = new RegExp(`${k}:\\s*([\\s\\S]*?)(?=${next.map((n) => `\\n\\s*${n}:`).join("|") || "$"}|$)`, "i");
    return text.match(re)?.[1]?.trim() ?? "";
  };
  return {
    prompt: get("PROMPT", ["NEGATIVE", "STYLE", "TAGS"]) || text.trim(),
    negative: get("NEGATIVE", ["STYLE", "TAGS"]),
    style: get("STYLE", ["TAGS"]),
    tags: get("TAGS", []).split(",").map((t) => t.trim()).filter(Boolean),
  };
}

export function Studio() {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ url: string; video: boolean; thumb: string } | null>(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    const video = file.type.startsWith("video/");
    if (!video && !file.type.startsWith("image/")) return toast.error("Please upload an image or a video.");
    if (file.size > 100 * 1024 * 1024) return toast.error("File is too large (max 100MB).");
    setRaw("");
    setLoading(true);
    try {
      const images = video ? await videoFrames(file) : [await imageToData(file)];
      setPreview({ url: URL.createObjectURL(file), video, thumb: images[0] });
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, isVideo: video }),
      });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || "Something went wrong.");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let out = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const p of parts) {
          const line = p.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const ev = JSON.parse(data);
            if (ev.type === "response.output_text.delta") {
              out += ev.delta;
              setRaw(out);
            } else if (ev.type === "error" || ev.type === "response.failed") {
              throw new Error(ev.error?.message || ev.response?.error?.message || "Analysis failed.");
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
      if (!out.trim()) throw new Error("No prompt came back for this file. Try another one.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const result = raw ? parse(raw) : null;
  const item: PromptItem | null =
    result && preview && !loading
      ? {
          id: `mine-${Date.now()}`,
          title: result.style || "My upload",
          image: preview.thumb,
          prompt: result.prompt,
          negative: result.negative,
          style: result.style || "Custom",
          tags: result.tags,
        }
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => !loading && input.current?.click()}
        animate={{ scale: drag ? 1.02 : 1, borderColor: drag ? "var(--primary)" : "var(--border)" }}
        className="relative flex min-h-[420px] cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-card"
      >
        <input ref={input} type="file" accept="image/*,video/*" hidden onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ""; }} />
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div key={preview.url} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              {preview.video ? (
                <video src={preview.url} autoPlay muted loop playsInline className="size-full object-cover" />
              ) : (
                <img src={preview.url} alt="Your upload" className="size-full object-cover" />
              )}
              {loading && (
                <motion.div
                  className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
                  animate={{ top: ["-20%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 text-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto mb-6 flex w-fit gap-3">
                <span className="rounded-2xl bg-primary p-4 text-primary-foreground"><ImageUp className="size-7" /></span>
                <span className="rounded-2xl bg-accent p-4 text-accent-foreground"><Video className="size-7" /></span>
              </motion.div>
              <p className="font-display text-4xl italic">Drop an image or video</p>
              <p className="mt-2 text-sm text-muted-foreground">or click to browse · JPG, PNG, WEBP, MP4, MOV</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex min-h-[420px] flex-col rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            {loading ? <Loader2 className="size-4 animate-spin text-primary" /> : <Sparkles className="size-4 text-primary" />}
            {loading ? "Reading every detail…" : result ? "Your exact prompt" : "Prompt appears here"}
          </span>
          {preview && !loading && (
            <button onClick={() => input.current?.click()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <RotateCcw className="size-4" /> New
            </button>
          )}
        </div>
        {result ? (
          <div className="flex flex-1 flex-col gap-4">
            <p className="flex-1 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {result.prompt}
              {loading && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary align-middle" />}
            </p>
            {result.negative && (
              <div className="rounded-2xl bg-muted p-4">
                <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Negative</p>
                <p className="font-mono text-xs">{result.negative}</p>
              </div>
            )}
            {result.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t) => <span key={t} className="rounded-full border border-border px-3 py-1 text-xs">#{t}</span>)}
              </div>
            )}
            {item && (
              <div className="flex flex-wrap gap-2">
                <CopyButton text={result.prompt} label="Copy prompt" />
                {result.negative && <CopyButton text={`${result.prompt}\n\nNegative: ${result.negative}`} label="Copy all" />}
                <SaveDialog item={item} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-3">
            {[90, 75, 85, 60].map((w, i) => (
              <motion.div key={i} className="h-3 rounded-full bg-muted" style={{ width: `${w}%` }} animate={{ opacity: loading ? [0.3, 1, 0.3] : 0.5 }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
