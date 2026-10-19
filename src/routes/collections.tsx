import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCollections } from "@/lib/collections";
import { PromptCard } from "@/components/site/PromptCard";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "My Collections | PromptLens" },
      { name: "description", content: "Create and manage your own prompt collections — no signup, saved in your browser." },
      { property: "og:title", content: "My Collections | PromptLens" },
      { property: "og:description", content: "Organize your favorite AI prompts into collections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Collections,
});

function Collections() {
  const { collections, create, remove, removeItem } = useCollections();
  const [name, setName] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const current = collections.find((c) => c.id === active) ?? collections[0];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-36">
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8 font-display text-6xl sm:text-8xl">
        My <span className="italic text-gradient">Collections</span>
      </motion.h1>
      <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; setActive(create(name).id); setName(""); }} className="mb-10 flex max-w-md gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name a new collection" className="flex-1 rounded-full border border-input bg-card px-5 py-3 outline-none focus:border-primary" />
        <button className="inline-flex items-center gap-1 rounded-full bg-primary px-5 font-semibold text-primary-foreground"><Plus className="size-4" /> Create</button>
      </form>

      {collections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <p className="font-display text-4xl italic">No collections yet</p>
          <p className="mt-2 text-muted-foreground">Create one above, or save prompts from the <Link to="/library" className="text-primary underline">library</Link> or <Link to="/studio" className="text-primary underline">studio</Link>.</p>
        </div>
      ) : (
        <>
          <div className="mb-10 flex flex-wrap gap-2">
            {collections.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)} className={`relative rounded-full border px-5 py-2 text-sm transition-colors ${current?.id === c.id ? "border-primary text-primary-foreground" : "border-border hover:border-foreground"}`}>
                {current?.id === c.id && <motion.span layoutId="pill" className="absolute inset-0 -z-10 rounded-full bg-primary" />}
                {c.name} · {c.items.length}
              </button>
            ))}
          </div>
          {current && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-4xl italic">{current.name}</h2>
                <button onClick={() => { if (confirm(`Delete “${current.name}”?`)) { remove(current.id); setActive(null); } }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /> Delete collection</button>
              </div>
              {current.items.length === 0 ? (
                <p className="text-muted-foreground">Empty for now — tap “Save” on any prompt to add it here.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <AnimatePresence>
                    {current.items.map((it, i) => <PromptCard key={it.id} item={it} index={i} onRemove={() => removeItem(current.id, it.id)} />)}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
