"use client";

import { useEffect, useRef, useState } from "react";
import type { HTMLMotionProps } from "framer-motion";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { MousePointer2 } from "lucide-react";
import { cursorSpring, easeOutExpo, easeOutQuart, staggerContainer, viewportOnce } from "@/lib/motion";
import { useReducedMotion, useFinePointer } from "@/lib/hooks";

export type RevealProps = HTMLMotionProps<"div"> & {
  stagger?: number;
  delayChildren?: number;
};

export function AmbientBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="grid-overlay absolute inset-0 opacity-80" />

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

/**
 * Custom cursor: a mouse-pointer cursor that follows the pointer with a
 * springy trail and tilts slightly based on movement velocity.
 *
 * Mount this once near the root of your app (e.g. in layout.tsx, alongside
 * <AmbientBackground />). It only activates on fine-pointer (mouse/trackpad)
 * devices — touch devices keep their native behaviour.
 *
 * NOTE: you also need to hide the native cursor wherever this is active,
 * e.g. in globals.css:
 *   @media (pointer: fine) {
 *     body { cursor: none; }
 *     a, button, [role="button"] { cursor: none; }
 *   }
 */
export function CustomCursor() {
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleIdRef = useRef(0);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const sx = useSpring(mx, cursorSpring);
  const sy = useSpring(my, cursorSpring);

  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-800, 800], [-18, 18]);
  const scale = useSpring(isPressed ? 0.85 : 1, { stiffness: 400, damping: 20 });

  useEffect(() => {
    if (!isFinePointer) return;

    function handleMove(e: MouseEvent) {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    }
    function handleDown(e: MouseEvent) {
      setIsPressed(true);
      const id = rippleIdRef.current++;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    }
    function handleUp() {
      setIsPressed(false);
    }
    function handleLeaveWindow() {
      setIsVisible(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseleave", handleLeaveWindow);
    };
  }, [isFinePointer, isVisible, mx, my]);

  if (!isFinePointer) return null;

  return (
    <>
      {/* Click ripples — expand outward from the click point and fade out */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            aria-hidden="true"
            initial={{ opacity: 0.45, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: easeOutQuart }}
            className="pointer-events-none fixed left-0 top-0 z-[998] h-16 w-16 rounded-full border-2"
            style={{
              left: ripple.x,
              top: ripple.y,
              translateX: "-50%",
              translateY: "-50%",
              borderColor: "var(--color-accent-violet)",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-accent-violet) 25%, transparent) 0%, transparent 70%)",
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed left-0 top-0 z-[999]"
            style={{
              x: sx,
              y: sy,
              translateX: "-50%",
              translateY: "-50%",
              rotate: reducedMotion ? 0 : rotate,
              scale,
            }}
          >
            <MousePointer2
              className="h-6 w-6 -translate-x-1 -translate-y-1 fill-[var(--color-accent-violet)] text-[var(--color-accent-violet)] drop-shadow-md"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}