import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { LIBRARY } from "@/lib/library";
import { PromptCard } from "@/components/site/PromptCard";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Prompt Library — Images with exact prompts | PromptLens" },
      { name: "description", content: "Browse a curated collection of AI images with their exact prompts. Copy or save any of them." },
      { property: "og:title", content: "Prompt Library | PromptLens" },
      { property: "og:description", content: "Curated AI images with copy-ready prompts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Library,
});

function Library() {
  const [q, setQ] = useState("");
  const items = LIBRARY.filter((i) => (i.title + i.prompt + i.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-36">
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8 font-display text-6xl sm:text-8xl">
        The <span className="italic text-gradient">Library</span>
      </motion.h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search portraits, 3D, product…" className="mb-12 w-full max-w-md rounded-full border border-input bg-card px-5 py-3 outline-none focus:border-primary" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => <PromptCard key={it.id} item={it} index={i} />)}
      </div>
      {items.length === 0 && <p className="text-muted-foreground">Nothing matches “{q}”.</p>}
    </main>
  );
}
