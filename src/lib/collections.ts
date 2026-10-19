import { useEffect, useState, useCallback } from "react";
import type { PromptItem } from "./library";

export type Collection = { id: string; name: string; items: PromptItem[]; createdAt: number };
const KEY = "promptlens.collections.v1";

function read(): Collection[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  useEffect(() => {
    setCollections(read());
    const on = () => setCollections(read());
    window.addEventListener("promptlens:update", on);
    return () => window.removeEventListener("promptlens:update", on);
  }, []);

  const save = useCallback((next: Collection[]) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      throw new Error("Storage full — try removing some saved items.");
    }
    window.dispatchEvent(new Event("promptlens:update"));
  }, []);

  return {
    collections,
    create: (name: string) => {
      const c: Collection = { id: crypto.randomUUID(), name: name.trim() || "Untitled", items: [], createdAt: Date.now() };
      save([c, ...read()]);
      return c;
    },
    remove: (id: string) => save(read().filter((c) => c.id !== id)),
    addItem: (id: string, item: PromptItem) =>
      save(read().map((c) => (c.id === id && !c.items.some((i) => i.id === item.id) ? { ...c, items: [item, ...c.items] } : c))),
    removeItem: (id: string, itemId: string) =>
      save(read().map((c) => (c.id === id ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c))),
  };
}
