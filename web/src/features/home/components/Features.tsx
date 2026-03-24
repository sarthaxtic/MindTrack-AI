"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import { FEATURES } from "@/constants/home";

// ─── Animation variants ────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

// ─── Feature Card ──────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
  index: number;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  tag,
  index,
}: FeatureCardProps) {
  const isPrimary = index === 0;

  return (
    <motion.div
      variants={cardVariant}
      className={clsx(
        "group relative rounded-[var(--radius-lg)] p-6 border transition-all duration-300",
        "hover:border-[var(--border-active)] hover:shadow-[var(--shadow-glow)]",
        isPrimary
          ? "bg-[var(--accent-dim)] border-[var(--border-active)]"
          : "bg-[var(--surface)] border-[var(--border)]"
      )}
    >
      {/* Subtle hover glow */}
      <div
        className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100
                   transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 space-y-4">
        {/* Icon + badge */}
        <div className="flex items-start justify-between">
          <div
            className={clsx(
              "size-10 rounded-[var(--radius-md)] flex items-center justify-center",
              isPrimary
                ? "bg-[var(--accent)] text-[#080c10] shadow-[0_0_16px_var(--accent-glow)]"
                : "bg-[var(--surface-raised)] text-[var(--accent)] border border-[var(--border)]"
            )}
          >
            <Icon size={18} />
          </div>
          <Badge variant={isPrimary ? "accent" : "default"}>{tag}</Badge>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="font-semibold text-[var(--text)] tracking-[-0.01em]">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                 bg-[var(--surface)] border border-[var(--border)]
                 text-[11px] font-medium tracking-widest uppercase text-[var(--text-secondary)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────
export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-24 space-y-12 scroll-mt-16"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="space-y-4 text-center"
      >
        <SectionLabel>Features</SectionLabel>
        <h2
          className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-[-0.03em]
                     text-[var(--text)] max-w-xl mx-auto leading-tight"
        >
          Everything you need to understand what people are feeling.
        </h2>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-sm md:text-base">
          A complete toolkit for mental health signal detection — accurate,
          explainable, and built with privacy at its core.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} index={i} />
        ))}
      </motion.div>
    </section>
  );
}