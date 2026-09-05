"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Container, TagLabel, MarkerHighlight } from "@/components/UI";
import { Reveal } from "@/components/Animations";
import { education } from "@/lib/data";
import { fadeUp, tokenReveal } from "@/lib/motion";

const ENTRY_META = [
  {
    emoji: "🎓",
    accent: "#8a5a52",
    accentSoft: "rgba(138,90,82,0.14)",
    badge: "Current",
    detail: "Computer Engineering",
    location: "Dhulikhel, Nepal",
  },
  {
    emoji: "📚",
    accent: "#6b3d36",
    accentSoft: "rgba(107,61,54,0.14)",
    badge: "Completed",
    detail: "Science (+2 - Physics, Maths, Biology)",
    location: "Kathmandu, Nepal",
  },
];

function EducationCard({
  entry,
  meta,
  index,
}: {
  entry: (typeof education)[0];
  meta: (typeof ENTRY_META)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLeft = index % 2 === 0;

  return (
    <div className={`relative flex w-full ${isLeft ? "justify-start" : "justify-end"}`}>
      {/* Connecting node on the centre spine */}
      <div className="absolute left-1/2 top-10 -translate-x-1/2 z-20 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ type: "spring", stiffness: 420, damping: 22, delay: index * 0.15 }}
          className="journey-node relative h-10 w-10 rounded-full flex items-center justify-center text-lg shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${meta.accent}, #b98d76)`,
            boxShadow: `0 0 20px 4px ${meta.accentSoft}`,
          }}
        >
          {meta.emoji}
          {/* Pulse ring */}
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: index * 0.4 }}
            className="absolute inset-0 rounded-full"
            style={{ background: meta.accent }}
          />
        </motion.div>
      </div>

      {/* Card — left or right half */}
      <motion.div
        ref={cardRef}
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -6, rotate: isLeft ? -0.6 : 0.6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="journey-card group relative w-[calc(50%-3rem)] overflow-hidden rounded-3xl border-2 border-border-strong bg-bg-elevated p-6 sm:p-8"
        style={{ boxShadow: hovered ? `0 16px 48px -12px ${meta.accentSoft}, 0 0 0 1.5px ${meta.accent}` : undefined }}
      >
        {/* Coloured top bar */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1 rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, ${meta.accent}, #b98d76)` }}
          initial={{ scaleX: 0, originX: "left" }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Tape decoration */}
        <div
          aria-hidden="true"
          className="tape"
          style={{
            top: "-10px",
            left: isLeft ? "auto" : "22px",
            right: isLeft ? "22px" : "auto",
            transform: `rotate(${isLeft ? "6deg" : "-7deg"})`,
          }}
        />

        {/* Badge + Period */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: meta.accentSoft, color: meta.accent }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.accent }} />
            {meta.badge}
          </span>
          <span className="font-mono text-[11px] text-text-muted">{entry.period}</span>
        </div>

        {/* Degree */}
        <h3 className="text-lg font-bold leading-snug text-text-primary mb-1">
          <span className="marker-highlight inline-block px-0.5">{entry.degree}</span>
        </h3>

        {/* Institution + location */}
        <p className="text-sm text-text-secondary font-medium">{entry.institution}</p>
        <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
          <span>📍</span>{meta.location}
        </p>

        {/* Detail line */}
        <p className="mt-2 text-[12px] text-text-muted italic">{meta.detail}</p>

        {/* Highlights grid */}
        <div className="mt-4 flex flex-wrap gap-1.5">
        
        </div>

        {/* GPA highlight */}
        {entry.gpa && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 360, damping: 22 }}
            className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-bg-elevated"
            style={{ background: "linear-gradient(135deg, #8a5a52, #6b3d36)" }}
          >
            <span className="text-white font-bold text-sm leading-none">{entry.gpa}</span>
            <span className="text-white text-[9px] opacity-80">GPA</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function Journey() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.85", "end 0.6"],
  });
  const lineScale = useSpring(scrollYProgress, { damping: 28, stiffness: 90 });
  const lineGlow = useTransform(lineScale, [0, 1], [0.3, 1]);

  return (
    <section id="journey" className="relative overflow-hidden py-20 sm:py-28">
      {/* Background decorative elements */}
      <motion.div
        aria-hidden="true"
        className="absolute -right-16 top-24 h-72 w-72 rounded-full opacity-[0.07] blur-[110px]"
        style={{ background: "#8a5a52" }}
        animate={{ x: [0, -18, 12, 0], y: [0, 14, -10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute left-[-10%] bottom-20 h-60 w-60 rounded-full opacity-[0.08] blur-[90px]"
        style={{ background: "#6b3d36" }}
        animate={{ x: [0, 22, -14, 0], y: [0, -16, 18, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <Container className="flex flex-col gap-12">
        <Reveal className="flex flex-col gap-4">
          <motion.div variants={fadeUp}>
            <TagLabel>journey</TagLabel>
          </motion.div>
          <motion.h2
            variants={tokenReveal}
            className="inline-block w-fit -mt-2 text-6xl md:text-7xl leading-none"
          >
            <MarkerHighlight>Where It <span className="shimmer-text">Started</span></MarkerHighlight>
          </motion.h2>
        </Reveal>

        {/* ── Timeline ── */}
        <div ref={timelineRef} className="relative hidden sm:block">
          {/* Centre spine */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border" />
          {/* Animated progress fill */}
          <motion.div
            style={{
              scaleY: lineScale,
              opacity: lineGlow,
              background: "linear-gradient(180deg, #8a5a52, #6b3d36)",
            }}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 origin-top"
          />

          <div className="flex flex-col gap-16 pb-8 pt-4">
            {education.map((entry, index) => (
              <EducationCard
                key={entry.institution}
                entry={entry}
                meta={ENTRY_META[index] ?? ENTRY_META[0]}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* ── Mobile stacked cards ── */}
        <div className="flex flex-col gap-6 sm:hidden">
          {education.map((entry, index) => {
            const meta = ENTRY_META[index] ?? ENTRY_META[0];
            return (
              <motion.div
                key={entry.institution}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-30px" }}
                className="relative overflow-hidden rounded-2xl border-2 border-border-strong bg-bg-elevated p-5"
              >
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${meta.accent}, #b98d76)` }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{ background: `linear-gradient(135deg, ${meta.accent}, #b98d76)` }}>
                    {meta.emoji}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-text-muted">{entry.period}</span>
                    <p className="text-sm font-bold text-text-primary leading-snug">{entry.degree}</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{entry.institution}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
          
                </div>
                {entry.gpa && (
                  <p
                    className="mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                    style={{
                      borderColor: "rgba(138,90,82,0.4)",
                      backgroundColor: "rgba(138,90,82,0.1)",
                      color: "#8a5a52",
                    }}
                  >
                    ⭐ GPA {entry.gpa}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}