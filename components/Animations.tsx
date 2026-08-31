"use client";

import { useCallback, useEffect, useState } from "react";
import type { HTMLMotionProps } from "framer-motion";

export type RevealProps = HTMLMotionProps<"div"> & {
  stagger?: number;
  delayChildren?: number;
};
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { cursorSpring, easeOutExpo, easeOutQuart, staggerContainer, viewportOnce } from "@/lib/motion";
import { useReducedMotion, useFinePointer } from "@/lib/hooks";

export function AmbientBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="grid-overlay absolute inset-0 opacity-50" />

      <motion.div
        className="absolute -left-[10%] top-[-15%] h-[520px] w-[520px] rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "var(--color-accent-violet)" }}
        animate={
          reducedMotion
            ? undefined
            : { x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-12%] top-[20%] h-[460px] w-[460px] rounded-full opacity-[0.14] blur-[130px]"
        style={{ background: "var(--color-accent-pink)" }}
        animate={
          reducedMotion
            ? undefined
            : { x: [0, -50, 30, 0], y: [0, 60, -30, 0], scale: [1, 0.94, 1.1, 1] }
        }
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[30%] h-[500px] w-[500px] rounded-full opacity-[0.13] blur-[140px]"
        style={{ background: "var(--color-accent-amber)" }}
        animate={
          reducedMotion
            ? undefined
            : { x: [0, 40, -60, 0], y: [0, -50, 20, 0], scale: [1, 1.06, 0.98, 1] }
        }
        transition={{ duration: 29, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

type CursorVariant = "default" | "hover" | "press";
const CURSOR_VIOLET_55 = "rgba(138, 90, 82, 0.55)";
const CURSOR_VIOLET_30 = "rgba(138, 90, 82, 0.3)";
const CURSOR_VIOLET_14 = "rgba(138, 90, 82, 0.14)";
export function CustomCursor() {
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const enabled = isFinePointer && !reducedMotion;

  const [variant, setVariant] = useState<CursorVariant>("default");
  const [label, setLabel] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const x = useSpring(mouseX, cursorSpring);
  const y = useSpring(mouseY, cursorSpring);

  const xVelocity = useVelocity(x);
  const yVelocity = useVelocity(y);

  const speedRaw = useMotionValue(0);

  function recomputeSpeed() {
    const xv = xVelocity.get();
    const yv = yVelocity.get();

    speedRaw.set(
      Math.min(
        1,
        Math.sqrt(xv * xv + yv * yv) / 900
      )
    );
  }

  useEffect(() => {
    const unsubX = xVelocity.on("change", recomputeSpeed);
    const unsubY = yVelocity.on("change", recomputeSpeed);

    return () => {
      unsubX();
      unsubY();
    };
  }, [xVelocity, yVelocity]);

  const speed = useSpring(speedRaw, {
    damping: 24,
    stiffness: 220,
  });

  const ringScale = useTransform(speed, (s) =>
    variant === "hover"
      ? 1.35 - s * 0.15
      : 1 + s * 0.25
  );

  const dotScale = useTransform(speed, (s) =>
    variant === "press"
      ? 0.7
      : 1 - s * 0.12
  );

  /*
   * Mount cursor after the first frame.
   */
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  /*
   * Cursor mouse tracking + hover detection.
   */
  useEffect(() => {
    if (!enabled || !mounted) return;

    document.documentElement.classList.add("cursor-none");

    const interactiveSelector =
      "a, button, [data-cursor-label], [data-cursor-image], [role='button']";

    const handleMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    const handleOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        interactiveSelector
      );

      if (!target) return;

      setVariant("hover");
      setLabel(target.dataset.cursorLabel ?? null);
      setPreviewImage(target.dataset.cursorImage ?? null);
    };

    const handleOut = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        interactiveSelector
      );

      if (!target) return;

      /*
       * If we're moving between elements inside the same
       * interactive element, don't reset the cursor.
       */
      const relatedTarget = event.relatedTarget as Node | null;

      if (relatedTarget && target.contains(relatedTarget)) {
        return;
      }

      setVariant("default");
      setLabel(null);
      setPreviewImage(null);
    };

    const handleDown = () => {
      setVariant("press");
    };

    const handleUp = () => {
      setVariant((current) =>
        current === "press" ? "default" : current
      );
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      document.documentElement.classList.remove("cursor-none");

      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [enabled, mounted, mouseX, mouseY]);

  if (!mounted || !enabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        left-0
        top-0
        z-[9999]
      "
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        {previewImage ? (
          /*
           * Image preview cursor
           */
          <motion.div
            key="preview"
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
            }}
            transition={{
              duration: 0.25,
              ease: easeOutQuart,
            }}
            className="
              relative
              translate-x-4
              translate-y-3
            "
          >
            <div
              className="
                h-28
                w-40
                overflow-hidden
                rounded-xl
                border
                border-border-strong
                shadow-2xl
                sm:h-32
                sm:w-48
              "
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt=""
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            </div>

            {label && (
              <span
                className="
                  tag-label
                  absolute
                  left-1/2
                  top-full
                  mt-1.5
                  -translate-x-1/2
                  whitespace-nowrap
                  border
                  border-accent-violet
                  bg-bg
                  px-2
                  py-1
                  text-[10px]
                "
              >
                {label}
              </span>
            )}
          </motion.div>
        ) : (
          /*
           * Normal cursor
           */
          <motion.div
            key="rings"
            className="relative"
          >
            {/* Inner ring */}
            <motion.span
              aria-hidden="true"
              style={{
                scale: ringScale,
              }}
              animate={{
                borderColor:
                  variant === "hover"
                    ? "var(--color-accent-violet)"
                    : variant === "press"
                    ? "var(--color-accent-pink)"
                    : CURSOR_VIOLET_55,

                opacity:
                  variant === "press"
                    ? 0.85
                    : 1,
              }}
              transition={{
                duration: 0.2,
                ease: easeOutExpo,
              }}
              className="
                absolute
                left-1/2
                top-1/2
                block
                h-9
                w-9
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border-[1.5px]
              "
            />

            {/* Outer ring */}
            <motion.span
              aria-hidden="true"
              style={{
                scale: ringScale,
              }}
              className="
                absolute
                left-1/2
                top-1/2
                block
                h-14
                w-14
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
              "
              animate={{
                borderColor:
                  variant === "hover"
                    ? CURSOR_VIOLET_30
                    : CURSOR_VIOLET_14,

                opacity:
                  variant === "press"
                    ? 0.6
                    : 0.9,
              }}
              transition={{
                duration: 0.25,
                ease: easeOutExpo,
              }}
            />

            {/* Center dot */}
            <motion.span
              aria-hidden="true"
              style={{
                scale: dotScale,
              }}
              animate={{
                backgroundColor:
                  variant === "press"
                    ? "var(--color-accent-pink)"
                    : "var(--color-accent-violet)",
              }}
              transition={{
                duration: 0.14,
                ease: easeOutExpo,
              }}
              className="
                absolute
                left-1/2
                top-1/2
                block
                h-1.5
                w-1.5
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
              "
            />

            {/* Cursor label */}
            {label && (
              <motion.span
                initial={{
                  opacity: 0,
                  y: 4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 4,
                }}
                transition={{
                  duration: 0.2,
                  ease: easeOutExpo,
                }}
                className="
                  tag-label
                  absolute
                  left-1/2
                  top-full
                  mt-3
                  -translate-x-1/2
                  whitespace-nowrap
                  border
                  border-accent-violet
                  bg-bg
                  px-2
                  py-1
                  text-[10px]
                  uppercase
                  tracking-wider
                "
              >
                {label}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
export function Reveal({ stagger = 0.1, delayChildren = 0, children, ...props }: RevealProps) {
  return (
    <motion.div
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type Ripple = { id: number; x: number; y: number };

export function Ripple() {
  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [cursorX, setCursorX] = useState<number | null>(null);

  const trailX = useMotionValue(-200);
  const trailY = useMotionValue(-200);
  const sx = useSpring(trailX, { damping: 28, stiffness: 220, mass: 0.3 });
  const sy = useSpring(trailY, { damping: 28, stiffness: 220, mass: 0.3 });

  const addRipple = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((item) => item.id !== id));
    }, 900);
  }, []);

  useEffect(() => {
    if (reducedMotion || !isFinePointer) return;

    const handleMove = (e: MouseEvent) => {
      setCursorX(e.clientX);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
    };
    const handleDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "a, button, [data-cursor-label], [role='button'], .glass, .glass-elevated, .skills-box, .polaroid"
      );
      if (interactive) addRipple(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
    };
  }, [reducedMotion, isFinePointer, addRipple, trailX, trailY]);

  if (reducedMotion || !isFinePointer) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65]">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 4.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute block h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{
              left: r.x,
              top: r.y,
              borderColor: "var(--color-accent-violet)",
              boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-accent-pink) 50%, transparent)",
            }}
          />
        ))}
      </AnimatePresence>

      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ scale: cursorX != null ? [1, 1.3, 1] : 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-5 w-5 rounded-full border"
          style={{ borderColor: "color-mix(in srgb, var(--color-accent-violet) 60%, transparent)" }}
        />
      </motion.div>
      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-accent-violet/80" />
      </motion.div>
    </div>
  );
}

export function Spotlight() {
  const reducedMotion = useReducedMotion();
  const isFinePointer = useFinePointer();
  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);

  const spring = { damping: 22, stiffness: 140, mass: 0.4 };
  const x = useSpring(mouseX, spring);
  const y = useSpring(mouseY, spring);

  const spotX = useTransform(x, (v) => v);
  const spotY = useTransform(y, (v) => v);

  useEffect(() => {
    if (reducedMotion || !isFinePointer) return;
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reducedMotion, isFinePointer, mouseX, mouseY]);

  if (reducedMotion || !isFinePointer) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <motion.div
        className="absolute h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{
          x: spotX,
          y: spotY,
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--color-accent-amber) 18%, transparent) 0%, color-mix(in srgb, var(--color-accent-pink) 10%, transparent) 45%, transparent 70%)",
          mixBlendMode: "multiply",
          filter: "blur(6px)",
        }}
      />
      <motion.div
        className="absolute h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
        style={{
          x: spotX,
          y: spotY,
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 40%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
