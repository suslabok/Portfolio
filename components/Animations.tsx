"use client";

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
