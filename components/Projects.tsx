"use client";

import { useEffect, useRef, useState } from "react";
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
import { cn, getInitials } from "@/lib/utils";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/data";
import { fadeUp, tokenReveal, easeOutExpo, easeOutQuart } from "@/lib/motion";

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: "hero" | "tall" | "standard";
  onOpen: (project: Project) => void;
}

/** Per-card accent colour pairs for glow + bar */
const ACCENTS: [string, string][] = [
  ["var(--color-accent-violet)", "var(--color-accent-pink)"],
  ["var(--color-accent-cyan)",   "var(--color-accent-amber)"],
  ["var(--color-accent-pink)",   "var(--color-accent-violet)"],
  ["var(--color-accent-amber)",  "var(--color-accent-cyan)"],
  ["var(--color-accent-violet)", "var(--color-accent-amber)"],
];

function ProjectCard({ project, index, variant = "standard", onOpen }: ProjectCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(project.image) && !imageFailed;
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [c1, c2] = ACCENTS[index % ACCENTS.length];

  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { damping: 22, stiffness: 240 });
  const sy = useSpring(my, { damping: 22, stiffness: 240 });
  const glowBg  = useMotionTemplate`radial-gradient(circle 300px at ${sx}px ${sy}px, color-mix(in srgb, ${c1} 22%, transparent) 0%, color-mix(in srgb, ${c2} 10%, transparent) 45%, transparent 68%)`;
  const sheen   = useMotionTemplate`radial-gradient(circle 180px at ${sx}px ${sy}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 40%, transparent 65%)`;

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

  const imgHeight = variant === "hero" ? "h-56 sm:h-64" : variant === "tall" ? "h-44 sm:h-52" : "h-36 sm:h-40";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated shadow-[0_2px_12px_-4px_rgba(45,36,32,0.08)] transition-shadow hover:shadow-[0_8px_32px_-8px_rgba(45,36,32,0.14)]"
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(project); } }}
    >
      {/* Mouse-tracked glow */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-2xl" style={{ backgroundImage: glowBg }} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-2xl mix-blend-screen" style={{ backgroundImage: sheen }} />

      {/* Image zone */}
      <div className={cn("relative w-full overflow-hidden bg-bg-elevated-2", imgHeight)}>
        {showImage ? (
          <>
            <Image
              src={project.image as string}
              alt={`${project.title} cover`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
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
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-elevated to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-5xl font-bold text-text-primary/8 select-none" aria-hidden="true">
              {getInitials(project.title)}
            </span>
          </div>
        )}

        {/* Top row: index + category chip */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
          <span className="rounded-md bg-bg/85 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.12em] text-text-muted backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

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
      <div className="relative z-20 flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">{project.tagline}</p>

        <h3 className={cn(
          "font-bold leading-snug text-text-primary transition-colors duration-200 group-hover:text-accent-violet",
          variant === "hero" ? "text-xl sm:text-2xl" : "text-lg"
        )}>
          {project.title}
        </h3>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-text-secondary">{project.description}</p>

        {/* Tech pills */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-[10px] text-text-muted">
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-[10px] text-text-muted">
              +{project.tech.length - 4}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(project); }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-bg px-3.5 py-1.5 text-[11px] font-semibold text-text-primary transition-all hover:border-accent-violet/50 hover:text-accent-violet"
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

      {/* Animated bottom accent bar */}
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

function ProjectModal({ project, onClose }: ProjectModalProps) {
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.4, ease: easeOutExpo }}
              className="flex flex-col gap-5 p-6 sm:p-8"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Projects() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // projects[0] = hero (left 2/3), projects[1] = tall (right 1/3)
  // projects[2..4] = bottom row of 3
  const hero    = projects[0];
  const side    = projects[1];
  const bottom  = projects.slice(2);

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
            className="inline-block w-fit -mt-1 text-5xl md:text-6xl leading-none"
          >
            <MarkerHighlight>Things I&apos;ve <span className="shimmer-text">built</span></MarkerHighlight>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[15px] leading-relaxed text-text-secondary">
            From AI-powered platforms to 3D simulators click any card to read the full story.
          </motion.p>
        </Reveal>

        {/* ── Bento grid ── */}
        <div className="flex flex-col gap-4">

          {/* Row 1: hero (2/3) + side (1/3) asymmetric */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Hero card — spans 2 columns */}
            <div className="lg:col-span-2">
              {hero && (
                <ProjectCard
                  project={hero}
                  index={0}
                  variant="hero"
                  onOpen={setActiveProject}
                />
              )}
            </div>
            {/* Side tall card — 1 column */}
            <div className="lg:col-span-1">
              {side && (
                <ProjectCard
                  project={side}
                  index={1}
                  variant="tall"
                  onOpen={setActiveProject}
                />
              )}
            </div>
          </div>

          {/* Row 2: three equal cards */}
          {bottom.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bottom.map((project, i) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  index={i + 2}
                  variant="standard"
                  onOpen={setActiveProject}
                />
              ))}
            </div>
          )}
        </div>

      </Container>

      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}
