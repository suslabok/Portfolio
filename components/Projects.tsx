"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ExternalLink, FolderGit2, ArrowUpRight, X, Terminal } from "lucide-react";
import { Container, TagLabel, MarkerHighlight } from "@/components/UI";
import { Reveal } from "@/components/Animations";
import { useReducedMotion } from "@/lib/hooks";
import { cn, getInitials } from "@/lib/utils";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/data";
import { fadeUp, tokenReveal, easeOutExpo, easeOutQuart } from "@/lib/motion";

interface ProjectRowProps {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}

/** Per-row accent colour pairs for glow + bar */
const ACCENTS: [string, string][] = [
  ["var(--color-accent-violet)", "var(--color-accent-pink)"],
  ["var(--color-accent-cyan)",   "var(--color-accent-amber)"],
  ["var(--color-accent-pink)",   "var(--color-accent-violet)"],
  ["var(--color-accent-amber)",  "var(--color-accent-cyan)"],
  ["var(--color-accent-violet)", "var(--color-accent-amber)"],
];

/** Full-width row — image and content alternate sides on every other project. */
function ProjectRow({ project, index, onOpen }: ProjectRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(project.image) && !imageFailed;
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const reversed = index % 2 === 1;

  const [c1, c2] = ACCENTS[index % ACCENTS.length];

  // Precomputed color-mix tints so the row has a persistent color identity
  // at rest, not just when the mouse-tracked glow kicks in on hover.
  const borderTint = `color-mix(in srgb, ${c1} 30%, var(--color-border-strong))`;
  const pillBg = `color-mix(in srgb, ${c1} 8%, var(--color-bg))`;
  const pillBorder = `color-mix(in srgb, ${c1} 28%, var(--color-border))`;
  const pillText = `color-mix(in srgb, ${c1} 65%, var(--color-text-secondary))`;

  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { damping: 22, stiffness: 240 });
  const sy = useSpring(my, { damping: 22, stiffness: 240 });
  const glowBg = useMotionTemplate`radial-gradient(circle 420px at ${sx}px ${sy}px, color-mix(in srgb, ${c1} 18%, transparent) 0%, color-mix(in srgb, ${c2} 8%, transparent) 45%, transparent 68%)`;
  const sheen  = useMotionTemplate`radial-gradient(circle 220px at ${sx}px ${sy}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)`;

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }
  function onMouseLeave() {
    setHovered(false);
    mx.set(-600); my.set(-600);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ borderColor: borderTint }}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-bg-elevated shadow-[0_2px_12px_-4px_rgba(45,36,32,0.08)] transition-shadow hover:shadow-[0_10px_40px_-10px_rgba(45,36,32,0.16)] md:flex-row",
        reversed && "md:flex-row-reverse"
      )}
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(project); } }}
    >
      {/* Persistent top accent bar — always visible, brightens on hover */}
      <motion.div
        aria-hidden="true"
        className="absolute top-0 left-0 z-30 h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
        animate={{ opacity: hovered ? 1 : 0.65 }}
        transition={{ duration: 0.3 }}
      />

      {/* Mouse-tracked glow */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{ backgroundImage: glowBg }} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 mix-blend-screen" style={{ backgroundImage: sheen }} />

      {/* Image zone */}
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-bg-elevated-2 sm:h-72 md:h-auto md:w-[46%]">
        {showImage ? (
          <>
            <Image
              src={project.image as string}
              alt={`${project.title} cover`}
              fill
              sizes="(min-width: 768px) 46vw, 100vw"
              className={cn("object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", hovered && "scale-[1.06]")}
              onError={() => setImageFailed(true)}
            />
            {/* Scanline overlay on hover */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(45,36,32,0.04) 3px, rgba(45,36,32,0.04) 4px)",
              }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${c1} 10%, var(--color-bg-elevated-2))` }}>
            <span className="font-mono text-6xl font-bold select-none" style={{ color: `color-mix(in srgb, ${c1} 35%, transparent)` }} aria-hidden="true">
              {getInitials(project.title)}
            </span>
          </div>
        )}

        {/* Index chip, top-left of image — colored, always visible */}
        <span
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold text-white shadow-sm"
          style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Hover: "View" pill bottom-right */}
        <motion.div
          className="absolute bottom-3 right-3 z-20"
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
          transition={{ duration: 0.22 }}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-bg/90 px-2.5 py-1 text-[10px] font-semibold text-text-primary backdrop-blur-sm shadow-sm">
            View
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-1 flex-col justify-center gap-3 overflow-hidden p-6 sm:p-8 md:p-10">
        {/* Giant ghost index number — tinted with the row's accent color */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-3 select-none font-mono text-7xl font-bold sm:text-8xl",
            reversed ? "right-5 sm:right-7" : "left-5 sm:left-7"
          )}
          style={{ color: `color-mix(in srgb, ${c1} 14%, transparent)` }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <p
          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: pillText }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c1 }} aria-hidden="true" />
          {project.tagline}
        </p>

        <h3 className="text-2xl font-bold leading-snug text-text-primary transition-colors duration-200 sm:text-3xl" style={{ ["--hover-color" as string]: c1 }}>
          <span className="transition-colors duration-200 group-hover:text-[var(--hover-color)]">{project.title}</span>
        </h3>

        <p className="max-w-xl text-[14px] leading-relaxed text-text-secondary">{project.description}</p>

        {/* Tech pills — tinted with the row's accent color */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {project.tech.slice(0, 6).map((t) => (
            <span
              key={t}
              className="rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium"
              style={{ backgroundColor: pillBg, borderColor: pillBorder, color: pillText }}
            >
              {t}
            </span>
          ))}
          {project.tech.length > 6 && (
            <span
              className="rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium"
              style={{ backgroundColor: pillBg, borderColor: pillBorder, color: pillText }}
            >
              +{project.tech.length - 6}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-1 flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(project); }}
            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold text-text-primary transition-all"
            style={{ borderColor: pillBorder }}
          >
            Details
          </button>
          {project.repoUrl && (
            <Link
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-[11px] font-medium text-text-muted transition-all hover:border-accent-cyan/50 hover:text-accent-cyan"
            >
              <FolderGit2 className="h-3 w-3" />
              Code
            </Link>
          )}
          {project.liveUrl && (
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-aurora px-3.5 py-1.5 text-[11px] font-semibold text-white"
            >
              <ExternalLink className="h-3 w-3" />
              Live
            </Link>
          )}
        </div>
      </div>

      {/* Animated bottom accent bar — fills in on hover */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
        initial={{ scaleX: 0, originX: "left" }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/** Types out a couple of fake terminal lines, then calls onComplete. Respects prefers-reduced-motion. */
function TerminalBoot({ project, onComplete }: { project: Project; onComplete: () => void }) {
  const reducedMotion = useReducedMotion();

  const lines = useMemo(
    () => [
      { prefix: "$", prefixColor: "text-accent-pink", text: `open ./projects/${project.slug}` },
      { prefix: ">", prefixColor: "text-accent-cyan", text: `access granted — rendering ${project.title}` },
    ],
    [project.slug, project.title]
  );

  const fullText = useMemo(() => lines.map((l) => `${l.prefix} ${l.text}`).join("\n"), [lines]);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    setTyped(0);
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= fullText.length) {
        window.clearInterval(interval);
        window.setTimeout(onComplete, 380);
      }
    }, 15);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText, reducedMotion]);

  if (reducedMotion) return null;

  let offset = 0;

  return (
    <motion.div
      key="terminal-boot"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex min-h-[7.5rem] flex-col justify-center gap-1.5 rounded-xl border border-border bg-bg-elevated-2/70 px-4 py-3 font-mono text-[12px] text-text-secondary sm:min-h-[8.5rem]"
    >
      {lines.map((line, li) => {
        const full = `${line.prefix} ${line.text}`;
        const start = offset;
        offset += full.length + 1; // account for the joining "\n"
        const visible = Math.max(0, Math.min(full.length, typed - start));
        if (visible <= 0) return <p key={li} className="h-4" aria-hidden="true" />;
        const shown = full.slice(0, visible);
        return (
          <p key={li} className="whitespace-pre">
            <span className={line.prefixColor}>{shown.slice(0, 1)}</span>
            {shown.slice(1)}
          </p>
        );
      })}
      <span
        aria-hidden="true"
        className="inline-block h-3 w-[6px] animate-pulse bg-text-primary/50"
      />
      <span className="sr-only">Loading {project.title} details…</span>
    </motion.div>
  );
}

function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [booted, setBooted] = useState(false);

  // Reset the boot sequence whenever a (new) project opens.
  useEffect(() => {
    setBooted(false);
  }, [project?.slug]);

  useEffect(() => {
    if (!project) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: easeOutQuart }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-bg/85 p-4 backdrop-blur-md sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl"
          >
            {/* Image header */}
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-t-3xl">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={`${project.title} project cover`}
                  fill
                  sizes="(min-width: 1024px) 672px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg-elevated-2">
                  <span className="font-mono text-6xl font-bold select-none text-text-primary/10" aria-hidden="true">
                    {getInitials(project.title)}
                  </span>
                </div>
              )}
              {/* gradient to blend into body */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-elevated to-transparent" />

              {/* Close button — positioned over image */}
              <button
  type="button"
  onClick={onClose}
  aria-label="Close project details"
  data-cursor-label="CLOSE"
  className="glass absolute right-4 top-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-strong backdrop-blur-sm transition-colors hover:text-accent-violet"
>
  <X className="h-4 w-4" aria-hidden="true" />
</button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {!booted ? (
                  <TerminalBoot project={project} onComplete={() => setBooted(true)} />
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: easeOutExpo }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{project.tagline}</p>
                      <h3 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">{project.title}</h3>
                    </div>

                    <p className="text-body-lg max-w-2xl text-text-secondary">{project.description}</p>

                    {/* Tech — terminal block */}
                    <div className="flex items-start gap-2 rounded-xl border border-border bg-bg-elevated-2/70 px-4 py-3">
                      <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-cyan" aria-hidden="true" />
                      <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-text-muted">
                        <span className="text-accent-pink">$</span>
                        <span className="text-accent-cyan">stack</span>
                        {project.tech.map((t) => (
                          <span key={t} className="text-text-secondary">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {project.repoUrl && (
                        <Link
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-label="CODE"
                          className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-elevated px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
                        >
                          <FolderGit2 className="h-4 w-4" aria-hidden="true" />
                          View Code
                        </Link>
                      )}

                      {project.liveUrl && (
                        <Link
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-label="LIVE"
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-aurora px-5 py-2.5 text-sm font-medium text-white transition-shadow hover:shadow-[0_0_44px_-8px_var(--color-accent-pink)]"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          Live Demo
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <section id="projects" className="relative overflow-hidden py-20 sm:py-28">
      {/* Ambient blobs — very faint */}
      <motion.div
        aria-hidden="true"
        className="hero-blob absolute -left-20 top-24 h-64 w-64 opacity-[0.07] sm:h-80 sm:w-80"
        style={{ background: "var(--color-accent-pink)" }}
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 18, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="hero-blob-2 absolute right-[-5%] bottom-20 h-56 w-56 opacity-[0.06] sm:h-72 sm:w-72"
        style={{ background: "var(--color-accent-amber)" }}
        animate={{ x: [0, -18, 14, 0], y: [0, 16, -12, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <Container className="flex flex-col gap-12 sm:gap-16">
        {/* ── Section header ── */}
        <Reveal className="flex flex-col gap-3">
          <motion.div variants={fadeUp}>
            <TagLabel>projects</TagLabel>
          </motion.div>
            <motion.h2
            variants={tokenReveal}
            className="inline-block w-fit -mt-2 text-6xl md:text-7xl leading-none"
          >
            <MarkerHighlight>Things I&apos;ve <span className="scribble-underline">built</span> with</MarkerHighlight>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[15px] leading-relaxed text-text-secondary">
            From AI-powered platforms to 3D simulators click any card to read the full story.
          </motion.p>
        </Reveal>

        {/* ── Alternating vertical list ── */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {projects.map((project, i) => (
            <ProjectRow
              key={project.slug}
              project={project}
              index={i}
              onOpen={setActiveProject}
            />
          ))}
        </div>

      </Container>

      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}