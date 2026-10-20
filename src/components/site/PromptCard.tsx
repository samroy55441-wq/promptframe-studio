import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import type { PromptItem } from "@/lib/library";
import { Button } from "@/components/ui/button";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { toast.error("Couldn’t copy — please select and copy the prompt."); return; }
        setDone(true);
        toast.success("Prompt copied");
        setTimeout(() => setDone(false), 1600);
      }}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />} {done ? "Copied" : label}
    </Button>
  );
}

export function PromptCard({ item, index = 0 }: { item: PromptItem; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 60, rotate: index % 2 ? 2 : -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-3xl border border-border bg-card"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={item.image} alt={item.title} loading="lazy" className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">{item.style}</span>
        <h3 className="absolute bottom-4 left-5 right-5 font-display text-3xl italic leading-none">{item.title}</h3>
      </div>
      <div className="space-y-4 p-5">
        <p className="line-clamp-4 font-mono text-xs leading-relaxed text-muted-foreground">{item.prompt}</p>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={item.prompt} />

        </div>
      </div>
    </motion.article>
  );
}
