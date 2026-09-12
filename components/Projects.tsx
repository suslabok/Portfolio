"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type PanInfo,
} from "framer-motion";
import {
  ExternalLink,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  X,
  Terminal,
} from "lucide-react";
import { Container, TagLabel, MarkerHighlight } from "@/components/UI";
import { Reveal } from "@/components/Animations";
import { useReducedMotion } from "@/lib/hooks";
import { cn, getInitials } from "@/lib/utils";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/data";
import { fadeUp, tokenReveal, easeOutExpo, easeOutQuart } from "@/lib/motion";

/** Per-project accent colour pairs for glow + bar, keyed by index in `projects`. */
const ACCENTS: [string, string][] = [
  ["var(--color-accent-violet)", "var(--color-accent-pink)"],
  ["var(--color-accent-cyan)",   "var(--color-accent-amber)"],
  ["var(--color-accent-pink)",   "var(--color-accent-violet)"],
  ["var(--color-accent-amber)",  "var(--color-accent-cyan)"],
  ["var(--color-accent-violet)", "var(--color-accent-amber)"],
];

const CARD_HEIGHT = 460; // shared by every card so side cards match the center card's height
const GAP = -60; // negative = overlap: each card tucks partly under its neighbor instead of sitting apart
const SWIPE_THRESHOLD = 60; // px of drag before a swipe counts as a navigation
const MAX_VISIBLE_DISTANCE = 2; // show active card plus 2 neighbors on each side (5 total)

/** Per-distance-from-center sizing — index 0 is the active card, 1 is the immediate neighbor, 2 is the outer neighbor. */
const TIERS = [
  { width: 420, opacity: 1, scale: 1 },
  { width: 240, opacity: 0.65, scale: 0.86 },
  { width: 160, opacity: 0.35, scale: 0.74 },
] as const;

/** Distance from the center, in px, of each tier's card center — derived from GAP + the actual widths so the
 *  empty space between adjacent card edges stays constant no matter how much each tier shrinks. */
const CENTER_OFFSETS: number[] = TIERS.reduce<number[]>((offsets, tier, i) => {
  if (i === 0) return [0];
  const prevHalf = TIERS[i - 1].width / 2;
  const currHalf = tier.width / 2;
  return [...offsets, offsets[i - 1] + prevHalf + GAP + currHalf];
}, []);

