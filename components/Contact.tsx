"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Mail, FolderGit2, ExternalLink } from "lucide-react";
import { Container, TagLabel, MarkerHighlight, CornerBrackets, Magnetic } from "@/components/UI";
import { personal } from "@/lib/data";
import { useTilt } from "@/lib/hooks";
import { fadeUp, staggerContainer, tokenReveal, viewportOnce } from "@/lib/motion";

/** Big email display that copies to clipboard on click, with a mailto fallback below. */
function EmailCTA() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the mailto link below still works.
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        onClick={handleCopy}
        data-cursor-label={copied ? "COPIED" : "COPY"}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group relative inline-flex flex-wrap items-center justify-center gap-3 text-center font-display text-2xl font-semibold text-text-primary transition-colors hover:text-accent-pink sm:text-4xl"
      >
        {personal.email}

        <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center sm:h-7 sm:w-7">
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="h-6 w-6 text-accent-cyan sm:h-7 sm:w-7" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center opacity-40 transition-opacity group-hover:opacity-100"
              >
                <Copy className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        {/* Little confetti burst on copy */}
        <AnimatePresence>
          {copied && (
            <>
              {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * 360;
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: Math.cos((angle * Math.PI) / 180) * 40,
                      y: Math.sin((angle * Math.PI) / 180) * 40,
                      scale: 0,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="pointer-events-none absolute right-0 top-1/2 h-1.5 w-1.5 rounded-full bg-accent-amber"
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.a
        href={`mailto:${personal.email}`}
        data-cursor-label="OPEN"
        whileHover={{ x: 3 }}
        className="tag-label inline-flex items-center gap-1.5 text-text-secondary transition-colors hover:text-accent-pink"
      >
        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
        or open in your mail app
      </motion.a>

      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}

const SOCIALS = [
  { label: "GitHub", href: personal.github, icon: FolderGit2, tint: "var(--color-accent-violet)" },
  { label: "LinkedIn", href: personal.linkedin, icon: ExternalLink, tint: "var(--color-accent-cyan)" },
] as const;

function SocialLinks() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {SOCIALS.map(({ label, href, icon: Icon, tint }, i) => (
        <Magnetic key={label} strength={0.4}>
          <motion.div
            initial={{ opacity: 0, y: 12, rotate: i % 2 === 0 ? -3 : 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ rotate: i % 2 === 0 ? -4 : 4, scale: 1.05 }}
            onHoverStart={() => setHovered(label)}
            onHoverEnd={() => setHovered((prev) => (prev === label ? null : prev))}
            className="relative"
          >

            {hovered === label && (
              <motion.span
                layoutId="social-hover-glow"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-full"
                style={{ boxShadow: `0 0 0 2px ${tint}, 0 0 28px -6px ${tint}` }}
              />
            )}

            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="OPEN"
              className="glass group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-text-primary transition-colors"
              style={{ ["--tint" as string]: tint }}
            >
              <Icon
                className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-8deg]"
                style={{ color: tint }}
                aria-hidden="true"
              />
              <span className="transition-colors group-hover:text-[var(--tint)]">{label}</span>
            </Link>
          </motion.div>
        </Magnetic>
      ))}
    </div>
  );
}

function FloatingDoodle({
  emoji,
  className,
  duration,
  delay = 0,
}: {
  emoji: string;
  className: string;
  duration: number;
  delay?: number;
}) {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ y: [0, -14, 0], rotate: [0, 6, 0, -6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none absolute hidden select-none text-3xl opacity-70 sm:block ${className}`}
    >
      {emoji}
    </motion.span>
  );
}

export function Contact() {
  const { rotateX, rotateY, handlers } = useTilt({ strength: 8, stiffness: 150 });

  return (
    <section id="contact" className="relative overflow-hidden py-32 sm:py-44">
      {/* Ambient glow, now drifting instead of static */}
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 40, 0, -40, 0], y: [0, -20, 0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-aurora opacity-10 blur-[160px]"
      />

      {/* Floating decorative doodles — same "charm" language as the skills box */}
      <FloatingDoodle emoji="✉️" className="left-[8%] top-[18%]" duration={7} />
      <FloatingDoodle emoji="📮" className="right-[10%] top-[65%]" duration={9} delay={1} />
      <FloatingDoodle emoji="✦" className="left-[14%] bottom-[12%]" duration={6} delay={0.4} />

      <Container className="relative">
        <motion.div
          {...handlers}
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="glass-elevated relative flex flex-col items-center gap-10 rounded-[2rem] px-6 py-16 text-center sm:px-16 sm:py-24"
        >
          <CornerBrackets className="opacity-70" />

          {/* Rotating "stamp" badge, like a wax seal in the corner */}
          <motion.div
            variants={fadeUp}
            animate={{ rotate: [0, -8, 0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="glass absolute -top-6 right-6 hidden h-16 w-16 rotate-6 items-center justify-center rounded-full text-2xl sm:flex"
          >
            👋
          </motion.div>

          <motion.div variants={fadeUp}>
            <TagLabel>contact</TagLabel>
          </motion.div>

          <motion.h2
            variants={tokenReveal}
            className="text-display-1 max-w-2xl text-balance"
          >
            Let&apos;s build{" "}
            <MarkerHighlight className="inline-block px-1">something</MarkerHighlight>{" "}
            together
          </motion.h2>

          <motion.p variants={fadeUp} className="text-body-lg max-w-md">
            Whether it&apos;s a project, an opportunity, or just to talk tech
            my inbox is open.
          </motion.p>

          <motion.div variants={fadeUp}>
            <EmailCTA />
          </motion.div>

          <motion.div variants={fadeUp}>
            <SocialLinks />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
