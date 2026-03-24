"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { STATS } from "@/constants/home";

// ─── Animation variants ────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

// ─── Live ticker badge ────────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <motion.div
      variants={fadeIn}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                 bg-[var(--surface)] border border-[var(--border)]
                 text-xs text-[var(--text-secondary)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span
        className="size-1.5 rounded-full bg-emerald-400 pulse-dot"
        aria-hidden
      />
      Model v2.4 — 94.2% accuracy on benchmark
    </motion.div>
  );
}

// ─── Animated background ──────────────────────────────────────────────────────
function GridBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-grid opacity-100" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[800px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 70%)",
        }}
      />
      {[38, 54, 70].map((pct) => (
        <div
          key={pct}
          className="absolute inset-x-0 h-px"
          style={{
            top: `${pct}%`,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(6,182,212,0.08) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-2"
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center gap-0.5">
          <span
            className="text-2xl font-bold tracking-tight text-[var(--text)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {stat.value}
          </span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative min-h-[92dvh] flex flex-col items-center justify-center text-center py-24 -mx-4 md:-mx-8 px-4 md:px-8">
      <GridBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-7 max-w-3xl"
      >
        <LiveBadge />

        <motion.h1
          variants={fadeUp}
          className="text-[clamp(2.4rem,6vw,4.5rem)] font-bold tracking-[-0.035em] leading-[1.05]
                     text-[var(--text)]"
        >
          Detect mental health{" "}
          <br className="hidden sm:block" />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)",
            }}
          >
            signals
          </span>{" "}
          in seconds.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed"
        >
          MindTrack AI analyzes social media posts using explainable AI —
          giving researchers, clinicians, and safety teams actionable insights
          they can actually trust.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            onClick={onStart}
            size="lg"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            Start analyzing
          </Button>
          <Button variant="secondary" size="lg">
            View demo
          </Button>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="w-px h-10 bg-[var(--border)]"
          aria-hidden
        />

        <StatsStrip />
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--text-muted)]"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronDown size={14} className="animate-bounce" />
      </motion.div>
    </section>
  );
}