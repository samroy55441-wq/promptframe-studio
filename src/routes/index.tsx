import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { ArrowRight, MessageCircleOff, Upload, Wand2, Copy, FolderHeart, Zap, Lock, Infinity as Inf } from "lucide-react";
import { LIBRARY } from "@/lib/library";
import { PromptCard } from "@/components/site/PromptCard";
import { Studio } from "@/components/site/Studio";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptLens — Upload any image or video, get the exact AI prompt" },
      { name: "description", content: "Turn any image or video into the exact AI prompt that recreates it. Free prompt library and personal collections. No signup." },
      { property: "og:title", content: "PromptLens — Get the exact prompt for any image" },
      { property: "og:description", content: "No more commenting on Instagram for prompts. Upload, get the prompt, save it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ease = [0.22, 1, 0.36, 1] as const;

function Words({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: delay + i * 0.06, ease }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Eyebrow({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
      <span className="text-primary">{n}</span><span className="h-px w-10 bg-border" />{children}
    </motion.p>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`relative flex min-h-screen flex-col justify-center px-6 py-28 ${className}`}><div className="mx-auto w-full max-w-6xl">{children}</div></section>;
}

/* 01 — Hero */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const op = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return (
    <section ref={ref} className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28">
      <div className="bg-glow pointer-events-none absolute inset-0" />
      <motion.div style={{ y, opacity: op }} className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" /> Free · No signup · Images & video
          </motion.span>
          <h1 className="font-display text-6xl leading-[0.95] sm:text-8xl">
            <Words text="See it." delay={0.3} />
            <br />
            <Words text="Get the prompt." className="italic text-gradient" delay={0.5} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="mt-8 max-w-md text-lg text-muted-foreground">
            Upload any image or video and get the exact AI prompt behind it — in seconds.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.8 }} className="mt-10 flex flex-wrap gap-3">
            <Link to="/studio" className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105">
              Upload & get prompt <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/library" className="inline-flex items-center rounded-full border border-border px-7 py-4 transition-colors hover:border-foreground">Browse library</Link>
          </motion.div>
        </div>
        <div className="relative hidden h-[560px] lg:block">
          {LIBRARY.slice(0, 3).map((it, i) => (
            <motion.img
              key={it.id}
              src={it.image}
              alt={it.title}
              width={768}
              height={1024}
              initial={{ opacity: 0, y: 80, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: [-8, 4, -2][i] ?? 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 1.1, ease }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              className="absolute w-60 rounded-3xl border border-border object-cover shadow-2xl"
              style={{ left: ["0%", "35%", "15%"][i], top: ["5%", "15%", "42%"][i] }}
            />
          ))}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, type: "spring" }} className="absolute bottom-6 right-0 max-w-[240px] rounded-2xl border border-border bg-card/90 p-4 font-mono text-[11px] leading-relaxed backdrop-blur">
            <span className="text-primary">› prompt</span> cinematic portrait, neon alley, 35mm, shallow depth of field…
          </motion.div>
        </div>
      </motion.div>
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">scroll ↓</motion.div>
    </section>
  );
}

/* 02 — Problem */
function Problem() {
  const comments = ["“prompt pls 🙏”", "“PROMPT??”", "“comment ‘AI’ for the prompt”", "“dm me the prompt”", "“follow + comment to get it”"];
  return (
    <Section>
      <Eyebrow n="02">The problem</Eyebrow>
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <h2 className="font-display text-5xl leading-tight sm:text-7xl"><Words text="Stop begging in the comments." /></h2>
        <div className="relative space-y-3">
          {comments.map((c, i) => (
            <motion.div key={c} initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7, ease }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4" style={{ marginLeft: `${(i % 3) * 24}px` }}>
              <span className="size-8 rounded-full bg-muted" />
              <span className="text-muted-foreground line-through decoration-accent decoration-2">{c}</span>
            </motion.div>
          ))}
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, type: "spring" }} className="absolute -right-2 -top-6 rounded-full bg-accent p-4 text-accent-foreground">
            <MessageCircleOff className="size-6" />
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* 03 — How it works */
function HowItWorks() {
  const steps = [
    { icon: Upload, t: "Upload", d: "Drop any image or short video." },
    { icon: Wand2, t: "Analyze", d: "AI reads subject, light, lens, style and mood." },
    { icon: Copy, t: "Copy", d: "Get the exact prompt — ready for any AI tool." },
  ];
  return (
    <Section>
      <Eyebrow n="03">How it works</Eyebrow>
      <h2 className="mb-16 font-display text-5xl sm:text-7xl"><Words text="Three steps." /> <Words text="Zero waiting." className="italic text-muted-foreground" delay={0.2} /></h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div key={s.t} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.8, ease }} whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8">
            <span className="absolute -right-4 -top-8 font-display text-[10rem] italic leading-none text-muted transition-colors group-hover:text-primary/20">{i + 1}</span>
            <s.icon className="relative mb-16 size-8 text-primary" />
            <h3 className="relative font-display text-4xl italic">{s.t}</h3>
            <p className="relative mt-2 text-muted-foreground">{s.d}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* 04 — Studio */
