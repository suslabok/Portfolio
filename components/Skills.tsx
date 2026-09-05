"use client";

import { useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiSharp,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiBootstrap,
  SiHtml5,
  SiDjango,
  SiFastapi,
  SiPostgresql,
  SiMysql,
  SiSpacy,
  SiGit,
  SiGithub,
  SiDocker,
  SiFigma,
  SiUnity,
  SiThreedotjs,
} from "react-icons/si";
import { FileCode2, MonitorSmartphone, Code2 } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Container, CornerBrackets, TagLabel, MarkerHighlight } from "@/components/UI";
import { Reveal } from "@/components/Animations";
import { fadeUp, tokenReveal, staggerContainer, viewportOnce } from "@/lib/motion";
import { skills } from "@/lib/data";
import { useReducedMotion, useFinePointer } from "@/lib/hooks";

interface ToolIcon {
  Icon: IconType;
  color: string;
}

/** Keyed by the exact label strings used in `skills` (lib/data.ts). */
const TOOL_ICONS: Record<string, ToolIcon> = {
  JavaScript: { Icon: SiJavascript, color: "#F7DF1E" },
  TypeScript: { Icon: SiTypescript, color: "#3178C6" },
  Python: { Icon: SiPython, color: "#3776AB" },
  "C++": { Icon: SiCplusplus, color: "#00599C" },
  "C#": { Icon: SiSharp, color: "#239120" },
  "React.js": { Icon: SiReact, color: "#61DAFB" },
  "Next.js": { Icon: SiNextdotjs, color: "#000000" },
  "Tailwind CSS": { Icon: SiTailwindcss, color: "#06B6D4" },
  Bootstrap: { Icon: SiBootstrap, color: "#7952B3" },
  HTML5: { Icon: SiHtml5, color: "#E34F26" },
  CSS3: { Icon: FileCode2, color: "#264DE4" },
  "Responsive Design": { Icon: MonitorSmartphone, color: "#8A5A52" },
  Django: { Icon: SiDjango, color: "#092E20" },
  FastAPI: { Icon: SiFastapi, color: "#009688" },
  PostgreSQL: { Icon: SiPostgresql, color: "#4169E1" },
  MySQL: { Icon: SiMysql, color: "#4479A1" },
  "NLP / spaCy": { Icon: SiSpacy, color: "#09A3D5" },
  Git: { Icon: SiGit, color: "#F05032" },
  GitHub: { Icon: SiGithub, color: "#181717" },
  Docker: { Icon: SiDocker, color: "#2496ED" },
  "VS Code": { Icon: Code2, color: "#007ACC" },
  Figma: { Icon: SiFigma, color: "#F24E1E" },
  "Unity Engine": { Icon: SiUnity, color: "#000000" },
  "Three.js": { Icon: SiThreedotjs, color: "#000000" },
};

const DEFAULT_TOOL_ICON: ToolIcon = { Icon: Code2, color: "#8A5A52" };

interface FloatingToolProps {
  label: string;
  index: number;
  containerRef?: React.RefObject<HTMLElement | null>;
  onOpen?: (label: string) => void;
}

