import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Studio } from "@/components/site/Studio";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Prompt Studio — Upload an image, video or ringtone | PromptLens" },
      { name: "description", content: "Upload an image, video or ringtone and instantly get the detailed recreation prompt to recreate it." },
      { property: "og:title", content: "Prompt Studio | PromptLens" },
      { property: "og:description", content: "Upload any image, video or ringtone and get its detailed recreation prompt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-36">
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-3 font-display text-6xl sm:text-8xl">
        Prompt <span className="italic text-gradient">Studio</span>
      </motion.h1>
      <p className="mb-12 text-muted-foreground">Upload an image, short video or ringtone. We'll write the recreation prompt.</p>
      <Studio />
    </main>
  ),
});