function StudioSection() {
  return (
    <Section>
      <Eyebrow n="04">Try it now</Eyebrow>
      <h2 className="mb-12 font-display text-5xl sm:text-7xl"><Words text="Drop it right here." /></h2>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }}><Studio /></motion.div>
    </Section>
  );
}

/* 05 — Library horizontal scroll */
function LibraryScroll() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-55%"]);
  return (
    <section ref={ref} className="relative h-[250vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-6xl px-6">
          <Eyebrow n="05">The library</Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-5xl sm:text-7xl">Steal these <span className="italic text-gradient">prompts.</span></h2>
            <Link to="/library" className="inline-flex items-center gap-2 border-b border-foreground pb-1">See all <ArrowRight className="size-4" /></Link>
          </div>
        </div>
        <HScroll x={x} />
      </div>
    </section>
  );
}
function HScroll({ x }: { x: MotionValue<string> }) {
  return (
    <motion.div style={{ x }} className="flex gap-6 pl-6">
      {[...LIBRARY, ...LIBRARY].map((it, i) => (
        <div key={i} className="w-[300px] shrink-0"><PromptCard item={{ ...it }} index={i} /></div>
      ))}
    </motion.div>
  );
}

/* 06 — Collections */
function CollectionsSection() {
  return (
    <Section>
      <Eyebrow n="06">Your collections</Eyebrow>
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-5xl leading-tight sm:text-7xl"><Words text="Save. Sort." /><br /><Words text="Reuse forever." className="italic" delay={0.2} /></h2>
          <p className="mt-6 max-w-md text-muted-foreground">Create your own collections — moodboards, client styles, favorites. Saved right in your browser. No account, ever.</p>
          <Link to="/collections" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Open collections <FolderHeart className="size-4" /></Link>
        </div>
        <div className="relative h-[420px]">
          {["Cinematic", "Product shots", "Cute 3D"].map((n, i) => (
            <motion.div key={n} initial={{ opacity: 0, y: 60, rotate: 0 }} whileInView={{ opacity: 1, y: 0, rotate: (i - 1) * 6 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.9, ease }}
              className="absolute left-1/2 top-1/2 w-64 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-4 shadow-2xl" style={{ marginLeft: (i - 1) * 90, marginTop: (i - 1) * 20 }}>
              <div className="grid grid-cols-2 gap-2">
                {LIBRARY.slice(0, 4).map((it, j) => <img key={j} src={LIBRARY[(i + j) % 4]?.image} alt="" loading="lazy" className="aspect-square rounded-xl object-cover" />)}
              </div>
              <p className="mt-3 font-display text-2xl italic">{n}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* 07 — Features + marquee */
function Features() {
  const f = [
    { icon: Zap, t: "Seconds, not days", d: "No waiting for a creator to reply." },
    { icon: Lock, t: "No signup", d: "Open it and use it. That's it." },
    { icon: Inf, t: "Images & video", d: "We read multiple frames of your clip." },
  ];
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden py-28">
      <div className="mb-20 flex whitespace-nowrap font-display text-7xl italic sm:text-9xl">
        <div className="animate-marquee flex gap-12 pr-12">
          {Array.from({ length: 2 }).flatMap((_, k) => ["Midjourney", "✦", "DALL·E", "✦", "Flux", "✦", "Stable Diffusion", "✦", "Sora", "✦"].map((w, i) => <span key={`${k}-${i}`} className={w === "✦" ? "text-primary" : "text-muted-foreground/40"}>{w}</span>))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-6">
        <Eyebrow n="07">Why PromptLens</Eyebrow>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
          {f.map((x, i) => (
            <motion.div key={x.t} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-background p-10 transition-colors hover:bg-card">
              <x.icon className="mb-10 size-7 text-accent" />
              <h3 className="font-display text-3xl italic">{x.t}</h3>
              <p className="mt-2 text-muted-foreground">{x.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 08 — FAQ + CTA */
function FaqCta() {
  const faq = [
    ["Is it really free with no signup?", "Yes. Upload, get your prompt, save it to collections — all without an account."],
    ["Where are my collections stored?", "Right in your browser on this device. Clearing browser data removes them."],
    ["Which AI tools do the prompts work with?", "Midjourney, DALL·E, Flux, Stable Diffusion, Leonardo and most video generators."],
    ["Can I upload videos?", "Yes — we sample several frames and describe the whole scene, motion and style."],
  ];
  return (
    <Section>
      <Eyebrow n="08">Questions</Eyebrow>
      <div className="grid gap-16 lg:grid-cols-2">
        <Accordion type="single" collapsible className="w-full">
          {faq.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left text-lg">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }} className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground">
          <h2 className="font-display text-6xl italic leading-none">Your next prompt is one upload away.</h2>
          <Link to="/studio" className="mt-10 inline-flex items-center gap-2 rounded-full bg-background px-7 py-4 font-semibold text-foreground transition-transform hover:scale-105">Start now <ArrowRight className="size-4" /></Link>
        </motion.div>
      </div>
    </Section>
  );
}

function Index() {
  return (
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <StudioSection />
      <LibraryScroll />
      <CollectionsSection />
      <Features />
      <FaqCta />
    </main>
  );
}