/** Shortest signed distance from `index` to `active` around a circular track of length `length`. */
function circularDiff(index: number, active: number, length: number) {
  let diff = index - active;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

interface SlideCardProps {
  project: Project;
  index: number;
  diff: number;
  onSelect: () => void;
  onOpen: (project: Project) => void;
}

/** One card in the slider — full-size and opaque at diff===0, smaller and dimmed at diff===±1. */
function SlideCard({ project, index, diff, onSelect, onOpen }: SlideCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(project.image) && !imageFailed;
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [c1, c2] = ACCENTS[index % ACCENTS.length];
  const distance = Math.min(Math.abs(diff), TIERS.length - 1);
  const tier = TIERS[distance];
  const isActive = diff === 0;
  const isNear = distance === 1;
  const isVisible = Math.abs(diff) <= MAX_VISIBLE_DISTANCE;

  const pillBg = `color-mix(in srgb, ${c1} 22%, var(--color-bg))`;
  const pillBorder = `color-mix(in srgb, ${c1} 55%, var(--color-border))`;
  const pillText = `color-mix(in srgb, ${c1} 80%, var(--color-text-primary))`;
  const tintedBg = `linear-gradient(160deg, color-mix(in srgb, ${c1} 10%, var(--color-bg-elevated)) 0%, color-mix(in srgb, ${c2} 6%, var(--color-bg-elevated)) 55%, var(--color-bg-elevated) 100%)`;

  // Mouse-tracked glow, only meaningful on the active card.
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { damping: 22, stiffness: 240 });
  const sy = useSpring(my, { damping: 22, stiffness: 240 });
  const glowBg = useMotionTemplate`radial-gradient(circle 320px at ${sx}px ${sy}px, color-mix(in srgb, ${c1} 16%, transparent) 0%, color-mix(in srgb, ${c2} 8%, transparent) 45%, transparent 68%)`;

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isActive || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }
  function onMouseLeave() {
    setHovered(false);
    mx.set(-600); my.set(-600);
  }

  function handleClick() {
    if (isActive) onOpen(project);
    else onSelect();
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      className={cn("absolute top-0 left-1/2 flex flex-col overflow-hidden rounded-3xl border cursor-pointer")}
      style={{
        height: CARD_HEIGHT,
        width: tier.width,
        backgroundImage: tintedBg,
        borderColor: `color-mix(in srgb, ${c1} ${isActive ? 45 : isNear ? 22 : 12}%, var(--color-border-strong))`,
        boxShadow: isActive
          ? `0 24px 60px -16px color-mix(in srgb, ${c1} 38%, transparent), 0 10px 24px -14px rgba(45,36,32,0.25)`
          : `0 10px 30px -12px color-mix(in srgb, ${c1} ${isNear ? 20 : 10}%, transparent)`,
      }}
      animate={{
        x: Math.sign(diff) * CENTER_OFFSETS[distance] - tier.width / 2,
        scale: tier.scale,
        opacity: isVisible ? tier.opacity : 0,
        zIndex: 20 - distance,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      onClick={handleClick}
      role="button"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      aria-label={isActive ? `View details for ${project.title}` : `Show ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Mouse-tracked glow (active card only) */}
      {isActive && (
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{ backgroundImage: glowBg }} />
      )}

      {/* Top accent bar */}
      <motion.div
        aria-hidden="true"
        className="relative z-20 w-full shrink-0"
        style={{ height: isActive ? 5 : isNear ? 4 : 3, background: `linear-gradient(90deg, ${c1}, ${c2})` }}
        animate={{ opacity: isActive && hovered ? 1 : isActive ? 1 : isNear ? 0.7 : 0.45 }}
        transition={{ duration: 0.3 }}
      />

      {/* Image */}
      <div className="relative z-20 w-full shrink-0 overflow-hidden bg-bg-elevated-2" style={{ height: isActive ? "50%" : "44%" }}>
        {showImage ? (
          <Image
            src={project.image as string}
            alt={`${project.title} cover`}
            fill
            sizes="440px"
            className={cn("object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", isActive && hovered && "scale-[1.05]")}
            onError={() => setImageFailed(true)}
            draggable={false}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${c1} 10%, var(--color-bg-elevated-2))` }}
          >
            <span
              className="select-none font-mono text-4xl font-bold"
              style={{ color: `color-mix(in srgb, ${c1} 35%, transparent)` }}
              aria-hidden="true"
            >
              {getInitials(project.title)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <p
          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold"
          style={{ color: pillText }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c1 }} aria-hidden="true" />
          {project.tagline}
        </p>

        <h3
          className={cn(
            "line-clamp-2 font-bold leading-snug text-text-primary transition-colors duration-200",
            isActive ? "text-xl sm:text-2xl" : isNear ? "text-base" : "text-[13px]"
          )}
        >
          {project.title}
        </h3>

        {isActive && (
          <p className="line-clamp-3 text-[13px] leading-relaxed text-text-secondary">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {project.tech.slice(0, isActive ? 5 : isNear ? 3 : 2).map((t) => (
            <span
              key={t}
              className="rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium"
              style={{ backgroundColor: pillBg, borderColor: pillBorder, color: pillText }}
            >
              {t}
            </span>
          ))}
        </div>

        {isActive && (
          <div className="mt-auto flex items-center gap-2 pt-3">
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
        )}
      </div>

      {/* Animated bottom accent bar — fills in on hover of the active card */}
      {isActive && (
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 z-20 h-[2px] w-full"
          style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
          initial={{ scaleX: 0, originX: "left" }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </motion.div>
  );
}

interface ProjectsSliderProps {
  onOpen: (project: Project) => void;
}

/** The 3D/focused-perspective carousel: arrows, side-card clicks, swipe, and keyboard arrows all navigate. Loops circularly. */
function ProjectsSlider({ onOpen }: ProjectsSliderProps) {
  const length = projects.length;
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => setActive(((index % length) + length) % length), [length]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x <= -SWIPE_THRESHOLD) next();
    else if (info.offset.x >= SWIPE_THRESHOLD) prev();
  }

  const visible = useMemo(
    () =>
      projects
        .map((project, index) => ({ project, index, diff: circularDiff(index, active, length) }))
        .filter((v) => Math.abs(v.diff) <= MAX_VISIBLE_DISTANCE),
    [active, length]
  );

  return (
    <div className="relative flex flex-col items-center gap-6">
      <div className="relative w-full overflow-hidden" style={{ height: CARD_HEIGHT, perspective: 1200 }}>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence initial={false}>
            {visible.map(({ project, index, diff }) => (
              <SlideCard
                key={project.slug}
                project={project}
                index={index}
                diff={diff}
                onSelect={() => goTo(active + diff)}
                onOpen={onOpen}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Nav arrows + dots */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous project"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent-violet bg-accent-violet text-white transition-colors hover:bg-accent-violet/85"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1.5">
          {projects.map((p, i) => {
            const [dotC1] = ACCENTS[i % ACCENTS.length];
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${p.title}`}
                aria-current={i === active}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === active ? 24 : 6,
                  backgroundColor: i === active ? dotC1 : `color-mix(in srgb, ${dotC1} 35%, var(--color-border-strong))`,
                }}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next project"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent-violet bg-accent-violet text-white transition-colors hover:bg-accent-violet/85"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
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
            <MarkerHighlight>Things I&apos;ve <span className="scribble-underline">built</span></MarkerHighlight>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[15px] leading-relaxed text-text-secondary">
            From AI-powered platforms to 3D simulators, swipe through the projects below.
          </motion.p>
        </Reveal>
        <ProjectsSlider onOpen={setActiveProject} />
      </Container>

      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}