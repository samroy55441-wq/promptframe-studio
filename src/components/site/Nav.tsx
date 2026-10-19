import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "motion/react";

export function Nav() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <>
      <motion.div style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-primary" />
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-4 z-50 mx-auto flex w-[min(94%,960px)] items-center justify-between rounded-full border border-border bg-background/70 px-5 py-2.5 backdrop-blur-xl"
      >
        <Link to="/" className="flex items-center gap-2 font-display text-2xl italic">
          <span className="inline-block size-3 rounded-full bg-primary shadow-glow" />
          PromptLens
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {[
            { to: "/library", label: "Library" },
            { to: "/collections", label: "Collections" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hidden rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/studio" className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition-transform hover:scale-105">
            Get a prompt
          </Link>
        </nav>
      </motion.header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10 text-center text-sm text-muted-foreground">
      <span className="font-display text-lg italic text-foreground">PromptLens</span> — no signup, no comments, just prompts.
    </footer>
  );
}
