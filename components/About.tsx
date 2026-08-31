"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Code2,
  Braces,
  Database,
  Globe2,
  Cpu,
  Palette,
  Sparkles,
} from "lucide-react";

import {
  Container,
  TagLabel,
  Button,
  MarkerHighlight,
  CornerBrackets,
} from "@/components/UI";

import { Reveal } from "@/components/Animations";
import { personal, strengths } from "@/lib/data";
import { fadeUp, staggerContainer, tokenReveal } from "@/lib/motion";
import { useReducedMotion, useFinePointer } from "@/lib/hooks";

export function About() {
  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();
  const cardRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const gx = useSpring(mx, {
    damping: 26,
    stiffness: 220,
  });

  const gy = useSpring(my, {
    damping: 26,
    stiffness: 220,
  });

  const maskImage = useMotionTemplate`
    radial-gradient(
      340px circle at ${gx}px ${gy}px,
      rgba(138,90,82,0.08),
      transparent 60%
    )
  `;

  function onCardMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current || reducedMotion || !isFinePointer) return;

    const r = cardRef.current.getBoundingClientRect();

    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  function onCardLeave() {
    mx.set(-300);
    my.set(-300);
  }

  return (
    <section
      id="about"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      {/* Ambient background glow */}
      <motion.div
        aria-hidden="true"
        className="absolute right-[-6%] top-20 h-64 w-64 rounded-full opacity-[0.12] blur-[100px] sm:h-80 sm:w-80"
        style={{
          background: "var(--color-accent-amber)",
        }}
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, -20, 10, 0],
                y: [0, 15, -10, 0],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 24,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      <motion.div
        aria-hidden="true"
        className="absolute -left-12 bottom-16 h-56 w-56 rounded-full opacity-[0.1] blur-[90px] sm:h-72 sm:w-72"
        style={{
          background: "var(--color-accent-pink)",
        }}
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, 25, -15, 0],
                y: [0, -15, 20, 0],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 30,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }
        }
      />

      <Container>
        <Reveal className="flex flex-col gap-6">

          {/* Section label */}
          <motion.div variants={fadeUp}>
            <TagLabel>about</TagLabel>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={tokenReveal}
            className="inline-block -mt-2 w-fit text-6xl leading-none md:text-7xl"
          >
            <MarkerHighlight>
              About <span className="shimmer-text">Me</span>
            </MarkerHighlight>
          </motion.h2>

          {/* About card */}
          <motion.div
            ref={cardRef}
            onMouseMove={onCardMove}
            onMouseLeave={onCardLeave}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
            }}
            className="glass-elevated curl-corner group relative w-full max-w-[1200px] overflow-hidden rounded-3xl px-6 py-5 sm:px-10 sm:py-6 notebook-lines"
            style={{
              transformPerspective: 1200,
            }}
          >
            {/* Mouse-follow glow */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: maskImage,
              }}
            />

            {/* Corner decoration */}
            <CornerBrackets className="opacity-60" />

            {/* Tape */}
            <motion.div
              aria-hidden="true"
              className="tape"
              style={{
                top: "-10px",
                left: "30px",
                transform: "rotate(-8deg)",
              }}
            />

            {/* Main content — text on the LEFT, avatar on the RIGHT */}
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">

              {/* =========================================
                  ABOUT TEXT (now first / left)
              ========================================= */}
              <motion.div
                variants={fadeUp}
                className="relative z-10 order-2 lg:order-1"
              >
                <p className="w-full text-left text-body-lg leading-relaxed">
                  {personal.summary}
                </p>

                {/* Small visual signature */}
                <motion.div
                  className="mt-6 flex items-center gap-3 text-sm text-text-secondary"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: 0.3,
                  }}
                >

                  <span>
                    Building things with curiosity &amp; creativity.
                  </span>
                </motion.div>
              </motion.div>

              {/* =========================================
                  AVATAR + FLOATING TECH ICONS (now second / right)
              ========================================= */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: 25,
                  scale: 0.96,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                  margin: "-60px",
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative mx-auto h-[360px] w-full max-w-[390px] sm:h-[400px] order-1 lg:order-2"
              >

                {/* Soft avatar glow */}
                <motion.div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-amber/20 blur-3xl"
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          scale: [1, 1.08, 1],
                          opacity: [0.45, 0.65, 0.45],
                        }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Decorative paper circle */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-[280px] w-[270px] -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] rounded-[45%] border-2 border-accent-pink/20 bg-accent-amber/10"
                />

                {/* =====================================
                    AVATAR IMAGE
                    NOTE: new avatar is a full-body illustration,
                    so we use object-contain (not cover) so the
                    whole character shows instead of being cropped,
                    and drop the frame's opaque background so the
                    image's own background blends in.
                ===================================== */}
                <motion.div
                  className="absolute left-1/2 top-1/2 z-10 h-[330px] w-[265px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[45%] border-2 border-white/50 bg-[#f4e8d8] shadow-[0_25px_70px_rgba(60,40,35,0.18)]"
                  whileHover={
                    reducedMotion
                      ? undefined
                      : {
                          rotate: 1.5,
                          scale: 1.02,
                        }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 18,
                  }}
                >
                  <img
                    src="/images/it-girl-avatar.png"
                    alt="Illustrated developer avatar"
                    className="h-full w-full object-contain object-bottom"
                  />

                  {/* Soft overlay (lightened so it doesn't wash out the flat-color illustration) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5"
                  />
                </motion.div>

                {/* =====================================
                    FLOATING ICON 1 — CODE
                ===================================== */}
                <FloatingIcon
                  className="left-2 top-12 rotate-[-10deg]"
                  delay={0}
                  reducedMotion={reducedMotion}
                >
                  <Code2 size={26} strokeWidth={2.2} />
                </FloatingIcon>

                {/* =====================================
                    FLOATING ICON 2 — BRACES
                ===================================== */}
                <FloatingIcon
                  className="right-2 top-20 rotate-[8deg]"
                  delay={0.6}
                  reducedMotion={reducedMotion}
                >
                  <Braces size={25} strokeWidth={2.2} />
                </FloatingIcon>

                {/* =====================================
                    FLOATING ICON 3 — DATABASE
                ===================================== */}
                <FloatingIcon
                  className="left-0 top-[45%] rotate-[7deg]"
                  delay={1.2}
                  reducedMotion={reducedMotion}
                >
                  <Database size={25} strokeWidth={2.2} />
                </FloatingIcon>

                {/* =====================================
                    FLOATING ICON 4 — GLOBE
                ===================================== */}
                <FloatingIcon
                  className="right-0 top-[43%] rotate-[-8deg]"
                  delay={1.8}
                  reducedMotion={reducedMotion}
                >
                  <Globe2 size={25} strokeWidth={2.2} />
                </FloatingIcon>

                {/* =====================================
                    FLOATING ICON 5 — CPU
                ===================================== */}
                <FloatingIcon
                  className="left-8 bottom-12 rotate-[-8deg]"
                  delay={2.2}
                  reducedMotion={reducedMotion}
                >
                  <Cpu size={24} strokeWidth={2.2} />
                </FloatingIcon>

                {/* =====================================
                    FLOATING ICON 6 — DESIGN
                ===================================== */}
                <FloatingIcon
                  className="right-8 bottom-14 rotate-[9deg]"
                  delay={2.8}
                  reducedMotion={reducedMotion}
                >
                  <Palette size={24} strokeWidth={2.2} />
                </FloatingIcon>

                {/* =====================================
                    SPARKLE
                ===================================== */}
                <motion.div
                  aria-hidden="true"
                  className="absolute right-[18%] top-[5%] z-20 text-accent-pink"
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          rotate: [0, 12, -8, 0],
                          scale: [1, 1.15, 1],
                        }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles size={25} />
                </motion.div>

                {/* Small decorative dots */}
                <div className="absolute left-[17%] top-[25%] z-20 h-3 w-3 rounded-full bg-accent-amber shadow-sm" />

                <div className="absolute right-[13%] bottom-[30%] z-20 h-2.5 w-2.5 rounded-full bg-accent-pink shadow-sm" />

                {/* =====================================
                    HELLO / BUILDER STICKER
                ===================================== */}
                <motion.div
                  className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rotate-[-3deg] whitespace-nowrap rounded-full border border-accent-pink/30 bg-[#fff8eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-pink shadow-md"
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          y: [0, -5, 0],
                        }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <span className="mr-1">✦</span>
                  design + code
                </motion.div>

              </motion.div>

            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeUp}
            className="text-caption flex items-center gap-2 pt-2"
          >
            <span className="inline-block h-px w-8 bg-border-strong" />

            scroll

            <span className="inline-block h-px w-8 bg-border-strong" />

          </motion.div>

          {/* Strengths */}
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              margin: "-60px",
            }}
            className="flex flex-wrap gap-2 pt-1"
          >
            {strengths.map((strength, i) => (
              <motion.span
                key={strength}
                variants={fadeUp}
                whileHover={{
                  y: -4,
                  scale: 1.05,
                  rotate: i % 2 ? -1.2 : 1.2,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
                className="group/chip relative cursor-default rounded-full border-2 border-border bg-bg-elevated px-4 py-1.5 text-xs font-medium text-text-secondary shadow-sm transition-colors hover:border-accent-pink/60 hover:text-accent-pink"
              >
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gradient-aurora" />

                {strength}
              </motion.span>
            ))}
          </motion.div>

          {/* Resume button */}
          <motion.div variants={fadeUp} className="pt-2">
            <Button
              href={personal.resumeUrl}
              cursorLabel="RESUME"
              download
            >
              Download Resume
            </Button>
          </motion.div>

        </Reveal>
      </Container>
    </section>
  );
}

/* =====================================================
   FLOATING ICON COMPONENT
===================================================== */

function FloatingIcon({
  children,
  className,
  delay,
  reducedMotion,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute z-30 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-[#fff8eb]/90 text-[#5c4b45] shadow-[0_12px_30px_rgba(60,40,35,0.14)] backdrop-blur-sm ${className}`}
      initial={{
        opacity: 0,
        scale: 0.7,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={{
        once: true,
      }}
      animate={
        reducedMotion
          ? undefined
          : {
              y: [0, -7, 0],
              rotate: [0, 2, 0],
            }
      }
      transition={{
        opacity: {
          duration: 0.5,
          delay,
        },
        scale: {
          duration: 0.5,
          delay,
          ease: [0.16, 1, 0.3, 1],
        },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        rotate: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      }}
    >
      {children}
    </motion.div>
  );
}