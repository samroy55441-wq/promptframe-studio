import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCollections } from "@/lib/collections";
import type { PromptItem } from "@/lib/library";
import { Bookmark, Plus } from "lucide-react";

export function SaveDialog({ item, children }: { item: PromptItem; children?: React.ReactNode }) {
  const { collections, create, addItem } = useCollections();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const add = (id: string, label: string) => {
    try {
      addItem(id, item);
      toast.success(`Saved to “${label}”`);
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary">
            <Bookmark className="size-4" /> Save
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal italic">Save to collection</DialogTitle>
        </DialogHeader>
        <div className="max-h-60 space-y-2 overflow-auto">
          {collections.length === 0 && <p className="text-sm text-muted-foreground">No collections yet — create your first one below.</p>}
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => add(c.id, c.name)}
              className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary"
            >
              <span>{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.items.length} prompts</span>
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const c = create(name);
            add(c.id, c.name);
            setName("");
          }}
          className="flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New collection name"
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" /> Create
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