function FloatingTool({ label, index, containerRef, onOpen }: FloatingToolProps) {
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const { Icon, color } = TOOL_ICONS[label] ?? DEFAULT_TOOL_ICON;

  const duration = 3.2 + ((index * 37) % 22) / 10; // ~3.2s – 5.4s
  const driftY = 6 + ((index * 19) % 10); // 6px – 15px vertical
  const driftX = 3 + ((index * 29) % 7); // 3px – 9px horizontal sway
  const tilt = 4 + ((index * 13) % 6); // 4deg – 9deg tilt
  const phaseShift = (index % 4) * 0.25; // offsets the sway so it doesn't mirror the bob

  return (
    <motion.div
      variants={fadeUp}
      drag
      dragMomentum={false}
      dragElastic={0.06}
      dragConstraints={containerRef}
      dragTransition={{ bounceStiffness: 400, bounceDamping: 28 }}
      onDragStart={() => setIsActive(true)}
      onDragEnd={() => {
        setIsActive(false);
        setIsPinned(true);
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onOpen?.(label)}
      whileHover={{ scale: 1.14 }}
      whileDrag={{ scale: 1.2, zIndex: 30 }}
      animate={
        isPinned
          ? undefined
          : {
              y: [0, -driftY, 0, driftY * 0.4, 0],
              x: [0, driftX, 0, -driftX, 0],
              rotate: [0, tilt, 0, -tilt, 0],
            }
      }
      transition={
        isPinned
          ? undefined
          : {
              duration,
              delay: phaseShift,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
      style={{ touchAction: "none" }}
      className="relative flex select-none flex-col items-center gap-2 cursor-pointer active:cursor-grabbing"
    >
      {/* Shared layoutId with ToolSpotlight: this exact square grows into
          the centered card on click, rather than a new element fading in. */}
      <motion.div
        layoutId={`tool-icon-${label}`}
        className="glass-elevated flex h-16 w-16 items-center justify-center rounded-2xl transition-shadow duration-200 sm:h-20 sm:w-20"
        style={{
          boxShadow: isActive || isHovered ? `0 0 0 2px ${color}55, var(--shadow-elevated-lg)` : undefined,
        }}
      >
        <Icon aria-hidden="true" style={{ color }} className="h-8 w-8 sm:h-9 sm:w-9" />
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="glass pointer-events-none absolute -bottom-7 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.65rem] font-medium text-text-secondary"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getScatterPosition(index: number, total: number) {
  const goldenAngle = 137.50776;
  const angle = index * goldenAngle * (Math.PI / 180);
  const radius = Math.sqrt((index + 0.5) / total);

  const jitterX = (((index * 53) % 11) - 5) * 0.6;
  const jitterY = (((index * 71) % 11) - 5) * 0.6;

  const rx = 44;
  const ry = 34;

  return {
    x: 50 + radius * rx * Math.cos(angle) + jitterX,
    y: 58 + radius * ry * Math.sin(angle) + jitterY,
  };
}

function FloatingTools() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [, setActiveTool] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();

  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, { damping: 24, stiffness: 220 });
  const sy = useSpring(my, { damping: 24, stiffness: 220 });
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${sx}px ${sy}px, color-mix(in srgb, var(--color-accent-violet) 22%, transparent) 0%, color-mix(in srgb, var(--color-accent-pink) 12%, transparent) 40%, transparent 70%)`;
  const glare = useMotionTemplate`radial-gradient(280px circle at ${sx}px ${sy}px, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!boxRef.current || reducedMotion || !isFinePointer) return;
    const r = boxRef.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }
  function handleLeave() {
    mx.set(-800);
    my.set(-800);
  }

  return (
    <motion.div
      ref={boxRef}
      variants={staggerContainer(0.03)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="skills-box project-card-glow group relative h-[440px] w-full overflow-hidden rounded-[2rem] sm:h-[500px] lg:h-[560px]"
      style={{ transformPerspective: 1200 }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80 mix-blend-overlay"
        style={{ backgroundImage: spotlight }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90 mix-blend-screen"
        style={{ backgroundImage: glare }}
      />

      <div className="skills-box-chrome pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-violet/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-pink/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-amber/70" />
        <span className="tag-label ml-2 text-[0.7rem] text-text-muted">~/stack</span>
      </div>

      <CornerBrackets className="opacity-80" />

      {skills.map((item, index) => {
        const { x, y } = getScatterPosition(index, skills.length);
        return (
          <div
            key={item}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <FloatingTool
              label={item}
              index={index}
              containerRef={boxRef}
              onOpen={setActiveTool}
            />
          </div>
        );
      })}
    </motion.div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden py-20 sm:py-28">
      <motion.div
        aria-hidden="true"
        className="hero-blob-2 absolute -left-16 top-16 h-64 w-64 opacity-[0.12] sm:h-80 sm:w-80"
        style={{ background: "var(--color-accent-cyan)" }}
        animate={{ x: [0, 20, -15, 0], y: [0, 15, -10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="hero-blob-3 absolute right-[-8%] bottom-24 h-60 w-60 opacity-[0.1] sm:h-72 sm:w-72"
        style={{ background: "var(--color-accent-violet)" }}
        animate={{ x: [0, -25, 15, 0], y: [0, -18, 22, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />



      <Container className="flex flex-col gap-12">
        <Reveal className="flex flex-col gap-4">
          <motion.div variants={fadeUp}>
            <TagLabel>stack</TagLabel>
          </motion.div>
          <motion.h2
            variants={tokenReveal}
            className="inline-block w-fit -mt-2 text-6xl md:text-7xl leading-none"
          >
            <MarkerHighlight>Tools I <span className="scribble-underline">build</span> with</MarkerHighlight>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-caption">
            Hover to lift, drag everything below reacts.
          </motion.p>
        </Reveal>

        <FloatingTools />

        <Reveal>
          <motion.div
            variants={fadeUp}
            className="marquee-wrapper relative mt-6 overflow-hidden rounded-full border-2 border-border-strong bg-bg-elevated/50 py-3"
          >
            <div className="marquee-loop gap-8 whitespace-nowrap px-4 text-sm text-text-muted">
              {[...skills, ...skills].map((skill, i) => (
                <span
                  key={`marquee-${i}-${skill}`}
                  className="flex items-center gap-2 font-mono tracking-wide"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-pink" />
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </Reveal>

      </Container>
    </section>
  );
}