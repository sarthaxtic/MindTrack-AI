"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { HOW_IT_WORKS_STEPS } from "@/constants/home";

// ─── Step card ────────────────────────────────────────────────────────────────
interface StepCardProps {
  step: string;
  title: string;
  description: string;
  index: number;
  total: number;
}

function StepCard({ step, title, description, index, total }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center gap-5 flex-1">
      {/* Connector line between steps */}
      {index < total - 1 && (
        <div
          className="hidden md:block absolute top-6 h-px border-t border-dashed border-[var(--border)]"
          style={{ left: "calc(50% + 2rem)", right: "calc(-50% + 2rem)" }}
          aria-hidden
        />
      )}

      {/* Step number bubble */}
      <div
        className="relative z-10 size-12 rounded-full flex items-center justify-center
                   bg-[var(--surface)] border border-[var(--border-active)]
                   shadow-[0_0_20px_var(--accent-glow)]"
      >
        <span
          className="text-sm font-bold text-[var(--accent)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {step}
        </span>
      </div>

      {/* Text */}
      <div className="space-y-2 px-2">
        <h3 className="font-semibold text-[var(--text)] tracking-[-0.01em]">
          {title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[18rem]">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Terminal mockup ──────────────────────────────────────────────────────────
function TerminalPreview() {
  const lines: { label: string; value: string; color: string }[] = [
    { label: "post",       value: '"Feeling disconnected lately..."', color: "#10b981" },
    { label: "language",   value: '"en"',                             color: "#f59e0b" },
    { label: "label",      value: '"depression"',                     color: "#ef4444" },
    { label: "confidence", value: "0.91",                             color: "var(--accent)" },
    { label: "severity",   value: '"moderate"',                       color: "#f59e0b" },
  ];

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border)]
                 bg-[var(--bg-secondary)] overflow-hidden shadow-[var(--shadow-md)]"
    >
      {/* Window bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border)]">
        {(["#ef4444", "#f59e0b", "#10b981"] as const).map((c) => (
          <span
            key={c}
            className="size-2.5 rounded-full"
            style={{ background: c }}
          />
        ))}
        <span
          className="ml-2 text-[11px] text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          analysis-result.json
        </span>
      </div>

      {/* Code body */}
      <div
        className="p-5 text-sm space-y-1"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span className="text-[var(--text-muted)]">{"{"}</span>
        {lines.map(({ label, value, color }) => (
          <div key={label} className="pl-4">
            <span className="text-[var(--text-secondary)]">
              {"\""}{label}{"\""}
            </span>
            <span className="text-[var(--text-muted)]">: </span>
            <span style={{ color }}>{value}</span>
            <span className="text-[var(--text-muted)]">,</span>
          </div>
        ))}
        <span className="text-[var(--text-muted)]">{"}"}</span>
      </div>
    </div>
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
export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-24 space-y-16 scroll-mt-16"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <SectionLabel>How it works</SectionLabel>
        <h2
          className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-[-0.03em]
                     text-[var(--text)] leading-tight"
        >
          From post to insight in three steps.
        </h2>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-0 justify-between"
      >
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <StepCard
            key={step.step}
            {...step}
            index={i}
            total={HOW_IT_WORKS_STEPS.length}
          />
        ))}
      </motion.div>

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="max-w-md mx-auto"
      >
        <TerminalPreview />
      </motion.div>
    </section>
  );
}