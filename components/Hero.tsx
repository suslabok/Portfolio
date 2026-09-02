"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Container, Button, MarkerHighlight } from "@/components/UI";
import { personal, roles } from "@/lib/data";
import { staggerContainer, tokenReveal, scrapbookWord, easeOutExpo } from "@/lib/motion";
import { useParallax, useReducedMotion, useFinePointer } from "@/lib/hooks";

function ScrollIndicator() {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

/** Cycles through `roles` on an interval; freezes on the first role if motion is reduced. */
function RoleRotator() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <motion.div
      layout
      transition={{ layout: { type: "spring", stiffness: 340, damping: 30 } }}
      className="glass relative inline-flex h-9 items-center overflow-hidden rounded-full px-4"
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={roles[index]}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: easeOutExpo }}
          className="tag-label whitespace-nowrap"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

const CONTAINER_W = 400;
const CONTAINER_H = 560;
const ANCHOR_X = CONTAINER_W / 2;
const ANCHOR_Y = 0;
const STRAP_LENGTH = 140;

function buildStrapPath(offsetX: number, offsetY: number) {
  const endX = ANCHOR_X + offsetX;
  const endY = ANCHOR_Y + STRAP_LENGTH + offsetY;
  const controlX = ANCHOR_X + offsetX * 0.55;
  const controlY = ANCHOR_Y + STRAP_LENGTH * 0.5 + offsetY * 0.2;
  return `M ${ANCHOR_X} ${ANCHOR_Y} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

function IdCard() {
  // These are the ACTUAL motion values driving the card's drag position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const strapRef = useRef<SVGPathElement>(null);

  function syncStrapPath() {
    strapRef.current?.setAttribute("d", buildStrapPath(x.get(), y.get()));
  }
  useMotionValueEvent(x, "change", syncStrapPath);
  useMotionValueEvent(y, "change", syncStrapPath);

  return (
   <div

      className="relative mx-auto w-[280px] h-[392px] sm:w-[320px] sm:h-[448px] md:mx-0 md:w-[360px] md:h-[504px] lg:w-[400px] lg:h-[560px]"
    >
    <div
      className="absolute left-0 top-0 origin-top-left scale-[0.7] sm:scale-[0.8] md:scale-[0.9] lg:scale-100"
      style={{ width: CONTAINER_W, height: CONTAINER_H }}
    >

      <div
        className="absolute h-3 w-3 -translate-x-1/2 rounded-full border-2 border-neutral-500 bg-transparent"
        style={{ left: ANCHOR_X, top: ANCHOR_Y }}
      />

      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={CONTAINER_W}
        height={CONTAINER_H}
        style={{ overflow: "visible" }}
      >
        <path
          ref={strapRef}
          id="strap-path"
          d={buildStrapPath(0, 0)}
          fill="none"
          stroke="#262626"
          strokeWidth={28}
          strokeLinecap="round"
        />
        <text fontSize="9" fontWeight="700" letterSpacing="2" fill="#a3a3a3">
          <textPath href="#strap-path" startOffset="20%">
            ID CARD
          </textPath>
        </text>
        <text fontSize="9" fontWeight="700" letterSpacing="2" fill="#a3a3a3">
          <textPath href="#strap-path" startOffset="65%">
            ID CARD
          </textPath>
        </text>
      </svg>

      {/* Draggable card dragSnapToOrigin makes it auto-return to its start position on release */}
      <motion.div
        drag
        dragSnapToOrigin
        dragElastic={0.15}
        dragConstraints={{ left: -150, right: 150, top: -30, bottom: 150 }}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 15 }}
        style={{
          x,
          y,
          left: ANCHOR_X,
          top: ANCHOR_Y + STRAP_LENGTH,
        }}
        className="absolute w-72 -translate-x-1/2 cursor-grab rounded-2xl border-[6px] border-neutral-200 bg-white p-3 shadow-2xl active:cursor-grabbing"
      >
        <div className="absolute left-1/2 top-3 h-2.5 w-8 -translate-x-1/2 rounded-full bg-neutral-300" />

        <div className="relative mt-4 h-80 w-full overflow-hidden rounded-lg bg-neutral-800">
          <Image
            src="/images/profile.jpg"
            alt="Sushma Acharya"
            fill
            sizes="288px"
            draggable={false}
            className="object-cover"
          />
        </div>
      </motion.div>

    </div>
    </div>
  );
}

function useHeroTilt(targetRef: React.RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const sx = useSpring(rotateX, { damping: 22, stiffness: 140 });
  const sy = useSpring(rotateY, { damping: 22, stiffness: 140 });

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reducedMotion || !isFinePointer || !targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 6);
    rotateX.set(py * -5);
  }
  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return { rotateX: sx, rotateY: sy, handlers: { onMouseMove, onMouseLeave } };
}

export function Hero() {
  const { x, y, handlers: parallaxHandlers } = useParallax({ strength: 14 });
  const sectionRef = useRef<HTMLElement>(null);
  const heroTilt = useHeroTilt(sectionRef);

  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();
  const blobX = useMotionValue(0);
  const blobY = useMotionValue(0);
  const blobSpringX = useSpring(blobX, { damping: 30, stiffness: 90 });
  const blobSpringY = useSpring(blobY, { damping: 30, stiffness: 90 });
  const blob2X = useSpring(useMotionValue(0), { damping: 30, stiffness: 80 });
  const blob2Y = useSpring(useMotionValue(0), { damping: 30, stiffness: 80 });

  useEffect(() => {
    if (reducedMotion || !isFinePointer) return;
    const id = window.setInterval(() => {
      blobX.set((Math.random() - 0.5) * 60);
      blobY.set((Math.random() - 0.5) * 40);
      blob2X.set((Math.random() - 0.5) * 50);
      blob2Y.set((Math.random() - 0.5) * 45);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reducedMotion, isFinePointer, blobX, blobY, blob2X, blob2Y]);

  return (
    <section
      id="home"
      ref={sectionRef}
      onMouseMove={(e) => {
        parallaxHandlers.onMouseMove?.(e);
        heroTilt.handlers.onMouseMove(e);
      }}
      onMouseLeave={() => {
        parallaxHandlers.onMouseLeave?.();
        heroTilt.handlers.onMouseLeave();
      }}
      className="relative isolate overflow-hidden pt-20 pb-10 sm:pt-16 sm:pb-14"
    >
      <motion.div
        aria-hidden="true"
        className="hero-blob absolute -left-24 top-24 h-72 w-72 opacity-20 sm:h-96 sm:w-96"
        style={{
          background: "var(--color-accent-violet)",
          x: blobSpringX,
          y: blobSpringY,
        }}
        animate={reducedMotion ? undefined : { scale: [1, 1.05, 0.98, 1] }}
        transition={reducedMotion ? undefined : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="hero-blob-2 absolute right-[-5%] top-56 h-60 w-60 opacity-15 sm:h-80 sm:w-80"
        style={{
          background: "var(--color-accent-cyan)",
          x: blob2X,
          y: blob2Y,
        }}
        animate={reducedMotion ? undefined : { scale: [1, 0.96, 1.06, 1] }}
        transition={reducedMotion ? undefined : { duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        aria-hidden="true"
        className="hero-blob-3 absolute left-[45%] bottom-0 h-56 w-56 opacity-15 sm:h-72 sm:w-72"
        style={{ background: "var(--color-accent-amber)" }}
        animate={reducedMotion ? undefined : { x: [0, 20, -20, 0], y: [0, -10, 15, 0], scale: [1, 1.04, 0.97, 1] }}
        transition={reducedMotion ? undefined : { duration: 28, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <Container className="relative z-10 grid grid-cols-1 items-center justify-between gap-12 md:grid-cols-[auto_auto] md:items-start">
        <motion.div style={{ x, y }} className="relative order-1 md:order-1">
          <IdCard />
        </motion.div>

        <motion.div
          style={{ rotateX: heroTilt.rotateX, rotateY: heroTilt.rotateY, transformPerspective: 1400 }}
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          animate="show"
          className="order-2 flex max-w-3xl flex-col items-start gap-4 md:order-2"
        >
          <motion.p variants={tokenReveal} className="flex items-center gap-2 text-2xl text-neutral-600">
            <span className="relative inline-flex h-3 w-3">
            </span>
            Hi, I am
          </motion.p>
          <motion.h1
            variants={staggerContainer(0.09, 0)}
            className="-mt-2 text-6xl md:text-7xl leading-none"
          >
            <MarkerHighlight delay={0.5}>
              <motion.span variants={scrapbookWord(0)} className="inline-block">
                <span className="shimmer-text">Sushma</span>
              </motion.span>{" "}
              <motion.span variants={scrapbookWord(1)} className="inline-block scribble-underline">
                Acharya
              </motion.span>
            </MarkerHighlight>
          </motion.h1>

          <motion.div variants={tokenReveal}>
            <RoleRotator />
          </motion.div>

          <motion.p
            variants={tokenReveal}
            className="text-body-lg max-w-xl text-balance text-neutral-600"
          >
            <span className="marker-highlight inline-block px-1">{personal.role}</span>{" "}
            at Kathmandu University
          </motion.p>
          <motion.p
            variants={tokenReveal}
            className="text-body-lg max-w-xl text-balance text-neutral-600"
          >
            Building <span className="font-semibold text-accent-pink">apps</span>,
            {" "}<span className="font-semibold text-accent-cyan">AI-powered tooling</span>, and{" "}
            <span className="font-semibold text-accent-violet">interactive 3D experiences</span>.
          </motion.p>

          <motion.div
            variants={tokenReveal}
            className="mt-2 flex flex-wrap items-center gap-4"
          >
            <Button href="#projects" cursorLabel="VIEW">
              View Projects
            </Button>
            <Button href="#contact" variant="secondary" cursorLabel="SAY HI">
              Get in Touch
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      <ScrollIndicator />
    </section>
  );
}
